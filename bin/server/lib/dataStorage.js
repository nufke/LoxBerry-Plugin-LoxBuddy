#!/usr/bin/env node

const fs = require('fs');

var dataStorage = function(app, fileName) {
  this.app = app;
  this.fileName = fileName;
};

dataStorage.prototype.readData = function() {
  try {
    const rawData = fs.readFileSync(this.fileName);
    return JSON.parse(rawData);
  } catch (err) {
    this.app.logger.error("dataStorage -- data file not found. Creating a new empty data file.");
    fs.writeFileSync(this.fileName, JSON.stringify({}));
    return {};
  }
};

dataStorage.prototype.writeData = function(data) {
  fs.writeFileSync(this.fileName, JSON.stringify(data));
};

module.exports = dataStorage;
