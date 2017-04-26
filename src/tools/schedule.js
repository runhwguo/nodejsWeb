import schedule from "node-schedule";

import * as Dao from "./dao";
import {Task, TASK_STATE} from "../models/Task";
import {refund} from "./wx_pay";


const setSchedule = () => {
  let scanRule = new schedule.RecurrenceRule();

  scanRule.minute = 35;
  scanRule.hour = 20;

  let job = schedule.scheduleJob(scanRule, async () => {
    await offExpiredTaskAndRefund();
  });
};

/**
 * 下架过期且没有被认领的任务
 * @returns {Promise.<void>}
 */
const offExpiredTaskAndRefund = async () => {
  let today = new Date();
  let dd = today.getDate();
  let mm = today.getMonth() + 1; //January is 0!
  let yyyy = today.getFullYear();

  if (dd < 10) {
    dd = '0' + dd
  }

  if (mm < 10) {
    mm = '0' + mm
  }

  today = yyyy + '-' + mm + '-' + dd;

  let expiredTaskWhere = {
    deadline: {
      $lt: today
    },
    state: TASK_STATE.released_not_claimed,
  };

  let expiredTasks = await Dao.findAll(Task, {
    attributes: ['reward', 'outTradeNo'],
    where: expiredTaskWhere
  });

  expiredTasks.forEach(async item => {
    // 发布任务者预付报酬
    if (item.reward < 0) {
      await refund(item);
    }
  });

  await Dao.update(Task, {
    state: TASK_STATE.expired
  }, {
    where: expiredTaskWhere
  });
};


export default setSchedule;

