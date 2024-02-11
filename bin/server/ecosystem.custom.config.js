process.env.NODE_ENV = process.env.LBHOMEDIR ? 'production' : 'development';
const path = require('path');
const directories = require('./lib/directories');

module.exports = [
  {
    name: 'LoxBuddyServer',
    script: 'loxbuddy_server.js',
    cwd: __dirname,
    env: {
      NODE_ENV: process.env.NODE_ENV
    },
    log_file: path.resolve(directories.logdir, 'loxbuddy.log'),
    pid_file: path.resolve(directories.logdir, 'loxbuddy.pid'),
    log_date_format: 'YYYY-MM-DD HH:mm Z',
    time: true,
    watch: [
      directories.config,
      path.resolve(directories.system_config, 'general.json'),
      path.resolve(directories.system_data, 'plugindatabase.json'),
    ],
    autorestart: false
  }
];
