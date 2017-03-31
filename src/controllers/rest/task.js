import {TASK_STATE, TASK_TYPE} from "../../models/Task";
import {Task, UserTask} from "../../tools/model";
import {session} from "../../tools/config";
import {uploadFile} from "../../tools/upload";
import * as Dao from "../../tools/dao";
import {getUserUnfinishedTaskIds} from "../../tools/multi_dao";
import db from "../../tools/db";

const _judgeTaskType = async ctx => {
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
      where.type = TASK_TYPE[fromWhere];
      // 用户登录，去查看take-task
      where.userId = {
        $ne: ctx.state.user.id
      };
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
    limit = 5,
    tasks = null;
  if (fromWhere === 'unfinished') {
    tasks = await getUserUnfinishedTaskIds(ctx.state.user.id);
  } else {
    if (fromWhere !== 'index') {
      limit = 8;
    }
    let [where, attributes] = await _judgeTaskType(ctx);
    tasks = await Dao.findAll(Task, {
      attributes: attributes,
      where: where,
      offset: (page - 1) * limit,
      limit: limit
    });
  }

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

  let userId = ctx.state.user.id;
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

// postman中x-www-form-urlencoded下才能获取数据
const stick = async ctx => {
  let taskId = ctx.params.id;
  let result = await Dao.update(Task, {
    priority: db.sequelize.literal('priority+1')
  }, {
    where: {
      id: taskId
    }
  });
  ctx.rest({
    result: result
  });
};

module.exports = {
  'POST /api/task/publish': publish,
  'GET /api/task/get/page/:page': get,
  'GET /api/task/get/count': count,
  'PUT /api/task/order/:id': order,
  'PUT /api/task/stick/:id': stick,
};