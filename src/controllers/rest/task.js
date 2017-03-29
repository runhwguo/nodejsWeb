import {Task} from "../../tools/model";
import {TASK_STATE, TASK_TYPE} from "../../models/Task";
import {session} from "../../tools/config";
import {uploadFile} from "../../tools/upload";
import * as Dao from "../../tools/dao";
import db from "../../tools/db";


const completedTasks = async ctx => {

};

const _judgeTaskType = ctx => {
  // 判断来源  take-task    mine-task ~ed
  let fromWhere = ctx.query.where;
  let where = {};
  if (fromWhere.endsWith('ed')) {
    where.publishUserId = ctx.state.user.id;
  } else {
    where.state = TASK_STATE.RELEASED_NOT_CLAIMED;
    if (fromWhere !== 'index') {
      where.type = fromWhere;
    }
  }
  // let type = ctx.params.type;
  // let state = TASK_STATE.NONE;
  // let where = {
  //   publishUserId: ctx.state.user.id,
  // };
  // let attributes = ['id', 'type', 'detail'];
  // if (type === 'completed') {
  //   attributes.push('reward');
  //   where.state = TASK_STATE.COMPLETED;
  // } else if (type === 'unfinished') {
  //   attributes.push('deadline');
  //   where.state = TASK_STATE.COMPLETING;
  // } else if (type === 'published') {
  //   attributes.push('state');
  // }
  // let data = await Dao.findAll(Task, {
  //   attributes: attributes,
  //   where: where
  // });
  return where;
};


const get = async ctx => {
  let page = Number.parseInt(ctx.params.page);
  let fromWhere = ctx.query.where;
  let limit = 5;
  if (fromWhere !== 'index') {
    limit = 8;
  }
  let where = _judgeTaskType(ctx);

  let tasks = await Dao.findAll(Task, {
    attributes: ['id', 'type', 'detail', 'reward'],
    where: where,
    offset: (page - 1) * limit,
    limit: limit
  });
  tasks.forEach(item => {
    item.type = TASK_TYPE[item.type];
  });
  ctx.rest({
    result: tasks
  });
};
// postman中x-www-form-urlencoded下才能获取数据
const stick = async ctx => {
  let taskId = ctx.params.id;
  let result = await Dao.update(Task, {
    priority: db.literal('priority+1')
  }, {
    where: {
      id: taskId
    }
  });
  ctx.rest({
    result: result
  });
};

const publish = async ctx => {
  let user = ctx.state.user;
  let userId = user.id;

  const serverFilePath = 'static/tmp';
  // 上传文件事件
  let getRandomInt = (min, max) => {
    return Math.floor(Math.random() * (max - min + 1) + min);
  };
  let firstDir = getRandomInt(0, 9);
  let secondDir = getRandomInt(0, 9);
  let result = await uploadFile(ctx, {
    fileType: `taskImage/${firstDir}/${secondDir}`,
    path: serverFilePath
  });
  result.data.publishUserId = userId;
  result.data.deadline = new Date(result.data.deadline).getTime();

  let isOK = await Dao.create(Task, result.data);
  ctx.rest({
    result: !!isOK
  });
};

const count = async ctx => {

  let where = _judgeTaskType(ctx);

  let count = await Dao.count(Task, {
    where: where
  });
  ctx.rest({
    result: count
  });
};

module.exports = {
  'POST /api/task/completedTasks': completedTasks,
  'POST /api/task/publish': publish,
  'GET /api/task/get/page/:page': get,
  'GET /api/task/get/count': count,
  'PUT /api/task/stick/:id': stick
};