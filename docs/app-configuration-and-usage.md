# App configuration and usage

First, the MQTT server settings should be configured. Open the menu `Settings` and specify the MQTT server IP address (most probably your LoxBerry IP address), the MQTT server websocket port, username and password. If necessary, check the MQTT widget settings on your LoxBerry. In addition, you need to subscribe to a topic (e.g. `loxone`) to receive the Loxone Miniserver structure and control state changes.

After the MQTT configuration, the App will listen to the subscribed MQTT topic. To receive control, room and category information, a Loxone Miniserver JSON structure (e.g. `LoxAPP3.json`) should be sent as string to MQTT topic `<topic>/<miniserver serial number>/structure`:

*Example:*

```
loxone/1234567890/structure '{ "msInfo": { ... }, "controls": { ... }, "cats": { ... }, "rooms": { ... } }'
```

After sending the structure, you should see all control elements in the LoxBuddy App, listed under favorites, rooms and categories.

**TIP**: The LoxBerry plugin [Lox2MQTT](https://github.com/nufke/LoxBerry-Plugin-Lox2MQTT) can be used to send an existing Loxone Miniserver structure and control updates over MQTT.
