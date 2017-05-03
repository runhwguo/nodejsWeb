import schedule from "node-schedule";

import * as Dao from "./dao";
import {getToday} from "../tool/common";
import {Task} from "../tool/model";
import {TASK_STATE} from "../model/Task";
import {refund} from "./wx_pay";
import tracer from "tracer";
import Fs from "mz/fs";
import AppRootDir from "app-root-dir";
import Path from "path";

const logger = tracer.console();

const setSchedule = () => {
  let scanRule = new schedule.RecurrenceRule();

  scanRule.minute = 4;
  scanRule.hour = 0;

  let result = null;

  let job = schedule.scheduleJob(scanRule, async () => {
    logger.log('run schedule ...');
    let result = await _offExpiredTaskAndRefund();
    logger.log(result);

    result = await _deleteUsedVerificationCode(Path.join(AppRootDir.get(), 'static/tmp/verificationCode'));
    logger.log(result);
  });
};

/**
 * 下架过期且没有被认领的任务
 * @returns {Promise.<void>}
 */
const _offExpiredTaskAndRefund = async () => {

  let today = getToday();

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

  await Dao.update(Task, {
    state: TASK_STATE.expired
  }, {
    where: expiredTaskWhere
  });

  if (expiredTasks.length > 0) {
    expiredTasks.forEach(async item => {
      // 发布任务者预付报酬
      if (item.reward > 0) {
        logger.log('refund ' + JSON.stringify(item));
        let result = await refund(item);
        logger.log(result);
      }
    });
  }
};

/**
 * 删除用过的验证码图片
 * @returns {Promise.<void>}
 * @private
 */

const _deleteUsedVerificationCode = async dir => {
  let dirList = await Fs.readdir(dir);
  let result = false;

  dirList.forEach(async item => {
    let file = Path.join(dir, item);
    let stat = await Fs.stat(file);
    if (stat.isDirectory()) {
      await _deleteUsedVerificationCode(file);
    } else if(stat.isFile()) {
      result = await Fs.unlink(file);
    }
  });

  return result;
};


export default setSchedule;

