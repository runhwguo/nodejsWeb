import tracer from 'tracer';
import {Task}  from '../../tools/model';
import {TASK_STATE}  from '../../models/Task';
import {session} from '../../tools/config';
import {uploadFile} from '../../tools/upload';

let logger = tracer.console();

let completedTasks = async ctx => {

};

let getTasks = async ctx => {
  let offset = Number.parseInt(ctx.request.query.offset);
  let limit = Number.parseInt(ctx.request.query.limit);
  let result = await Task.findAll({
    attributes: ['id', 'type', 'deadline', 'detail', 'filename', 'reward'],
    where: {
      state: TASK_STATE.RELEASED_NOT_CLAIMED
    },
    offset: offset,
    limit: limit
  });
  let tasks = [];
  for (let item of result) {
    tasks.push(item.dataValues);
  }
  ctx.rest({
    result: tasks
  });
};

let order = async ctx => {
  let user = ctx.state.user;
  let taskId = ctx.request.body.taskId;
  let result = await Task.update({
    receiveTaskUserId: user.id,
    state: TASK_STATE.COMPLETING
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

  let isOK = false;
  if (await Task.create(result)) {
    isOK = true;
  }
  ctx.rest({
    result: isOK
  });
};

module.exports = {
  'POST /api/completedTasks': completedTasks,
  'POST /api/publish': publish,
  'GET /api/getTasks': getTasks,
  'POST /api/order': order
};