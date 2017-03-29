import db from "../tools/db";

const STATE = {
  NONE: -1,
  RELEASED_NOT_CLAIMED: 0,
  COMPLETING: 1,
  COMPLETED: 2,
  PAID: 3,
  CANCELLED: 4,
  EXPIRED: 5
};

const TYPE = {
  substitute_activity: '代活动',
  substitute_fetch: '代取',
  free_ride: '顺风车',
  goods_sharing: '物品共享',
  member_sharing: '会员共享',
  substitute_work: '代做',
};

const MINE_TYPE = {
  unfinished: '未完成任务',
  completed: '已完成任务',
  published: '发布的任务'
};


module.exports = db.defineModel('tasks', {
  publishUserId: db.STRING(50),
  type: db.STRING(20),
  deadline: db.BIGINT,
  detail: db.TEXT,
  filename: {
    type: db.STRING,
    defaultValue: ""
  },
  reward: db.INTEGER,
  state: {// 0:刚发布未被认领，1:认领了在完成中，2:我完成的，3:完成交易成功，4:发布者取消，5:过期没有认领
    type: db.INTEGER,
    defaultValue: STATE.RELEASED_NOT_CLAIMED
  }
  ,
  priority: {
    type: db.INTEGER,
    defaultValue: 0
  }
  ,
  receiveTaskUserId: {
    type: db.STRING(50),
    allowNull: true
  }
})
;

module.exports.TASK_STATE = STATE;
module.exports.TASK_TYPE = TYPE;
module.exports.MINE_TASK_TYPE = MINE_TYPE;
