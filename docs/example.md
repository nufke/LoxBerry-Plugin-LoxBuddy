# Example

The simple example below defines a control for the LoxBuddy App. The concept is based on the Loxone Miniserver JSON structure (`LoxAPP3.json`).

## Create the JSON structure

```json
{
    "msInfo": {
        "serialNr": "1234567890"
    },
    "controls": {
        "babf08a4-54ad-11ee-8c99-0242ac120002": {
            "name": "Example Switch",
            "type": "Switch",
            "uuidAction": "babf08a4-54ad-11ee-8c99-0242ac120002",
            "room": "babf0b56-54ad-11ee-8c99-0242ac120002",
            "cat": "babf0ca0-54ad-11ee-8c99-0242ac120002",
            "defaultRating": 0,
            "isFavorite": true,
            "isSecured": false,
            "defaultIcon": null,
            "restrictions": 0,
            "details": {
                "jLockable": false,
                "type": 71
            },
            "states": {
                "active": "babf1c40-54ad-11ee-8c99-0242ac120002"
            }
        }
    },
    "rooms": {
        "babf0b56-54ad-11ee-8c99-0242ac120002": {
            "uuid": "babf0b56-54ad-11ee-8c99-0242ac120002",
            "name": "Example Room",
            "image": "IconsFilled/sofa-1.svg",
            "defaultRating": 10,
            "isFavorite": false,
            "type": 4,
            "color": "#69C350"
        }
    },
    "cats": {
        "babf0ca0-54ad-11ee-8c99-0242ac120002": {
            "uuid": "babf0ca0-54ad-11ee-8c99-0242ac120002",
            "name": "Example Category",
            "image": "IconsFilled/lightbulb-3.svg",
            "defaultRating": 0,
            "isFavorite": false,
            "type": "undefined",
            "color": "#E4354A"
        }
    }
}
```

## Publish the JSON structure over MQTT

To get the control in the App, publish the JSON structure as string to the MQTT topic as defined in the LoxBuddy settings (e.g. `loxone`).

```
loxone/1234567890/structure <json-structure>
```

To publish this message, you can use any MQTT client, for example Node-RED. Note that the serial number of your Miniserver (`msInfo.serialNr`) should match with the sub-topic used.

After publising, you should see the control in LoxBuddy, as shown in the screenshot below:

<img src="https://github.com/nufke/LoxBerry-Plugin-LoxBuddy/blob/main/docs/screenshot_example.png" width="350">

## LoxBuddy publishes control state changes

LoxBuddy will publish a control state change over MQTT as follows:

```
loxone/1234567890/babf08a4-54ad-11ee-8c99-0242ac120002/cmd On
```

In case Lox2MQTT is used, this message is used to control your Miniserver with serial ID `1234567890` and changes the state of control with ID `babf08a4-54ad-11ee-8c99-0242ac120002`. Alternatively, you can use another MQTT client (e.g. Node-RED) to retreive the message to control another device.

## LoxBuddy subscribing to control state changes

LoxBuddy updates the control states based on incoming MQTT messages, where each control state has a unique ID. In the example above, the switch state uses ID `babf1c40-54ad-11ee-8c99-0242ac120002`. To switch on the switch over MQTT, the following message should be send:

```
loxone/1234567890/babf1c40-54ad-11ee-8c99-0242ac120002 1
```

This will toggle the switch in the LoxBuddy user interface, and it will also update the color of the icon.

Note that LoxBuddy will only update the control state, text and icon color based on **incoming messages**. So in case a control is changed in the App manually, and the other control elements are not updated, it means that communcation with the receiving end (e.g. Miniserver or Node-RED) did not process the message and acknowledge the state change by sending it back over MQTT.

