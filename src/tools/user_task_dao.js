import Db from "./db";
import * as Dao from "./dao";
import {TASK_STATE, TASK_TYPE} from "../models/Task";
import {TASK} from "./model";

const _rawQuery = async sql => {
  return await Db.sequelize.query(sql, {
      type: Db.sequelize.QueryTypes.SELECT
    }
  );
};

const _convert2sqlGrammar = data => {
  if (Array.isArray(data)) {
    data.forEach((item, index) => {
      data[index] = `'${item}'`;
    });
    data = data.join(',');
  } else {
    data = `'${data}'`;
  }
  return data;
};

const get = async (userId, taskState = [], page) => {
  taskState = _convert2sqlGrammar(taskState);
  userId = _convert2sqlGrammar(userId);

  const LIMIT = 8;

  const sql = `select tasks.id, type, state, title, deadline from tasks,userTasks where userTasks.deletedAt is null and userTasks.userId=${userId} and userTasks.taskId=tasks.id and state  in (${taskState}) limit ${(page - 1) * LIMIT}, ${LIMIT}`;
  let result = await _rawQuery(sql);
  if (_needQueryMemberSharing(taskState)) {
    let resultOfMemberSharing = await Dao.findAll(TASK, {
      type: TASK_TYPE.member_sharing
    });

    resultOfMemberSharing.forEach((item, index) => {
      resultOfMemberSharing[index].state = '已支付';
    });
    result.push(resultOfMemberSharing);
  }

  return result;
};

const count = async (userId, taskState = []) => {
  taskState = _convert2sqlGrammar(taskState);
  userId = _convert2sqlGrammar(userId);
  const sql = `select count(*) as count from tasks,userTasks where userTasks.deletedAt is null and userTasks.userId=${userId} and userTasks.taskId=tasks.id and state in (${taskState})`;
  let result = await _rawQuery(sql);
  result = result[0].count;
  // 共享会员，查看成功，即为一个任务完成支付成功
  if (_needQueryMemberSharing(taskState)) {
    let countOfMemberSharing = await Dao.count(TASK, {
      where: {
        type: TASK_TYPE.member_sharing
      }
    });
    result += countOfMemberSharing;
  }

  return result;
};

/**
 * 是否要查询已完成的会员共享任务
 * @param taskState
 * @returns {boolean}
 * @private
 */
const _needQueryMemberSharing = taskState => {
  return taskState.indexOf(TASK_STATE.completed) + taskState.indexOf(TASK_STATE.paid) !== -2;
};

export {
  count, get
};
