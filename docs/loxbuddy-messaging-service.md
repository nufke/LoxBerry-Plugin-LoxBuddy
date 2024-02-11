# LoxBuddy Messaging Service

The LoxBuddy App supports reception of local notifications as well as push messages over the internet.

Local notifications are broadcasted over MQTT when using the [Lox2MQTT][1] plugin and messages are received by the subscribed LoxBuddy Apps. As access to the MQTT server is often only possible within the local (home) network, these notifications only reach local subscribers. Within the LoxBuddy App you can enable or disable the reception of these local notifications.

In addition, notifications are also delivered as push messages over the internet to subscribed LoxBuddy Apps, by using the [Firebase Cloud Messaging][2] (FCM) technology. The LoxBuddy plugin running on your LoxBerry will relay the local notifications as a push message to the registered Apps. Within the LoxBuddy App, you can enable or disable the reception of these push messages.

As local notifications and push messages are associated to a Miniserver control and/or state change (e.g. door bell notifiation), only the App which registered the associated Miniserver will receive the notification or push message.

*NOTE: The LoxBuddy Messaging Service is under development and may cause lost notifications or push messages, It is not production ready at this stage. Therefore no guarantee can be given on a timely delivery of these messages. Use this service at your own risk.*

## Registration

To enable reception of push messages, registration to the LoxBuddy Messaging Service is required. Please contact the developer of the LoxBuddy App for more information how to register for this service. After registration, you will receive the messaging service URL and your personal token to connect to the LoxBuddy Messaging Service. 

The messaging service URL and personal token can be filled in on the LoxBuddy plugin configuration page. In order to register a LoxBuddy App to this service, you should enable push messages in the Settings menu in the App, while you are wihin your local network (such that the App can connect to the LoxBuddy plugin via MQTT). If the App is registered successfully, the LoxBuddy plugin configuration page shows the number of registered Apps at the bottom of the page. You can enable the plugin debug option to see more detailed information on the registered Apps. 

## Data processing and protection policy

As the LoxBuddy Messaging Service is built on top of the [Firebase Cloud Messaging][2], the user should acknowledge and agree with the [Firebase Data Processing and Security Terms][3].

[1]: https://github.com/nufke/LoxBerry-Plugin-Lox2MQTT
[2]: https://firebase.google.com/docs/cloud-messaging
[3]: https://firebase.google.com/terms/data-processing-terms
