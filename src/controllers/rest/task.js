import {Task, UserTask} from '../../tools/model';
import {TASK_STATE, TASK_TYPE} from '../../models/Task';
import {session} from '../../tools/config';
import {uploadFile} from '../../tools/upload';
import * as Dao from '../../tools/dao';
import * as Common from '../../tools/common';
import * as UserTaskDao from '../../tools/user_task_dao';
import Db from '../../tools/db';
import Tracer from 'tracer';

const console = Tracer.console();

const _judgeTaskType = ctx => {
  // 判断来源  take-task    mine-task ~ed
  let fromWhere = ctx.query.where;
  let where = {
    shareCount: {
      $gt: 0
    }
  };
  let attributes = ['id', 'type', 'title'];
  if (fromWhere.endsWith('ed')) {
    if (fromWhere === 'published') {
      where.userId = ctx.state.user.id;
      attributes.push('state');
    }
  } else {
    where.state = TASK_STATE.released_not_claimed;
    let keyword = ctx.query.keyword;
    if (fromWhere !== 'index') {
      where.type = TASK_TYPE[fromWhere];
    }
    attributes.push('reward');
    // 对任务搜索做处理
    if (keyword) {
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
  let page = Number.parseInt(ctx.params.page),
    fromWhere = ctx.query.where,
    tasks = null;
  if (fromWhere === 'unfinished') {
    tasks = await UserTaskDao.get(ctx.state.user.id, [TASK_STATE.completing], page);
  } else if (fromWhere === 'completed') {
    tasks = await UserTaskDao.get(ctx.state.user.id, [TASK_STATE.completed, TASK_STATE.paid], page);
  } else {
    let limit = 5;
    if (fromWhere !== 'index') {
      limit = 8;
    }
    let [where, attributes] = _judgeTaskType(ctx);
    tasks = await Dao.findAll(Task, {
      attributes: attributes,
      where: where,
      offset: (page - 1) * limit,
      limit: limit,
      order: [
        ['state', 'ASC'],
        ['priority', 'DESC'],
        ['createdAt', 'DESC']
      ]
    });
  }

  // 加载判断 是否是自己的任务，自己是否接了
  tasks.forEach(async (task, index, array) => {
    let taskBelongAttr = addTaskBelongAttr(ctx.state.user.id, task.userId, task.id);
    array[index] = Object.assign(task, taskBelongAttr);
    console.log(array[index]);
  });

  ctx.rest({
    result: tasks
  });
};

const publish = async ctx => {
  const serverFilePath = 'static/tmp';
  // 上传文件事件
  let firstDir = Common.getRandomInt();
  let secondDir = Common.getRandomInt();
  let result = await uploadFile(ctx, {
    fileType: `taskImage/${firstDir}/${secondDir}`,
    path: serverFilePath
  });
  result.data.userId = ctx.state.user.id;
  if(result.data.shareCount) {
    result.data.shareCount = Number.parseInt(result.data.shareCount);
  }else {
    result.data.shareCount = 1;
  }

  if (!result.data.reward){
    result.data.reward = 0;
  }

  let isOK = await Dao.create(Task, result.data);
  ctx.rest({
    result: !!isOK
  });
};

const count = async ctx => {
  let fromWhere = ctx.query.where;
  let count = 0;
  if (fromWhere === 'unfinished') {
    count = await UserTaskDao.count(ctx.state.user.id, [TASK_STATE.completing]);
  } else if (fromWhere === 'completed') {
    count = await UserTaskDao.count(ctx.state.user.id, [TASK_STATE.completed, TASK_STATE.paid]);
  } else{
    let where = _judgeTaskType(ctx)[0];

    count = await Dao.count(Task, {
      where: where
    });
  }
  ctx.rest({
    result: count
  });
};

// postman中x-www-form-urlencoded下才能获取数据
const stateUpdate = async ctx => {
  let id = ctx.params.id;
  let operate = ctx.params.operate;

  let value = {};
  let state = null;
  switch (operate) {
    case 'order': {
      state = TASK_STATE.completing;
      break;
    }
    case 'stick': {
      value.priority = Db.sequelize.literal('priority+1');
      break;
    }
    case 'abandon': {
      state = TASK_STATE.released_not_claimed;
      break;
    }
    case 'done': {
      state = TASK_STATE.completed;
      break;
    }
    case 'off': {
      state = TASK_STATE.cancelled;
      await Dao.remove(Task, {
        where: {
          id: id
        }
      });
      break;
    }
    case 'paid': {
      state = TASK_STATE.paid;
      break;
    }
  }
  if (state) {
    value.state = state;
  }

  let result = await Dao.update(Task, value, {
    where: {
      id: id
    }
  });

  if (!!result) {
    if (operate === 'order'){
      // 插入UserTask
      let isCreateObjOk = await Dao.create(UserTask, {
        taskId: id,
        userId: ctx.state.user.id
      });
      result = !!isCreateObjOk
    } else if (operate === 'abandon') {
      // 删除UserTask
      let isCreateObjOk = await Dao.remove(UserTask, {
        where: {
          taskId: id,
          userId: ctx.state.user.id
        }
      });
      result = !!isCreateObjOk
    }
  }

  ctx.rest({
    result: result
  });
};

const unread = async ctx => {
  let user = ctx.state.user;
  let result = 0;
  if (user) {
    result = await UserTaskDao.count(user.id, [TASK_STATE.completing]);

    result += await Dao.count(Task, {
      where: {
        userId: ctx.state.user.id,
        state: TASK_STATE.completed
      }
    });
  }
  ctx.rest({
    result: result
  });
};

module.exports = {
  'POST /api/task/publish': publish,
  'GET /api/task/get/page/:page': get,
  'GET /api/task/get/count': count,
  'GET /api/task/get/unread': unread,
  'PUT /api/task/state/:operate/:id': stateUpdate,
};