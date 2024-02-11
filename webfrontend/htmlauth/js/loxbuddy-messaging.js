// LoxBuddy Messaging Service (LMS)
// Test Push for plugin page
function testPushMessage(obj, target, config) {
  function _generate_lox_UUID() {
    return "xxxxxxxx-xxxx-6xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function(c) {
        var r = Math.random()*16|0, v = c === "x" ? r : (r&0x3|0x8);
        return v.toString(16);
    });
  }

  function _reformat_notification(obj) {
    const mac = obj.mac ? obj.mac : (obj.data && obj.data.mac ? obj.data.mac : "");
    const lvl = obj.lvl ? String(obj.lvl) : ( obj.data && obj.data.lvl ? String(obj.data.lvl) : "0");
    const uuid = obj.uuid ? obj.uuid : ( obj.data && obj.data.uuid ? obj.data.uuid : '');
    const click_action = (mac.length && uuid.length) ? (target.url + "/app/home/" + mac + "/" + uuid) : "/app/notifications";
    return {
      uid: obj.uid ? obj.uid : _generate_lox_UUID(),                 // unique message id, generated if not specified
      ts: obj.ts ? String(obj.ts) : String(Date.now()).slice(0, -3), // unix time stamp in seconds, generated if not specified
      title: obj.title,                                              // message title (mandatory)
      message: obj.message,                                          // message body (mandatory)
      type: obj.type ? String(obj.type) : "10",                      // message type or 10 (= normal message) if not specified
      mac: mac,                                                      // mac (serialnr) of the miniserver
      lvl: lvl,                                                      // level, 1 = Info, 2 = Error, 3 = SystemError, 0 = unknown
      uuid: uuid,                                                    // uuid of control, or empty string if not specified
      click_action: click_action                                     // click action / url
    }
  }

  let msg = _reformat_notification(obj);
  const url = config.messaging.url + "/send";
  const method = "POST";
  let body = {
    appId: target.appId,
    data: {
      ...msg,
      icon: target.url + "/assets/icons/icon-512x512.png",
      badge: target.url + "/assets/icons/icon-72x72bw.png",
    },
    android: {
      priority: "high"
    },
    apns: {
      headers: {
        "apns-priority": "5"
      }
    },
    webpush: {
      headers: {
        Urgency: "high"
      }
    }
  };

  let headers = {
    "Authorization": "Bearer " + config.messaging.key,
    "Accept": "application/json",
    "Content-Type": "application/json",
    "id": target.ids[0]
  };

  //console.log("Messaging - Message created: " + JSON.stringify(body));

  return fetch(url, {
    method: method,
    headers: headers,
    body:  JSON.stringify(body)
  })
  .then(response => response.json()) // return any response type
  .then(data => { console.log("Messaging - Response received: " + JSON.stringify(data)); return data; })
  .catch(error => {
    console.error("Messaging - Server error: " + JSON.stringify(error));
  });
};

