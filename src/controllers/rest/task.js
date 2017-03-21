import tracer from "tracer";
import {Task} from "../../tools/model";
import {TASK_STATE, TASK_TYPE} from "../../models/Task";
import {session} from "../../tools/config";
import {uploadFile} from "../../tools/upload";
import * as Dao from "../../tools/dao";
import db from "../../tools/db";

let logger = tracer.console();

const completedTasks = async ctx => {

};

const get = async ctx => {
  let page = Number.parseInt(ctx.params.page);
  let limit = Number.parseInt(ctx.params.limit);
  let tasks = await Dao.findAll(Task, {
    attributes: ['id', 'type', 'detail', 'reward'],
    where: {
      state: TASK_STATE.RELEASED_NOT_CLAIMED
    },
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

  let serverFilePath = 'static/tmp';
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
  // 判断来源
  let where = ctx.query.where;
  let count = await Dao.count(Task, {
    where: {
      state: TASK_STATE.RELEASED_NOT_CLAIMED
    }
  });
  ctx.rest({
    result: count
  });
};

module.exports = {
  'POST /api/completedTasks': completedTasks,
  'POST /api/publish': publish,
  'GET /api/task/get/page/:page/limit/:limit': get,
  'GET /api/task/get/count': count,
  'PUT /api/task/stick/:id': stick
};