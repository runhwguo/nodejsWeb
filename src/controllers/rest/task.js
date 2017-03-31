import {Task, UserTask} from "../../tools/model";
import {TASK_STATE, TASK_TYPE} from "../../models/Task";
import {session} from "../../tools/config";
import {uploadFile} from "../../tools/upload";
import * as Dao from "../../tools/dao";

const _judgeTaskType = ctx => {
  // 判断来源  take-task    mine-task ~ed
  let fromWhere = ctx.query.where;
  let where = {};
  let attributes = ['id', 'type', 'detail'];
  if (fromWhere.endsWith('ed')) {
    where.userId = ctx.state.user.id;
    if (fromWhere === 'completed') {
      attributes.push('reward');
      where.state = Object.keys(TASK_STATE)[3];
    } else if (fromWhere === 'unfinished') {
      attributes.push('deadline');
      where.state = Object.keys(TASK_STATE)[2];
    } else if (fromWhere === 'published') {
      attributes.push('state');
    }
  } else {
    where.state = Object.keys(TASK_STATE)[1];
    let keyword = ctx.query.keyword;
    if (fromWhere !== 'index') {
      where.type = fromWhere;
      // 用户登录，去查看take-task
      where.userId = {
        $ne: ctx.state.user.id
      };
    }
    attributes.push('reward');
    // 对任务搜索做处理
    if (keyword) {
      // where.detail = {
      //   $like: `%${keyword}%`
      // };
      // where.type = {
      //   $like: `%${keyword}%`
      // };
      where.$or = [
        {
          detail: {
            $like: `%${keyword}%`
          }
        },
        {
          type: {
            $like: `%${keyword}%`
          }
        }
      ];
    }
  }

  return [where, attributes];
};


const get = async ctx => {
  let page = Number.parseInt(ctx.params.page);
  let fromWhere = ctx.query.where;
  let limit = 5;
  if (fromWhere !== 'index') {
    limit = 8;
  }
  let [where, attributes] = _judgeTaskType(ctx);

  let tasks = await Dao.findAll(Task, {
    attributes: attributes,
    where: where,
    offset: (page - 1) * limit,
    limit: limit
  });
  tasks.forEach(item => {
    if (item.state) {
      item.state = TASK_STATE[item.state];
    }
  });
  ctx.rest({
    result: tasks
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
  result.data.userId = userId;
  result.data.deadline = new Date(result.data.deadline).getTime();

  let isOK = await Dao.create(Task, result.data);
  ctx.rest({
    result: !!isOK
  });
};

const count = async ctx => {
  let where = _judgeTaskType(ctx)[0];

  let count = await Dao.count(Task, {
    where: where
  });
  ctx.rest({
    result: count
  });
};

const order = async ctx => {
  let result = false;
  let id = ctx.params.id;
  let task = await Task.findOne({
    where: {
      id: id
    },
    attributes: ['userId']
  });
  let userId = task.dataValues.userId;
  // 更新任务的状态
  let isUpdateTaskOk = await Dao.update(Task, {
    state: Object.keys(TASK_STATE)[2]
  }, {
    where: {
      id: id
    }
  });
  if (isUpdateTaskOk) {
    // 插入UserTask
    let isCreateObjOk = await Dao.create(UserTask, {
      taskId: id,
      userId: userId
    });
    result = !!isCreateObjOk
  }

  ctx.rest({
    result: result
  });
};

module.exports = {
  'POST /api/task/publish': publish,
  'GET /api/task/get/page/:page': get,
  'GET /api/task/get/count': count,
  'PUT /api/task/order/:id': order,
};