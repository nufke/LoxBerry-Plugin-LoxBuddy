// MQTT topics API, used to register the MQTT topics
// note: topic /states/# is NOT added, this is managed via nested MQTT topics

export const MqttTopics = [
  "/name",
  "/icon/#",
  "/type",
  "/room",
  "/category",
  "/isFavorite",
  "/isVisible",
  "/isSecured",
  "/order",
  "/details/#",
  "/states/#",
  "/subControls/#"
];
