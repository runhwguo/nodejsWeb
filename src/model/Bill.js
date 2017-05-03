import Db from '../tool/db';
/**
 * 企业给用户转钱的账单
 */
module.exports = Db.defineModel('bills', {
  userOpenId: Db.STRING,
  isDone: {
    type: Db.BOOLEAN,
    defaultValue: false
  },
  amount: Db.INTEGER
});