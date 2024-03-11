import { Injectable, OnDestroy } from '@angular/core';
import { Subscription, } from 'rxjs';
import { tap, map, filter, buffer, debounceTime } from "rxjs/operators";
import { IMqttMessage, MqttService, MqttConnectionState } from 'ngx-mqtt';
import { TranslateService } from '@ngx-translate/core';
import { Control, Structure, SubControl, Settings, MqttSettings, INITIAL_MQTT_SETTINGS } from '../interfaces/data.model'
import { MqttTopics } from '../interfaces/mqtt.api'
import { DataService } from './data.service';
import { StorageService } from './storage.service'
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class LoxBerryService
  implements OnDestroy {

  private mqttSubscription: Subscription[] = [];
  private mqttConfigSubscription: Subscription;
  private mqttTopicMapping: any = {};
  private mqttPrefixList: string[] = [];
  private registeredTopics: string[] = [];
  private loxberryMqttConnected: boolean = false;
  private mqttTopic: string = '';
  private mqttAppTopic: string = '';
  private mqttSettings: MqttSettings = INITIAL_MQTT_SETTINGS;

  constructor(
    private mqttService: MqttService,
    public translate: TranslateService,
    private dataService: DataService,
    private storageService: StorageService) {
     this.initService();

     this.mqttService.state.subscribe((s: MqttConnectionState) => {
      const connected = (s === MqttConnectionState.CONNECTED);
      if (this.loxberryMqttConnected != connected) {
        this.loxberryMqttConnected = connected;
        console.log('LoxBerry Mqtt client connection status:', connected ? 'connected' : 'disconnected');
      }
    });
  }

  private initService() {
    this.dataService.settings$.subscribe(settings => {
      // only connect if all mqtt configuration options are valid
      if ( settings && settings.mqtt
        && settings.mqtt.username
        && settings.mqtt.password
        && settings.mqtt.hostname
        && settings.mqtt.port
        && settings.mqtt.topic
        && ((settings.mqtt.username !== this.mqttSettings.username)
        || (settings.mqtt.password !== this.mqttSettings.password)
        || (settings.mqtt.hostname !== this.mqttSettings.hostname)
        || (settings.mqtt.port !== this.mqttSettings.port)
        || (settings.mqtt.topic !== this.mqttSettings.topic))
        ) {
        this.mqttTopic = settings.mqtt.topic;
        this.mqttSettings = settings.mqtt;
        if (this.loxberryMqttConnected) {
          console.log('Reconnecting to LoxBerry MQTT server; unregister topics and flush data in store...');
          this.unregisterTopics();
          this.dataService.flushStructureInStore();
          this.mqttService.disconnect();
        }
        this.connectToMqtt(settings);
      }
    });
  }

  private connectToMqtt(settings: Settings) {
    console.log('Connecting to LoxBerry MQTT server...',settings);
    const protocol = environment.production ? 'wss' : 'ws';
    this.mqttService.connect(
      {
        username: settings.mqtt.username,
        password: settings.mqtt.password,
        hostname: settings.mqtt.hostname,
        port: settings.mqtt.port,
        keepalive: 5,          // Keep alive 5s
        connectTimeout: 5000,  // Timeout period 5s
        reconnectPeriod: 5000, // Reconnect period 5s
        protocol: protocol,
      });
    this.registerStructureTopic();
    this.registerStatesTopic();
    this.registerGeneralConfig();
  }

  private registerStructureTopic() { // TODO: register more than 1
    let topic = this.mqttTopic + '/+/structure'; // + wildcard for any miniserver serial id
    console.log('Subscribe to structure topic: ', topic);
    this.mqttSubscription[0] = this.mqttService.observe(topic)
      .subscribe( (message: IMqttMessage) => {
        let msg = message.payload.toString();
        if (msg.length == 0) {
          console.log('Clear structure in store...');
          this.dataService.flushControlsInStore(message.topic.split('/')[1]); // extract serialid
        }
        else {
          this.processStructure(JSON.parse(msg), this.mqttTopic);
        }
      });
  }

  private registerGeneralConfig() {
    let topic = this.mqttTopic + '/config'
    this.mqttConfigSubscription = this.mqttService.observe(topic)
      .subscribe( (message: IMqttMessage) => {
        let msg = JSON.parse(message.payload.toString())
        if (msg && msg.topic) {
          this.mqttAppTopic = msg.topic;
          console.log('General LoxBuddy App config topic received by topic ', topic, ':', msg.topic);
          //this.sendCommand({getStructure: true});
          //console.log('Update of structure file requested.');
          this.registerAppConfig(msg.topic);
          this.mqttConfigSubscription.unsubscribe(); // we can only subscribe to a config at app once, at startup
        }
      });
  }

  private registerStatesTopic() {
    let topic = this.mqttTopic + '/+/states'
    this.mqttService.observe(topic)
      .subscribe((data: IMqttMessage) => {
        console.log('Get initial states...');
        let states = JSON.parse(data.payload.toString());
        let s = [];
        Object.keys(states).forEach(key => {
          let state = states[key];
          if (this.mqttTopicMapping[key]) { // only if entry exists in map
            s.push({
              "topic": this.mqttTopicMapping[key],
              "payload": state
            });
          }
        });
        //console.log('s', s);
        this.dataService.updateElementsInStore(s);
      });
  }
  
  private registerAppConfig(topic) {
    console.log('Subscribe to app settings topic: ', topic);
    this.mqttSubscription[1] = this.mqttService.observe(topic)
      .subscribe( (message: IMqttMessage) => {
        let msg = JSON.parse(message.payload.toString())
        console.log('LoxBuddy App settings received via topic', topic, ':', msg);
        if (msg.messaging)
          this.storageService.saveSettings({messaging: msg.messaging});
      });
  }

  // TODO: only items will be added, not removed
  private processStructure(obj: any, mqttTopic: string) {
    let structure: Structure = {
      msInfo: {},
      globalStates: {},
      categories: {},
      rooms: {},
      controls: {},
      messageCenter: {}
    };
    let iconName = '';
    let iconPath = 'assets/icons/svg'; // TODO move to configuration
    let deviceSerialNr = String(obj.msInfo.serialNr);

    if (!obj) return;

    console.log('Processing received structure...');
    structure.msInfo[deviceSerialNr] = obj.msInfo;
    structure.globalStates[deviceSerialNr] = this.processStates(obj.globalStates, 'globalStates', mqttTopic, deviceSerialNr);

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
        uuidAction: control.uuidAction,
        mqtt: mqttTopic + '/' + deviceSerialNr  + '/' + control.uuidAction + '/cmd',
        icon: { href: iconName },
        category: control.cat,
        isFavorite: (control.defaultRating > 0),
        isVisible: true,
        states: this.processStates(control.states, control.uuidAction + '/states', mqttTopic, deviceSerialNr),
        subControls: this.processSubControls(control, mqttTopic, deviceSerialNr),
        order: [
          control.name.toLowerCase().charCodeAt(0) - 86, /* order as listitem (1=highest) */
          control.name.toLowerCase().charCodeAt(0) - 86, /* order as favorite (1=highest) */
          control.isFavorite ? (11 - control.defaultRating) : 0 /* order for homepage (1=highest) */
        ]
      };
    });

    Object.keys(obj.messageCenter).forEach(key => {
      let mc = obj.messageCenter[key];
      let mcId = deviceSerialNr + '/' + mc.uuidAction;
      structure.messageCenter[mcId] =
      {
        ...mc,
        serialNr: deviceSerialNr,
        name: mc.name,
        uuidAction: mc.uuidAction,
        uuid: mc.uuidAction,
        systemStatus: null,
        states: this.processStates(mc.states, mc.uuidAction + '/states', mqttTopic, deviceSerialNr)
      };
    });

    this.dataService.updateStructureInStore(structure);
    this.registerTopics(deviceSerialNr);
    this.sendCommandRequestStates(deviceSerialNr); // make sure we get updated states after receving the structure
  }

  private processSubControls(control: Control, mqttTopic: string, serialNr: string) {
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
          states: this.processStates(subControl.states, control.uuidAction + '/subControls/' + subControl.uuidAction + '/states' , mqttTopic, serialNr)
        };
      });
    }
    return subControls;
  }

  private processStates(states: any, ctrlName: string, mqttTopic: string, serialNr: string) {
    let nstates = {};
    if (states) {
      Object.keys(states).forEach(key => {
        let state = states[key];
        if (Array.isArray(state)) { // handle array,
          let list = [];
          state.forEach( (element, index) => {
            list.push(undefined); // clear item
            let name = mqttTopic + '/' + serialNr + '/' + element;
            let name2 = serialNr + '/' + ctrlName + '/' + key + '/' + index;
            this.mqttTopicMapping[name] = name2;
            //console.log('mapping array:', name, ' -> ', name2);
            this.registerTopicPrefix(name);
          });
          nstates[key] = list;
        } else {
          nstates[key] = undefined; // clear item
          let name = mqttTopic + '/' + serialNr + '/' + states[key];
          let name2 = serialNr + '/' + ctrlName + '/' + key;
          this.mqttTopicMapping[name] = name2;
          //console.log('mapping:', name, ' -> ', name2);
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
      let fullTopicName = this.mqttTopic + '/' + serialNr + '/+' + topicName;
      if (this.registeredTopics.includes(fullTopicName)) {
        console.log("Topic already exists and ignored:", fullTopicName);
      }
      else {
        console.log("Register topic name:", fullTopicName);
        this.registeredTopics.push(fullTopicName);
        this.mqttSubscription.push(
          this.mqttService.observe(fullTopicName).pipe(
            //tap( message => console.log('message', message.topic, message.payload.toString())),
            map( message => ({ ...message, topic: message.topic.replace(this.mqttTopic+"/","") })), // TODO check removal of MQTT prefix
            filter(items => items.length > 0),
            buffer(this.mqttService.observe(fullTopicName).pipe(debounceTime(10))), // collect all transactions within 10ms
          ).subscribe( (items: IMqttMessage[]) => {
            //console.log('MQTT received: ', items[0].topic, items[0].payload.toString());
            this.dataService.updateElementsInStore(items);
            })
        );
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
        this.mqttSubscription.push(
          this.mqttService.observe(topicName).pipe(
            //tap( message => console.log('message2', message.topic, message.payload.toString())),
            map(message => ({ ...message, topic: this.mqttTopicMapping[message.topic] })),
            filter(items => items.length > 0),
            buffer(this.mqttService.observe(topicName).pipe(debounceTime(10))), // collect all transactions within 10ms
          ).subscribe( (items: IMqttMessage[]) => {
            //console.log('MQTT received: ', items[0].topic, items[0].payload.toString());
            this.dataService.updateElementsInStore(items);
            })
        );
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

  sendCommand(cmd: any) {
    this.mqttService.unsafePublish( this.mqttAppTopic + '/cmd', JSON.stringify(cmd));
    console.log('MQTT publish: ', this.mqttAppTopic + '/cmd', JSON.stringify(cmd));
  }
  
  sendCommandRequestStates(serialNr: string) {
    this.mqttService.unsafePublish( this.mqttTopic + '/' + serialNr + '/states/cmd', "1");
    console.log('MQTT publish: ', this.mqttTopic + '/' + serialNr + '/states/cmd', "1");
  }
}
