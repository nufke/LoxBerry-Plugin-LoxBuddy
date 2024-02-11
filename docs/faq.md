# FAQ

If your question is not listed here, please raise an [Issue].

**Q: I followed the [Getting started](./Getting-started) instructions, however, my controls are not appearing**

 * A: Open the LoxBuddy App in a Desktop browser first, and hit `F12` to open the DevTools panel, and click on the DevTools menu `Console` to see the communication between LoxBuddy and MQTT. Check for warnings or errors, and try to resolve these. In case you see the error simular to `WebSocket connection to 'ws://.../' failed`, check if you installed the LoxBerry CA root certificate on your device.

**Q: After reloading the LoxBuddy App in my browser, I get a plain text page with items like `<!DOCTYPE HTML PUBLIC "-//IETF//DTD HTML 2.0//EN"><html>...</html>`**

 * A: Clear the cache (site data) in your browser and reload the page.

**Q: The state of some controls are empty or not updated after (re)starting the App**

 * A: In case you have many controls which needs updating after (re)starting the App, you might hit a configuration limit set by your MQTT server, which defines the maximum number of outgoing QoS 1 or 2 messages that can be transmitted simultaneously. When using the LoxBerry build-in Mosquitto MQTT server, the maximum number of inflight messages is set to 200. You can increase this number in the mosquitto configuration file under option `max_inflight_messages`.

**Q: Some controls are incomplete or non-functional**

 * A: Check the [Status](https://github.com/nufke/LoxBerry-Plugin-LoxBuddy/wiki/Status) page which controls are available and supported. Alternat

[GettingStarted]: https://github.com/nufke/LoxBerry-Plugin-LoxBuddy/wiki/Getting-started
[Issue]: https://github.com/nufke/LoxBerry-Plugin-LoxBuddy/issues.
