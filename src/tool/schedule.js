import schedule from 'node-schedule';

import * as Dao from './dao';
import {getToday} from '../tool/common';
import config from '../tool/config';
import {TASK_STATE} from '../model/Task';
import {Task, Bill} from '../tool/model';
import {enterprisePayToUser, refund} from './wx_pay';
import Tracer from 'tracer';
import Fs from 'mz/fs';
import AppRootDir from 'app-root-dir';
import Path from 'path';

const console = Tracer.console();

const job;

const startSchedule = () => {
  let scanRule = new schedule.RecurrenceRule();

  scanRule.hour = [0, 10, 12, 15, 17, 21, 22];
  let minutes   = [];
  for (let i = 0; i < 60; i++) {
    minutes.push(i);
  }
  scanRule.minute = minutes;
  scanRule.second = 0;

  job = schedule.scheduleJob(scanRule, async () => {
    console.log('run schedule start...');

    console.log('run _offExpiredTaskAndRefund start...');
    await _offExpiredTaskAndRefund();
    console.log('run _offExpiredTaskAndRefund end...');

    console.log('run _deleteUsedVerificationCode start...');
    await _deleteUsedVerificationCode(Path.join(AppRootDir.get(), 'static/tmp/verificationCode'));
    console.log('run _deleteUsedVerificationCode end...');

    console.log('run _enterprisePayToUser start...');
    await _enterprisePayToUser();
    console.log('run _enterprisePayToUser end...');

    console.log('run schedule end...');
  });
};

const cancelSchedule = () => {
  job.cancel();
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
    attributes: ['reward', 'outTradeNo', 'id'],
    where: expiredTaskWhere
  });
  console.log('下架过期任务 count -> ' + expiredTasks.length);

  expiredTasks.map(async item => {
    if (item.reward > 0) {
      console.log('refund ' + JSON.stringify(item));
      let result = await refund(item);
      console.log(result);
      if (result) {
        await Dao.update(Task, {
          state: TASK_STATE.expired
        }, {
          where: {
            id: item.id
          }
        });
      }
    }
  });
};

/**
 * 删除用过的验证码图片
 * @returns {boolean}
 * @private
 */

const _deleteUsedVerificationCode = async dir => {
  let dirList = await Fs.readdir(dir);
  let result  = false;

  for (let item of dirList) {
    let file = Path.join(dir, item);
    let stat = await Fs.stat(file);
    if (stat.isDirectory()) {
      await _deleteUsedVerificationCode(file);
    } else if (stat.isFile()) {
      if (stat.birthtime.getTime() < Date.now() - config.session.maxAge * 1000) {
        result = await Fs.unlink(file);
        console.log('删除用过的验证码 -> ' + file);
      }
    }
  }

  return result;
};

const _enterprisePayToUser = async () => {
  let bills = await Dao.findAll(Bill, {
    attributes: ['userOpenId', 'isDone', 'id', 'taskId', 'amount'],
    where: {
      isDone: false
    }
  });

  console.log('要给用户钱的订单 -> ' + JSON.stringify(bills));
  let result;
  // 处理每个bill
  for (let bill of bills) {
    let billTask = await Task.findByPrimary(bill.taskId, {
      attributes: ['title']
    });

    let taskTitle = billTask.dataValues.title;
    result        = await enterprisePayToUser({
      openid: bill.userOpenId,
      amount: bill.amount * 0.9,
      taskTitle: taskTitle
    });
    if (result) {
      console.log('_enterprisePayToUser success = ' + JSON.stringify(bill));
      await Dao.update(Bill, {
        isDone: true
      }, {
        where: {
          id: bill.id
        }
      });
    } else {
      console.log('_enterprisePayToUser fail = ' + JSON.stringify(bill));
    }
  }
};

export {
  startSchedule, cancelSchedule
};