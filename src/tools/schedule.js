import schedule from "node-schedule";

import * as Dao from "./dao";
import {Task} from "../tools/model";
import {TASK_STATE} from "../models/Task";
import {refund} from "./wx_pay";
import tracer from "tracer";

const logger = tracer.console();

const setSchedule = () => {
  let scanRule = new schedule.RecurrenceRule();

  scanRule.minute = new Date().getMinutes()+1;
  scanRule.hour = new Date().getHours()+1;

  let job = schedule.scheduleJob(scanRule, async () => {
    logger.log('run schedule ...');
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
  logger.log(expiredTasks);
  if (expiredTasks.length > 0) {
    expiredTasks.forEach(async item => {
      // 发布任务者预付报酬
      if (item.reward < 0) {
        logger.log('refund ' + refundResult);
        let refundResult = await refund(item);
        logger.log(refundResult);
      }
    });

    await Dao.update(Task, {
      state: TASK_STATE.expired
    }, {
      where: expiredTaskWhere
    });
  }
};


export default setSchedule;

