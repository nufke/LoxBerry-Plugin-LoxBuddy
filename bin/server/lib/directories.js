const directories = () => {
  // TODO: replace paths by environment variables
  return {
    config: '/opt/loxberry/config/plugins/loxbuddy',
    data: '/opt/loxberry/data/plugins/loxbuddy',
    logdir: '/opt/loxberry/log/plugins/loxbuddy',
    homedir: '/opt/loxberry',
    system_data: '/opt/loxberry/data/system',
    system_config: '/opt/loxberry/config/system',
    syslogdir: '/opt/loxberry/log/system_tmpfs'
  };
};

module.exports = directories();
