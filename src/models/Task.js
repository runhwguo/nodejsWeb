import db from '../tools/db';

const STATE = {
  none: '未知',
  released_not_claimed: '认领中',
  completing: '完成中',
  completed: '已完成',
  paid: '已支付',
  cancelled: '已取消',
  expired: '已过期'
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
  type: db.STRING,
  deadline: db.STRING,
  detail: db.TEXT,
  filename: {
    type: db.STRING,
    defaultValue: ''
  },
  reward: db.INTEGER,
  state: {// 0:刚发布未被认领，1:认领了在完成中，2:我完成的，3:完成交易成功，4:发布者取消，5:过期没有认领
    type: db.STRING,
    defaultValue: Object.keys(STATE)[1]
  },
  priority: {
    type: db.INTEGER,
    defaultValue: 0
  }
});

module.exports.TASK_STATE = STATE;
module.exports.TASK_TYPE = TYPE;
module.exports.MINE_TASK_TYPE = MINE_TYPE;