// config files:
import productionConfig from './../config/config_production.js';
import commonConfig from './../config/config_common.js';
import testConfig from './../config/config_test.js';

let config = null;

if (process.env.NODE_ENV === 'test') {
  console.log(`Load TEST_CONFIG...`);
  config = testConfig;
} else {
  console.log(`Load PRODUCTION_CONFIG...`);
  config = productionConfig;
}

console.log(`Load COMMON_CONFIG...`);
config = Object.assign(config, commonConfig);

export default config;
