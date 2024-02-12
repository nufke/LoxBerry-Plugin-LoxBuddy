const util = require('util');
const events = require('events');

var App = function(logger, logFile) {

  process.title = 'LoxBuddyServer'; // required to restart process at OS level

  var that = this;
  this.logger = logger;
  this.logFile = logFile;

  this.logger.startLog('loxbuddy', 'LoxBuddy', this.logFile, 'LoxBuddy Server started');
  this.logger.info('LoxBuddy Server ' + process.env.npm_package_version + ' started');

  process.on('SIGINT', function() {
    that.logger.info('LoxBuddy Server try to stop');
    that.exit(0, 'SIGINT');
  });
  process.on('SIGHUP', function() {
    that.exit(0, 'SIGHUP');
  });
  process.on('SIGTERM', function() {
    that.exit(0, 'SIGTERM');
  });
};

util.inherits(App, events.EventEmitter);

App.prototype.exit = function(code, message) {
  this.emit('exit', code); // exit/close other elements
  this.logger.info('LoxBuddy Server exit - ' + message);
  this.logger.closeLog(this.logFile);
};

module.exports = App;
