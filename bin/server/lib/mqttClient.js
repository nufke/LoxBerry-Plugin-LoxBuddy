const mqtt = require('mqtt');

var mqttClient = function(globalConfig, app) {
  var url = 'mqtt://' + globalConfig.Mqtt.Brokerhost + ':' + globalConfig.Mqtt.Brokerport;
  var options = { username: globalConfig.Mqtt.Brokeruser, password: globalConfig.Mqtt.Brokerpass };
  var client = mqtt.connect(url, options);
  var errorCnt = 0;

  app.on('exit', function(code) {
    client.end();
  });

  client.on('connect', function(connack) {
    app.logger.info("MQTT Client - connect: " + JSON.stringify(connack));
    errorCnt=0;
  });

  client.on('reconnect', function() {
    app.logger.debug("MQTT Client - reconnect");
  });

  client.on('close', function() {
    if (errorCnt==0) {
      app.logger.info("MQTT Client - close");
    }
  });

  client.on('offline', function() {
    app.logger.info("MQTT Client - offline");
  });

  client.on('error', function(error) {
    if (errorCnt==0) {
      app.logger.error("MQTT Client - error: " + error);
    }
    if (errorCnt==101) {
      app.logger.error("MQTT Client - more than 100 errors received. Check your connection to the MQTT server");
    }
    errorCnt++;
  });

  client.on('message', function(topic, message, packet) {
    app.logger.debug("MQTT Client - receive topic: " + topic + ", message: " + message);
  });

  return client;
};

mqttClient.prototype.doPublish = function(topic, data) {
  let payload = String(data);
  let options = { retain: retain_message, qos: 1 };
  //app.logger.debug("MQTT Client - Publish topic: " + topic + ", payload: " + payload);
  app.logger.info("MQTT Client - Publish topic: " + topic + ", payload: " + payload);
  let fixedTopicName = topic.replace("+", "_").replace("#", "_")
  client.publish(fixedTopicName, payload, options);
  return;
};


module.exports = mqttClient;
