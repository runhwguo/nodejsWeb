import db from '../tools/db';

const STATE = {
  RELEASED_NOT_CLAIMED: 0,
  COMPLETING: 1,
  COMPLETED: 2,
  PAID: 3,
  CANCELLED: 4,
  EXPIRED: 5
};

const TYPE = {
  SUBSTITUTE_CLASS: '代课',
  SUBSTITUTE_FETCH: '代取',
  FREE_RIDE: '顺风车',
  BORROW_SOMETHING: '东西'
};

module.exports = db.defineModel('tasks', {
  publishUserId: db.STRING(50),
  type: db.STRING(20),
  deadline: db.BIGINT,
  detail: db.TEXT,
  filename: db.STRING,
  reward: db.INTEGER,
  state: {// 0:刚发布未被认领，1:认领了在完成中，2:我完成的，3:完成交易成功，4:发布者取消，5:过期没有认领
    type: db.INTEGER,
    defaultValue: STATE.RELEASED_NOT_CLAIMED
  },
  priority: {
    type: db.INTEGER,
    defaultValue: 0
  },
  receiveTaskUserId: {
    type: db.STRING(50),
    allowNull: true
  }
});

module.exports.TASK_STATE = STATE;
module.exports.TASK_TYPE = TYPE;
