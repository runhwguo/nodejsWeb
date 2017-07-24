// config files:
import productionConfig from './../config/config_production.js';
import commonConfig from './../config/config_common.js';
import testConfig from './../config/config_test.js';

console.log('Load config...');
let overrideConfig = commonConfig.project.isProduction ? productionConfig : testConfig,
    config         = Object.assign(commonConfig, overrideConfig);

export default config;
