// config files:
const CONFIG_PREFIX = './../config/config_';

const DEFAULT_CONFIG  = `${ CONFIG_PREFIX }default.js`,
      OVERRIDE_CONFIG = `${ CONFIG_PREFIX }override.js`,
      TEST_CONFIG     = `${ CONFIG_PREFIX }test.js`;

let config = null;

if (process.env.NODE_ENV === 'test') {
  console.log(`Load ${TEST_CONFIG}...`);
  config = require(TEST_CONFIG);
} else {
  console.log(`Load ${DEFAULT_CONFIG}...`);
  config = require(DEFAULT_CONFIG);
}

console.log(`Load ${OVERRIDE_CONFIG}...`);
config = Object.assign(config, require(OVERRIDE_CONFIG));

module.exports = config;
