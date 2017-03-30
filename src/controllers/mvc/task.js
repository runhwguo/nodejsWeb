import {Task, User} from "../../tools/model";
import {MINE_TASK_TYPE, TASK_TYPE} from "../../models/Task";

const list = async ctx => {
  let where = ctx.params.where;
  let title = null;
  if (where.endsWith('ed')) {
    title = MINE_TASK_TYPE[where];
  } else {
    title = TASK_TYPE[where];
  }
  ctx.render(`task/task_show`, {
    title: title,
    where: where
  })
};

const detail = async ctx => {
  let id = ctx.params.id;
  let task = await Task.findOne({
    where: {id: id},
    attributes: {exclude: ['version', 'updatedAt', 'createdAt']}
  });
  task = task.dataValues;
  let user = await User.findOne({
    where: {id: task.publishUserId},
    attributes: ['name', 'tel']
  });
  user = user.dataValues;
  task.type = TASK_TYPE[task.type];
  let data = Object.assign({}, task, user);
  ctx.render(`task/task_detail`, {
    title: '任务详情',
    data: data
  })
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

module.exports = {
  'GET /task/mine/:where': list,
  'GET /task/take/:where': list,
  'PUT /task/stick/:id': stick,
  'GET /task/detail/:id': detail
};