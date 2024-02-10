#!/usr/bin/env node

const directories = require('./lib/directories');
const Logger = require('loxberry-logger');
const App = require('./lib/App');
const MqttClient = require('./lib/mqttClient.js');
const DataStorage = require('./lib/dataStorage.js');
const Messaging = require('./lib/lms.js');
const crypto = require('crypto');

const configFile = `${directories.config}/default.json`;
const dataFile = `${directories.data}/loxbuddy.json`;
const logFile = `${directories.logdir}/loxbuddy.log`;
const globalConfigFile = `${directories.system_config}/general.json`;
const globalPluginDbFile = `${directories.system_data}/plugindatabase.json`;
const syslogDbFile = `${directories.syslogdir}/logs_sqlite.dat`;
const lox2mqttConfigFile = `${directories.lox2mqtt_config}/default.json`;

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
  let notifications = {};

  try {
    lox2mqttConfig = require(lox2mqttConfigFile);
  }
  catch (e) {
    logger.warn('LoxBuddy - No Lox2MQTT configuration found. LoxBuddy cannot intercept notifications.');
  }

  if (!(config && config.mqtt && config.mqtt.topic)) {
    logger.error('LoxBuddy - Missing or illegal configuration. Reinstall the plugin or report this issue.');
    return;
  }

  function _publishTopic(topic, data) {
    let payload = String(data);
    let options = { retain: true, qos: 1 };
    app.logger.debug('MQTT Client - Publish topic: ' + topic + ', payload: ' + payload);
    var fixedTopicName = topic.replace('+', '_').replace('#', '_')
    mqttClient.publish(fixedTopicName, payload, options);
  }

  let loxoneTopics = Object.values(lox2mqttConfig.miniserver).map( item => item.mqtt_topic_ms);
  let items = loxbuddyTopic.split(',')
  let loxbuddyTopics = items ? items : [loxbuddyTopic]; // make array in case of multiple registed topics
  let cmdTopics = loxbuddyTopics.map( item => item + '/cmd');
  let msTopics = loxoneTopics.map( item => item + '/+/globalstates/notifications').concat // + is serialnr
                 (loxoneTopics.map( item => item + '/+/structure'));

  // publish app topic prefix to all loxone subscribers
  loxoneTopics.forEach( topic => {
    _publishTopic(topic+ '/config', JSON.stringify(config.mqtt));
  });

  // publish messaging configuration (output)
  loxbuddyTopics.forEach( topic => {
    _publishTopic(topic, JSON.stringify(config));
  });

  mqttClient.subscribe(cmdTopics); // command subscriptions (incoming)
  mqttClient.subscribe(msTopics);  // loxone state updates (incoming)

  function _sendPushMessage(obj) {
    if (obj.ts && (Number(obj.ts) < Date.now()/1000-1*60)) {
      app.logger.error('Messaging - Notification older than 1 minute and therefore not forwarded as push message.');
      return;
    }
    if (!(obj && obj.title && obj.message)) {
      app.logger.error('Messaging - Incomplete message received. Title and message body are mandatory.');
      return;
    }
    let values = Object.values(pmsRegistrations);
    if (values.length == 0) {
      app.logger.error('Messaging - Message received but no registered apps found!');
      return;
    }
    values.forEach(item => {
      const mac = obj.mac || obj.data.mac || null;
      let found = null;
      if (mac) {
        const hash = crypto.createHash('sha256').update(mac).digest('hex');
        found = item.ids.indexOf(hash) > -1;
      }
      if ((mac==null) || found) { // hash id found, so send to app. Also if no mac given, send to all apps
        messaging.postMessage(obj, item).then(resp => {
          if (!resp) {
            app.logger.error('Messaging - Unexpected server error when sending message to AppID: ' + item.appId);
          } else {
            if (resp.code == 200) {
              app.logger.info('Messaging - Message send to AppID: ' + item.appId);
            } else {
              app.logger.error('Messaging - Failed to send message to AppID: ' + item.appId + ' response: ' + resp.status + ': ' + resp.message);
              delete pmsRegistrations[item.appId];
              app.logger.debug('Messaging - AppID ' + item.appId + ' removed from registry.');
              dataStorage.writeData(pmsRegistrations);
            }
          }
        });
      }
    });
  }

  mqttClient.on('message', function(topic, message, packet) {
    if (message.length && topic.includes(loxbuddyTopic+'/cmd')) {
      let resp = JSON.parse(message.toString());

      // register pmsToken for each app
      if (resp.messagingService && (resp.messagingService.ids.length == 0) && pmsRegistrations[resp.messagingService.appId]) {
        delete pmsRegistrations[resp.messagingService.appId];
        app.logger.debug('Messaging - Unregistered App: ' + resp.messagingService.appId);
      }

      if (resp.messagingService && resp.messagingService.ids.length) {
        pmsRegistrations[resp.messagingService.appId] = resp.messagingService;
        app.logger.debug('Messaging - Registered App: ' + resp.messagingService.appId);
      }

      if (resp.messagingService) {
        let keys = Object.keys(pmsRegistrations);
        app.logger.debug('Messaging - All registered Apps: ' + (keys.length ? keys : 'none' ));
        dataStorage.writeData(pmsRegistrations);
      }

      // handle Push Messages received over MQTT via registered LoxBuddy topics
      if (resp.pushMessage) {
        _sendPushMessage(resp.pushMessage);
      }
    }

    if (message.length && topic.includes('/structure')) {
      let resp = JSON.parse(message.toString());
      let prefix = topic.replace('structure', '');
      notifications[prefix+resp.globalStates.notifications] = true;
      Object.keys(notifications).forEach( item => mqttClient.subscribe(item));
    }

    if (message.length && (Object.keys(notifications).indexOf(topic) > -1 )) {
      let resp = JSON.parse(message.toString());
      _sendPushMessage(resp);
    }
/*
    if (message.length && topic.includes('globalstates/notifications')) {
      let resp = JSON.parse(message.toString());

      // handle Push Messages received over MQTT via registered Lox2MQTT topics
      if (resp) {
        _sendPushMessage(resp);
      }
    }
*/
  });
};

main();
