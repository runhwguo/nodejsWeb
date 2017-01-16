// 切换到项目跟目录，然后执行命令: ./node_modules/mocha/bin/mocha
// 每个test执行前后会分别执行beforeEach()和afterEach()，以及一组test执行前后会分别执行before()和after()：
const assert = require('assert');

const hello = require('../asyncHello');

describe('#async function', () => {

    it('#async function', async () => {
        let r = await hello();
        assert.strictEqual(r, 15);
    });
});