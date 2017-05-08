// config files:
const CONFIG_PREFIX = './../config/config_';

const defaultConfig = `${ CONFIG_PREFIX }default.js`;
const overrideConfig = `${ CONFIG_PREFIX }override.js`;
const testConfig = `${ CONFIG_PREFIX }test.js`;

let config = null;

if (process.env.NODE_ENV === 'test') {
  console.log(`Load ${testConfig}...`);
  config = require(testConfig);
} else {
  console.log(`Load ${defaultConfig}...`);
  config = require(defaultConfig);
}

console.log(`Load ${overrideConfig}...`);
config = Object.assign(config, require(overrideConfig));

module.exports = config;
