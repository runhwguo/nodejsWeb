import schedule from "node-schedule";

import * as Dao from "./dao";
import {getToday} from "../tool/common";
import {Task, Bill} from "../tool/model";
import {session} from "../tool/config";
import {TASK_STATE} from "../model/Task";
import {refund, enterprisePayToUser} from "./wx_pay";
import Tracer from "tracer";
import Fs from "mz/fs";
import AppRootDir from "app-root-dir";
import Path from "path";

const console = Tracer.console();

const setSchedule = () => {
  let scanRule = new schedule.RecurrenceRule();

  scanRule.hour = 0;
  scanRule.minute = 21;

  let job = schedule.scheduleJob(scanRule, async () => {
    console.log('run schedule start...');

    console.log('run _offExpiredTaskAndRefund start...');
    await _offExpiredTaskAndRefund();
    // console.log(result);
    console.log('run _offExpiredTaskAndRefund end...');

    console.log('run _deleteUsedVerificationCode start...');
    await _deleteUsedVerificationCode(Path.join(AppRootDir.get(), 'static/tmp/verificationCode'));
    // console.log(result);
    console.log('run _deleteUsedVerificationCode end...');

    console.log('run _enterprisePayToUser start...');
    result = await _enterprisePayToUser();
    console.log(result);
    console.log('run _enterprisePayToUser end...');

    console.log('run schedule end...');
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
  console.log('过期的任务 -> ' + expiredTasks);
  let result = 0;
  if(expiredTasks.length > 0) {
    result = await Dao.update(Task, {
      state: TASK_STATE.expired
    }, {
      where: expiredTaskWhere
    });
  }
  console.log('下架过期任务 count -> '+result);

  if (expiredTasks.length > 0) {
    for(let item of expiredTasks){
      // 发布任务者预付报酬
      if (item.reward > 0) {
        console.log('refund ' + JSON.stringify(item));
        let result = await refund(item);
        console.log(result);
      }
    }
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

  for (let item of dirList) {
    let file = Path.join(dir, item);
    let stat = await Fs.stat(file);
    if (stat.isDirectory()) {
      await _deleteUsedVerificationCode(file);
    } else if(stat.isFile()) {

      if (stat.birthtime.getTime() < Date.now() - session.maxAge * 1000){
        result = await Fs.unlink(file);
        console.log('删除用过的验证码 -> '+file);
      }
    }
  }

  return result;
};

const _enterprisePayToUser = async () => {
  let bills = await Dao.findAll(Bill, {
    attributes: ['userOpenId', 'isDone', 'id', 'taskId', 'amount'],
    where: {
      isDone:false
    },
  });

  console.log('要给用户钱的订单 -> '+ JSON.stringify(bills));
  let result = false;
  // 处理每个bill
  for(let bill of bills){
    result = await enterprisePayToUser({
      openid: bill.userOpenId,
      amount: bill.amount,
      ip: '115.159.81.222'
    });
    if (result) {
      console.log('_enterprisePayToUser success = ' + bill);
    } else {
      console.log('_enterprisePayToUser fail = ' + bill);
    }
  }

  let billIds = bills.map(item=>item.id);
  // 更新每个 被处理的bill
  result = await Dao.update(Bill,{
    idDone:true
  },{
    where:{// $in
      id:{
        $in:billIds
      }
    }
  });
  console.log('更新要处理的bill单 -> '+result);
};

export default setSchedule;

