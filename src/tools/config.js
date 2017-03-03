// config files:
const defaultConfig = './../config/config_default.js';
const overrideConfig = './config/config_override.js';
const testConfig = './../config/config_test.js';

import fs from 'fs';

let config = null;

if (process.env.NODE_ENV === 'test') {
  console.log(`Load ${testConfig}...`);
  config = require(testConfig);
} else {
  console.log(`Load ${defaultConfig}...`);
  config = require(defaultConfig);
  try {
    if (fs.statSync(overrideConfig).isFile()) {
      console.log(`Load ${overrideConfig}...`);
      config = Object.assign(config, require(overrideConfig));
    }
  } catch (err) {
    console.log(`Cannot load ${overrideConfig}.`);
  }
}

module.exports = config;
