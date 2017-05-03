import schedule from "node-schedule";

import * as Dao from "./dao";
import {getToday} from "../tool/common";
import {Task, Bill} from "../tool/model";
import {session} from "../tool/config";
import {TASK_STATE} from "../model/Task";
import {refund, enterprisePayToUser} from "./wx_pay";
import tracer from "tracer";
import Fs from "mz/fs";
import AppRootDir from "app-root-dir";
import Path from "path";

const logger = tracer.console();

const setSchedule = () => {
  let scanRule = new schedule.RecurrenceRule();

  scanRule.minute = 32;
  scanRule.hour = 23;

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
 * @returns {boolean}
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

      if (stat.birthtime.getTime() < Date.now() - session.maxAge * 1000){
        result = await Fs.unlink(file);
      }
    }
  });

  return result;
};

const _enterprisePayToUser = async () => {
  let bills = await Dao.findAll(Bill, {
    attributes: ['userOpenId', 'isDone', 'id', 'taskId', 'amount'],
    where: {
      isDone:false
    },
  });
  // 处理每个bill
  for(let i = 0;i<bills.length;i++){
    let bill = bills[i];
    let result = await enterprisePayToUser({
      openid: bill.userOpenId,
      amount: bill.amount,
      ip: '115.159.81.222'
    });
    if(!result){
      console.log('_enterprisePayToUser fail = ' + bill);
    }
  }

  let billIds = bills.map(item=>item.id);
  // 更新每个 被处理的bill
  await Dao.update(Bill,{
    idDone:true
  },{
    where:{// $in
      id:{
        $in:billIds
      }
    }
  });
};

export default setSchedule;

