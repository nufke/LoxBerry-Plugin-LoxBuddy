import { Injectable, OnDestroy } from '@angular/core';
import { Subscription, } from 'rxjs';
import { tap, map, filter, buffer, debounceTime } from "rxjs/operators";
import { IMqttMessage, MqttService, MqttConnectionState } from 'ngx-mqtt';
import { TranslateService } from '@ngx-translate/core';
import { Control, Structure, SubControl, Settings } from '../interfaces/data.model'
import { MqttTopics } from '../interfaces/mqtt.api'
import { DataService } from './data.service';

@Injectable({
  providedIn: 'root'
})
export class LoxBerryService
  implements OnDestroy {

  private mqttSubscription: Subscription[] = [];
  private mqttTopicMapping: any = {};
  private mqttPrefixList: string[] = [];
  private registeredTopics: string[] = [];

  private loxberryMqttConnected: boolean = false;
  private loxberryMqttTopic: string = '';

  constructor(
    private mqttService: MqttService,
    public translate: TranslateService,
    private dataService: DataService) {
    this.initService();

    this.mqttService.state.subscribe((s: MqttConnectionState) => {
      this.loxberryMqttConnected = (s === MqttConnectionState.CONNECTED);
      const status = this.loxberryMqttConnected ? 'connected' : 'disconnected';
      console.log('LoxBerry Mqtt client connection status:', status);

      if (this.loxberryMqttConnected && (!this.mqttSubscription[0])) {
        this.registerStructureTopic();
      }

      // disconnected, so unsubscribe and clean local cache
      if (!this.loxberryMqttConnected) {
        this.unregisterTopics();
      }
    });
  }

  private initService() {
    this.dataService.settings$.subscribe(settings => {
      // only connect if all mqtt configuration options are valid
      if (settings
        && settings.mqtt
        && settings.mqtt.username
        && settings.mqtt.password
        && settings.mqtt.hostname
        && settings.mqtt.port
        && settings.mqtt.topic) {
        this.loxberryMqttTopic = settings.mqtt.topic;
        this.connectToMqtt(settings);
      }
    });
  }

  private connectToMqtt(settings: Settings) {
    console.log('Connecting to LoxBerry MQTT server...');
    this.mqttService.connect(
      {
        username: settings.mqtt.username,
        password: settings.mqtt.password,
        hostname: settings.mqtt.hostname,
        port: settings.mqtt.port,
        keepalive: 5,          // Keep alive 5s
        connectTimeout: 5000,  // Timeout period 5s
        reconnectPeriod: 5000, // Reconnect period 5s
        protocol: 'wss',
      });
  }

  private registerStructureTopic() { // TODO: register more than 1
    console.log('Subscribe to structure...');
    let topic = this.loxberryMqttTopic + '/+/structure'; // + wildcard for any miniserver serial id
    this.mqttSubscription[0] = this.mqttService.observe(topic)
      .subscribe( async (message: IMqttMessage) => {
        let msg = message.payload.toString();
        if (msg.length == 0) {
          console.log('Clear structure in store...');
          this.dataService.flushControlsInStore(message.topic.split('/')[1]); // extract serialid
        }
        else {
          await this.processStructure(JSON.parse(msg), this.loxberryMqttTopic);
        }
      });
  }

  // TODO: only items will be added, not removed
  private async processStructure(obj: any, mqttTopic: string) {
    let structure: Structure = {
      categories: {},
      rooms: {},
      controls: {}
    };
    let iconName = '';
    let iconPath = 'assets/icons/svg'; // TODO move to configuration
    let deviceSerialNr = obj.msInfo.serialNr;

    if (!obj) return;

    console.log('Processing received structure...');

    Object.keys(obj.cats).forEach(key => {
      let category = obj.cats[key];
      let catId = deviceSerialNr + '/' + category.uuid;
      structure.categories[catId] =
      {
        ...category,
        serialNr: deviceSerialNr,
        icon: { href: iconPath + '/' + category.image },
        isVisible: true,
        order: [
          category.name.toLowerCase().charCodeAt(0) - 86, /* order as listitem (1=highest) */
          11 - category.defaultRating                     /* order as favorite (1=highest) */
        ],
      };
    });

    Object.keys(obj.rooms).forEach(key => {
      let room = obj.rooms[key];
      let roomId = deviceSerialNr + '/' + room.uuid;
      structure.rooms[roomId] =
      {
        ...room,
        serialNr: deviceSerialNr,
        icon: {
          href: iconPath + '/' + room.image,
          color: room.color
        },
        isVisible: true,
        order: [
          room.name.toLowerCase().charCodeAt(0) - 86, /* order as listitem (1=highest) */
          11 - room.defaultRating                     /* order as favorite (1=highest) */
        ],
      };
    });

    Object.keys(obj.controls).forEach(key => {
      let control = obj.controls[key];
      let controlId = deviceSerialNr + '/' + control.uuidAction;
      if (control.defaultIcon && (control.defaultIcon.length > 0)) {
        iconName = iconPath + '/' + control.defaultIcon;
        if (iconName.search(".svg") == -1) { // file extension not found
          iconName = iconName + ".svg";
        }
      } else {
        if (control.type === 'Daytimer') {
          iconName = iconPath + '/daytimer.svg'; // TODO manage list
        }
        else {// take icon from category
          iconName = Object.values(structure.categories).find(element => element.uuid === control.cat).icon.href;
        }
      }

      structure.controls[controlId] =
      {
        ...control,
        serialNr: deviceSerialNr,
        uuid: control.uuidAction,
        mqtt: mqttTopic + '/' + deviceSerialNr  + '/' + control.uuidAction + '/cmd',
        icon: { href: iconName },
        category: control.cat,
        isFavorite: (control.defaultRating > 0),
        isVisible: true,
        states: this.processStates(control.states, control.uuidAction, mqttTopic, deviceSerialNr),
        subControls: this.processSubControls(control, mqttTopic, deviceSerialNr),
        order: [
          control.name.toLowerCase().charCodeAt(0) - 86, /* order as listitem (1=highest) */
          control.name.toLowerCase().charCodeAt(0) - 86, /* order as favorite (1=highest) */
          control.isFavorite ? (11 - control.defaultRating) : 0 /* order for homepage (1=highest) */
        ]
      };
    });

    await this.dataService.updateStructureInStore(structure);
    this.registerTopics(deviceSerialNr);
  }

  processSubControls(control: Control, mqttTopic: string, serialNr: string) {
    let subControls = {};
    if (control.subControls) {
      Object.keys(control.subControls).forEach(key => {
        let subControl = control.subControls[key];
        subControls[subControl.uuidAction] =
        {
          ...subControl,
          uuid: subControl.uuidAction,
          mqtt: mqttTopic + '/' + serialNr  + '/' + subControl.uuidAction + '/cmd',
          isVisible: true,
          states: this.processStates(subControl.states, control.uuidAction + '/subControls/' + subControl.uuidAction, mqttTopic, serialNr)
        };
      });
    }
    return subControls;
  }

  processStates(states: any, ctrlName: string, mqttTopic: string, serialNr: string) {
    let nstates = {};
    if (states) {
      Object.keys(states).forEach(key => {
        let state = states[key];
        if (Array.isArray(state)) { // handle array,
          let list = [];
          state.forEach( (element, index) => {
            list.push(undefined); // clear item
            let name = mqttTopic + '/' + serialNr + '/' + element;
            let name2 = serialNr + '/' + ctrlName + '/states/' + key + '/' + index;
            this.mqttTopicMapping[name] = name2;
            //console.log('register process state:', mqttTopic + '/' + serialNr + JSON.stringify(element), name2);
            this.registerTopicPrefix(name);
          });
          nstates[key] = list;
        } else {
          nstates[key] = undefined; // clear item
          let name = mqttTopic + '/' + serialNr + '/' + states[key];
          let name2 = serialNr + '/' + ctrlName + '/states/' + key;
          this.mqttTopicMapping[name] = name2;
          //console.log('register state2:', name, name2);
          this.registerTopicPrefix(name);
        }
      });
    }
    return nstates;
  }

  private registerTopicPrefix(value: string) {
    let prefix = value.split('/')[0];
    if (!this.mqttPrefixList.find(item => { return item === prefix })) {
      this.mqttPrefixList.push(prefix);
      console.log('Registered topic prefix: ', prefix);
    }
  }

  private registerTopics(serialNr: string) {
    MqttTopics.forEach(topicName => {
      let fullTopicName = this.loxberryMqttTopic + '/' + serialNr + '/+/+' + topicName;
      if (this.registeredTopics.includes(fullTopicName)) {
        console.log("Topic already exists and ignored:", fullTopicName);
      }
      else {
        console.log("Register topic name:", fullTopicName);
        this.registeredTopics.push(fullTopicName);
        this.mqttSubscription.push(this.mqttService.observe(fullTopicName).pipe(
          filter(items => items.length > 0),
          buffer(this.mqttService.observe(fullTopicName).pipe(debounceTime(10))), /* collect all transactions within 10ms */
        ).subscribe( async (items: IMqttMessage[]) => {
          //console.log('MQTT received: ', items.topic, items.payload.toString());
          await this.dataService.updateElementsInStore(items);
        }));
      }
    });

    this.mqttPrefixList.forEach(prefix => {
      let topicName = prefix + "/#";
      if (this.registeredTopics.includes(topicName)) {
        console.log("Topic already exists and ignored:", topicName);
      }
      else {
        console.log("Register topic name:", topicName);
        this.registeredTopics.push(topicName);
        this.mqttSubscription.push(this.mqttService.observe(topicName).pipe(
          //tap( message => console.log('message', message.topic, message.payload.toString())),
          map(message => ({ ...message, topic: this.mqttTopicMapping[message.topic] })),
          filter(items => items.length > 0),
          buffer(this.mqttService.observe(topicName).pipe(debounceTime(10))), /* collect all transactions within 10ms */
        ).subscribe( async (items: IMqttMessage[]) => {
          //console.log('MQTT received: ', items.topic, items.payload.toString());
          await this.dataService.updateElementsInStore(items);
        }));
      }
    });
  }

  private unregisterTopics(): void {
    console.log('Unsubscribe from MQTT topics...');
    this.mqttSubscription.forEach((item) => { item.unsubscribe(); });
    this.mqttSubscription = []; /* empty Subscriptions */
    this.registeredTopics = []; /* empty registered topics */
    this.mqttTopicMapping = []; /* empty mapping */
  }

  ngOnDestroy(): void {
    this.unregisterTopics();
  }

  sendMessage(obj: Control | SubControl, value: string) {
    let topic = obj.mqtt;

    if (!topic) {
      console.log('Topic ' + topic + ' not found. Nothing published.');
      return;
    }

    this.mqttService.unsafePublish(topic, value);
    console.log('MQTT publish: ', obj.name, topic, value);
  }

}