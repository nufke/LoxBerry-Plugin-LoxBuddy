#!/usr/bin/env node

const express = require('express');
const cors = require('cors');
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
  const port = 4001; //TODO configure

  const logger = new Logger(syslogDbFile, logLevel);
  const app = new App(logger, logFile);
  const dataStorage = new DataStorage(app, dataFile);
  const mqttClient = new MqttClient(globalConfig, app);
  const messaging = new Messaging(config, app);

  let pmsRegistrations = dataStorage.readData();
  let loxbuddyTopic = config.mqtt.topic;

  try {
    lox2mqttConfig = require(lox2mqttConfigFile);
  }
  catch (e) {
    logger.warn('LoxBuddy - No Lox2MQTT configuration found. LoxBuddy cannot intercept notifications.');
  }

  if (!(config && config.mqtt && config.mqtt.topic)) {
    logger.error("LoxBuddy - Missing or illegal configuration. Reinstall the plugin or report this issue.");
    return;
  }

  const server = express();
  server.use(cors());         // CORS enabled for all sites
  server.use(express.json()); // requests are in JSON format

  // sample api routes for testing 
  server.get('/', (req, res) => { 
    res.json("LoxBuddy Server 0.1.0") 
  }); 

  server.post("/push", cors(), (req, res) => {
    console.log('req.body', req.body);
    _sendPushMessage(req.body);
    res.status(200).send({
      code: 200,
      status: "OK",
      message: "Push Message relayed."
    });
  });
  
  server.listen(port, () => {
    app.logger.info("LoxBuddy Server is listening on port " + port);
  });

  function _publishTopic(topic, data) {
    let payload = String(data);
    let options = { retain: true, qos: 1 };
    app.logger.debug("MQTT Client - Publish topic: " + topic + ", payload: " + payload);
    var fixedTopicName = topic.replace("+", "_").replace("#", "_")
    mqttClient.publish(fixedTopicName, payload, options);
  }

  let loxoneTopics = Object.values(lox2mqttConfig.miniserver).map( item => item.mqtt_topic_ms);
  let items = loxbuddyTopic.split(',')
  let loxbuddyTopics = items ? items : [loxbuddyTopic]; // make array in case of multiple registed topics
  let cmdTopics = loxbuddyTopics.map( item => item + '/cmd');
  let msTopics = loxoneTopics.map( item => item + '/+/globalstates/notifications'); // + is serialnr
  
  loxbuddyTopics.forEach( topic => {
    _publishTopic(topic, JSON.stringify(config)); // publish messagin configuration (output)
  });

  mqttClient.subscribe(cmdTopics); // command subscriptions (incoming)
  mqttClient.subscribe(msTopics);  // loxone  state updates (incoming)

  function _sendPushMessage(obj) {
    if (!(obj && obj.title && obj.message)) {
      app.logger.error("Messaging - Incomplete message received. Title and message body are mandatory.");
      return;
    }
    let values = Object.values(pmsRegistrations);
    if (values.length == 0) {
      app.logger.error("Messaging - Message received but no registered apps found!");
      return;
    }
    values.forEach(item => {
      messaging.postMessage(obj, item).then(resp => {
        if (resp.code == 200) app.logger.debug("Messaging - Message send to AppID: " + item.appId);
        else {
          app.logger.error("Messaging - Failed to send message to AppID: " + item.appId + " response: " + resp.status + ': ' + resp.message);
          delete pmsRegistrations[item.appId];
          app.logger.debug("Messaging - AppID " + item.appId + " removed from registry.");
          dataStorage.writeData(pmsRegistrations);
        }
      });
    });
  }

  mqttClient.on('message', function(topic, message, packet) {
    if (message.length && topic.includes(loxbuddyTopic+'/cmd')) {
      let resp = JSON.parse(message.toString());
      
      // register pmsToken for each app
      if (resp.messagingService && (resp.messagingService.ids.length == 0) && pmsRegistrations[resp.messagingService.appId]) {
        delete pmsRegistrations[resp.messagingService.appId];
        app.logger.debug("Messaging - Unregistered App: " + resp.messagingService.appId);
      }

      if (resp.messagingService && resp.messagingService.ids.length) {
        pmsRegistrations[resp.messagingService.appId] = resp.messagingService;
        app.logger.debug("Messaging - Registered App: " + resp.messagingService.appId);
      }

      if (resp.messagingService) {
        let keys = Object.keys(pmsRegistrations);
        app.logger.debug("Messaging - All registered Apps: " + (keys.length ? keys : 'none' ));
        dataStorage.writeData(pmsRegistrations);
      }

      // handle Push Messages received over MQTT via registered LoxBuddy topics
      if (resp.pushMessage) {
        _sendPushMessage(resp.pushMessage);
      }
    }

    if (message.length && topic.includes('globalstates/notifications')) {
      let resp = JSON.parse(message.toString());

      // handle Push Messages received over MQTT via registered Lox2MQTT topics
      if (resp) {
        _sendPushMessage(resp);
      }
    }

  });
};

main();
