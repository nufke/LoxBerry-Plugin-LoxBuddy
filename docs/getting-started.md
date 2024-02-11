# Getting started

## Install the LoxBuddy plugin

Use the standard LoxBerry plugin installation procedure to install LoxBuddy on your LoxBerry. LoxBerry 3.0 or higher is required. It is recommended to use the [latest release](https://github.com/nufke/LoxBerry-Plugin-LoxBuddy/releases).

Note: If you prefer to use the latest development version, check [this page](https://github.com/nufke/LoxBerry-Plugin-LoxBuddy/wiki/Development-environment-and-build-flow) for more information.

## Setup secure connections

As the LoxBuddy plugin deploys a Progressive Web App (PWA) on your LoxBerry, it is required that all connections from and to the App are secure using SSL/TLS. This means that the communication with LoxBerry should use `HTTPS` to render the page content and `WSS` to establish a secure websocket connection over MQTT.

Therefore it is required to install LoxBerry's root CA certificate (`cacert.cer`) as trusted certificate on each device that will communicate with LoxBuddy. You can download the LoxBerry certificate under the menu `LoxBerry Services > Webserver options`.

After installation of the certificate, you should be able to access LoxBuddy via `https://<loxberry-url>:4000`. In case you get a security warning, this means that the installation of the LoxBerry root certificate on your device was not successful.

## LoxBuddy App configuration

When the LoxBuddy page appears in your browser, it will first show an empty home page. Next step is to configure the MQTT server settings. Open the App menu `MQTT configuration` and specify the MQTT server IP address (most probably your LoxBerry IP address), the secure MQTT server websocket port, username and password. If necessary, check the MQTT widget settings on your LoxBerry. In addition, you need to subscribe to a topic (e.g. `loxone`) to receive the Loxone Miniserver structure and control state changes.

*Example:*

 * MQTT server IP address: 192.168.1.123
 * MQTT server secure websocket port: 9083
 * MQTT server username: *mqtt-server-username-here*
 * MQTT server password: *mqtt-server-password-here*
 * MQTT topic: loxone

After saving the configuration, the App will listen to the given MQTT topic. In case a published JSON structure has been retained by the MQTT server, it will be retrieved immediately and you will see you first control elements appearing in the App.

## Loading the JSON structure

To receive control, room and category information, a Loxone Miniserver compatible JSON structure (e.g. `LoxAPP3.json`) should be sent as string to MQTT topic `<topic>/<miniserver serial number>/structure`:

*Example:*

```
loxone/1234567890/structure '{ "msInfo": { ... }, "controls": { ... }, "cats": { ... }, "rooms": { ... } }'
```
A full example is given [here](./example).

After sending the structure, you should see all control elements in the LoxBuddy App, listed on the home page, rooms and categories.

**TIP**: The LoxBerry plugin [Lox2MQTT](https://github.com/nufke/LoxBerry-Plugin-Lox2MQTT) can be used to send an existing Loxone Miniserver structure and control updates over MQTT.

## Install the LoxBuddy App on your mobile or tablet

Follow these steps for an installation on Android-based devices:

 * Open the Chrome browser on your Android device.
 * Open the LoxBuddy webpage at `https://<loxberry-url>:4000`.
 * Open the Chrome menu and select *Install*.
 * Follow the on-screen instructions.

If you are using a different operating system, please check [this website](https://web.dev/learn/pwa/installation/) for the installation instructions.


