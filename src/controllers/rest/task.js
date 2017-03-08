import tracer from 'tracer';
import {Task}  from '../../tools/model';
import {TASK_STATE}  from '../../models/Task';
import {session} from '../../tools/config';
import {uploadFile} from '../../tools/upload';
import * as Dao from '../../tools/dao';
import db from '../../tools/db';

let logger = tracer.console();

let completedTasks = async ctx => {

};

let getTasks = async ctx => {
  let offset = Number.parseInt(ctx.request.query.offset);
  let limit = Number.parseInt(ctx.request.query.limit);
  let tasks = await Dao.findAll(Task, {
    attributes: ['id', 'type', 'deadline', 'detail', 'filename', 'reward'],
    where: {
      state: TASK_STATE.RELEASED_NOT_CLAIMED
    },
    offset: offset,
    limit: limit
  });
  ctx.rest({
    result: tasks
  });
};
// postman中x-www-form-urlencoded下才能获取数据
let order = async ctx => {
  let taskId = ctx.request.body.taskId;
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

let publish = async ctx => {
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
  result['publishUserId'] = userId;
  result['deadline'] = new Date(result['deadline']).getTime();

  let isOK = await Dao.create(Task, result);
  ctx.rest({
    result: isOK
  });
};

module.exports = {
  'POST /api/completedTasks': completedTasks,
  'POST /api/publish': publish,
  'GET /api/getTasks': getTasks,
  'PUT /api/order': order
};