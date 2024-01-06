#!/usr/bin/env node

const directories = require('./lib/directories');
const Logger = require('loxberry-logger');
const App = require('./lib/App');
const MqttClient = require("./lib/mqttClient.js");
const DataStorage = require("./lib/dataStorage.js");
const Messaging = require("./lib/lms.js");

const configFile = `${directories.config}/default.json`;
const dataFile = `${directories.data}/loxbuddy.json`;
const logFile = `${directories.logdir}/loxbuddy.log`;
const globalConfigFile = `${directories.system_config}/general.json`;
const globalPluginDbFile = `${directories.system_data}/plugindatabase.json`;
const syslogDbFile = `${directories.syslogdir}/logs_sqlite.dat`;

const getPluginLogLevel = () => {
  let globalPluginDb = require(globalPluginDbFile);
  const pluginData = Object.values(globalPluginDb.plugins).find( (entry) => entry.name === 'loxbuddy');
  if (!pluginData) return 3; // not defined defaults to ERROR level
  return Number(pluginData.loglevel);
};

const main = () => {
  let config = require(configFile);
  let globalConfig = require(globalConfigFile);
  let logLevel = getPluginLogLevel();

  const logger = new Logger(syslogDbFile, logLevel);
  const app = new App(logger, logFile);
  const dataStorage = new DataStorage(app, dataFile);
  const mqttClient = new MqttClient(globalConfig, app);
  const messaging = new Messaging(config, app);

  let pmsRegistrations = dataStorage.readData();
  let loxbuddyTopic = config.mqtt.topic;

  function _publish_topic(topic, data) {
    let payload = String(data);
    let options = { retain: true, qos: 1 };
    app.logger.debug("MQTT Client - Publish topic: " + topic + ", payload: " + payload);
    var fixedTopicName = topic.replace("+", "_").replace("#", "_")
    mqttClient.publish(fixedTopicName, payload, options);
  }

  _publish_topic(loxbuddyTopic, JSON.stringify(config));
  let subscribeToTopics = [loxbuddyTopic + '/cmd']; // todo add more
  mqttClient.subscribe(subscribeToTopics);

  mqttClient.on('message', function(topic, message, packet) {
    if (message.length && (topic.search( loxbuddyTopic + '/cmd') > -1)) {
      let resp = JSON.parse(message.toString())
      
      // register pmsToken for each app
      if (resp.messagingService && (resp.messagingService.ids.length == 0) && pmsRegistrations[resp.messagingService.appId]) {
        delete pmsRegistrations[resp.messagingService.appId];
        app.logger.info("Messaging - Unregistered App: " + resp.messagingService.appId);
      }

      if (resp.messagingService && resp.messagingService.ids.length) {
        pmsRegistrations[resp.messagingService.appId] = resp.messagingService;
        app.logger.info("Messaging - Registered App: " + resp.messagingService.appId);
      }

      if (resp.messagingService) {
        let keys = Object.keys(pmsRegistrations);
        app.logger.info("Messaging - All registered Apps: " + (keys.length ? keys : 'none' ));
        dataStorage.writeData(pmsRegistrations);
      }

      // handle pushmessages received over MQTT
      if (resp.pushMessage) {
        if (!resp.pushMessage.title || !resp.pushMessage.message) {
          app.logger.info("Messaging - Incomplete Push Message received. Check title and message of the Push Message."); 
          return;
        }
        let values = Object.values(pmsRegistrations);
        if (values.length == 0) {
          app.logger.info("Messaging - Push message received over MQTT associated to  Miniserver with ID " + serialnr + " but no registered apps found!");
          return;
        }
        values.forEach( item => {
          messaging.postMessage(resp.pushMessage, item).then(resp => { 
            if (resp.code == 200) app.logger.info("Messaging - Push message send to AppID: " + item.appId);
            else {
              app.logger.info("Messaging - Push message failed to send to AppID: " + item.appId + " response: " + resp.status + ': ' + resp.message);
              delete pmsRegistrations[item.appId];
              app.logger.info("Messaging - AppID " + item.appId + " removed from registry.");
              dataStorage.writeData(pmsRegistrations);
            }
          });
        });
      }

      // handle pushmessages send over MQTT
      /*
      if (resp.notification && resp.notification.title && resp.notification.message) {
        const notification = _reformat_notification(resp.notification);
        const uuid = lox_mqtt_adaptor.get_globalstates_uuid_from_key('globalstates/notifications');
        _publish_topic(mqtt_topic_ms + '/' + serialnr + '/' + uuid, JSON.stringify(notification));
        } else {
          app.logger.info("Messaging - Incomplete notification received. Check title and message of the notification message.");  
        }
      } else {
        app.logger.debug("MQTT Adaptor - Publising notifications over MQTT has been disabled by the user settings");
      }*/
    }
  });
};

main();
