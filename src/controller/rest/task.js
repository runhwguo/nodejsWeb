import {TASK_STATE, TASK_TYPE} from "../../model/Task";
import {addTaskBelongAttr} from "../../model/UserTask";
import {session} from "../../tool/config";
import {uploadFile} from "../../tool/upload";
import * as Dao from "../../tool/dao";
import * as Common from "../../tool/common";
import * as UserTaskDao from "../../tool/user_task_dao";
import Db from "../../tool/db";
import Tracer from "tracer";
import {Task, UserTask, Bill, User} from "../../tool/model";

const console = Tracer.console();

const _judgeTaskType = ctx => {
  // 判断来源  take-task    mine-task ~ed
  let fromWhere = ctx.query.where,
    where = {
    shareCount: {
      $gt: 0
    }
  };
  let attributes = ['id', 'type', 'title', 'userId'];
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
        },
        {
          title: {
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

  // 任务查询出来的一些后续操作
  if (ctx.state.user) { // 考虑用户没有登录的情景
    tasks.map(async task => {
        // 加载判断 是否是自己的任务和自己是否接了  -> 查看接任务时
        let taskBelongAttr = await addTaskBelongAttr(ctx.state.user.id, task.userId, task.id);
        task = Object.assign(task, taskBelongAttr);
        // console.log(task);
    });
  }

  ctx.rest({
    result: tasks
  });
};

const publish = async ctx => {
  const serverFilePath = 'static/tmp';
  // 上传文件事件
  let result = await uploadFile(ctx, {
    fileType: `taskImage/${Common.getRandomInt()}/${Common.getRandomInt()}`,
    path: serverFilePath
  });
  result.data.userId = ctx.state.user.id;
  if (result.data.shareCount) {
    result.data.shareCount = Number.parseInt(result.data.shareCount);
  } else {
    result.data.shareCount = 1;
  }

  if (!result.data.reward) {
    result.data.reward = 0;
  }

  let isOK = await Dao.create(Task, result.data);
  ctx.rest({
    result: isOK
  });
};

const count = async ctx => {
  let fromWhere = ctx.query.where,
    count = 0;
  if (fromWhere === 'unfinished') {
    count = await UserTaskDao.count(ctx.state.user.id, [TASK_STATE.completing]);
  } else if (fromWhere === 'completed') {
    count = await UserTaskDao.count(ctx.state.user.id, [TASK_STATE.completed, TASK_STATE.paid]);
  } else {
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
  let id = ctx.params.id,
    operate = ctx.params.operate,
    value = {},
    state = null,
    ret = false,
    result = {
      result: true,
      message: ''
    };


  switch (operate) {
    case 'order': {
      // 插入UserTask
      ret = await Dao.create(UserTask, {
        taskId: id,
        userId: ctx.state.user.id
      });
      if (!ret) {
        result = {
          result: false,
          message: '接单失败，请重试'
        }
      }

      state = TASK_STATE.completing;
      break;
    }
    case 'stick': {
      ret = true;

      value.priority = Db.sequelize.literal('priority+1');
      break;
    }
    case 'abandon': {
      // 删除UserTask
      ret = await Dao.remove(UserTask, {
        where: {
          taskId: id,
          userId: ctx.state.user.id
        }
      });

      if (!ret) {
        result = {
          result: false,
          message: '放弃失败，请重试'
        }
      }

      state = TASK_STATE.released_not_claimed;
      break;
    }
    case 'done': {
      ret = true;

      state = TASK_STATE.completed;
      break;
    }
    case 'off': {
      let task = await Task.findByPrimary(id, {
        attributes: ['reward', 'state']
      });

      task = task.dataValues;

      if (task.state === TASK_STATE.released_not_claimed) {
        let reward = task.reward;

        ret = await Dao.remove(Task, {
          where: {
            id: id
          }
        });

        if (ret) {
          ret = await Dao.create(Bill, {
            taskId: id,
            userOpenId: ctx.state.user.openId,
            amount: reward
          });
        }

        if (!ret) {
          console.error('生成支付订单错误');
          result = {
            result: false,
            message: '下架失败，请重试'
          }
        }
      } else {
        result = {
          result: false,
          message: '任务已被领取'
        };
      }

      state = TASK_STATE.cancelled;
      break;
    }
    case 'paid': {
      let userTask = await UserTask.findOne({
        where: {
          taskId: id
        },
        attributes: ['userId']
      });

      let task = await Task.findByPrimary(id);

      let reward = task.dataValues.reward;


      let userId = userTask.dataValues.userId;
      let user = await User.findByPrimary(userId, {
        attributes: ['openId']
      });
      let userOpenId = user.dataValues.openId;

      ret = await Dao.create(Bill, {
        taskId: id,
        userOpenId: userOpenId,
        amount: reward
      });

      if (!ret) {
        console.error('生成支付订单错误');
        result = {
          result: false,
          message: '支付失败，请重试'
        }
      }

      state = TASK_STATE.paid;
      break;
    }
  }
  if (state) {
    value.state = state;
  }
  // 更新状态
  if (ret) {
    await Dao.update(Task, value, {
      where: {
        id: id
      }
    });
  }

  ctx.rest({
    result: result
  });
};

const unread = async ctx => {
  let user = ctx.state.user,
    result = 0;
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