import Db from "../tool/db";

const STATE = {
  none: '未知',
  released_not_claimed: '认领中',
  completing: '完成中',
  completed: '确认支付',// 已完成
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
  part_time_job: '兼职'
};

const MINE_TYPE = {
  unfinished: '未完成任务',
  completed: '已完成任务',
  published: '发布的任务'
};

let exportModule = Db.defineModel('tasks', {
  type: Db.STRING,
  deadline: Db.STRING,
  detail: Db.TEXT,
  filename: {
    type: Db.STRING,
    defaultValue: ''
  },
  reward: Db.INTEGER, // 正:发布任务者赏   负：发布任务者收
  state: {// 0:刚发布未被认领，1:认领了在完成中，2:我完成的，3:完成交易成功，4:发布者取消，5:过期没有认领
    type: Db.STRING,
    defaultValue: STATE.released_not_claimed
  },
  shareCount: { // 会员共享的次数，仅对会员共享有效
    type: Db.INTEGER,
    defaultValue: 1
  },
  title: Db.TEXT,
  priority: {
    type: Db.INTEGER,
    defaultValue: 0
  },
  outTradeNo: {// 商户侧传给微信的订单号 reward > 0 有效
    type: Db.STRING,
    defaultValue: ''
  }
});

exportModule = Object.assign(exportModule, {
  TASK_STATE: STATE,
  TASK_TYPE: TYPE,
  MINE_TASK_TYPE: MINE_TYPE
});

module.exports = exportModule;