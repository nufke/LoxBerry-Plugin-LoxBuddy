#!/usr/bin/env node

const fs = require('fs');
const configFile = process.env.LBPCONFIG + '/loxbuddy/default.json';
let config;

try {
  const configData = fs.readFileSync(configFile);
  config = JSON.parse(configData);
} catch (err) {
  // in case of an error, the config file is not found
  // or the content is not compliant to JSON format.
  // print, the error, but proceed with the creation of the
  // config file, since it is considered empty
  console.log(err);
}

update_config(config);

function update_config(config) {
  console.log('Update LoxBuddy config...');
  if (!config)
    config = {};

  if (!config.mqtt) {
    config['mqtt'] = 
    {
      topic: 'loxbuddy'
    };
  }

  if (!config.messaging) {
    config['messaging'] = 
    {
      url: '',
      key: ''
    };
  }

  fs.writeFileSync(configFile, JSON.stringify(config));
}
