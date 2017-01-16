// 切换到项目跟目录，然后执行命令: ./node_modules/mocha/bin/mocha
// 每个test执行前后会分别执行beforeEach()和afterEach()，以及一组test执行前后会分别执行before()和after()：
const assert = require('assert');

const sum = require('../hello');

describe('#hello.js', () => {

    // before(function () {
    //     console.log('before:');
    // });
    //
    // after(function () {
    //     console.log('after.');
    // });
    //
    // beforeEach(function () {
    //     console.log('  beforeEach:');
    // });
    //
    // afterEach(function () {
    //     console.log('  afterEach.');
    // });

    it('sum() should return 0', () => {
        assert.strictEqual(sum(), 0);
    });

    it('sum(1) should return 1', () => {
        assert.strictEqual(sum(1), 1);
    });

    it('sum(1, 2) should return 3', () => {
        assert.strictEqual(sum(1, 2), 3);
    });

    it('sum(1, 2, 3) should return 6', () => {
        assert.strictEqual(sum(1, 2, 3), 6);
    });
});