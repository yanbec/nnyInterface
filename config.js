const configFile = "./config.json";
var nconf = require('nconf');

nconf.use('file', { file: configFile });
nconf.load();

//Export functions
  exports.getGeneralConfig = getGeneralConfig;
  exports.getDeviceConfig = getDeviceConfig;

function getGeneralConfig() {
    return nconf.get('general');
}

function getDeviceConfig(device) {
  return nconf.get('devices:'+device);
}
