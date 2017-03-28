import {Task, User} from "../../tools/model";
import * as Dao from "../../tools/dao";
import {TASK_STATE, TASK_TYPE} from "../../models/Task";

const mineTask = async ctx => {
  let type = ctx.params.type;
  let attributes = ['id', 'type'];
  if (type === 'completed') {
    attributes.push('detail', 'reward');
  } else if (type === 'unfinished') {
    attributes.push('detail', 'deadline');
  } else if (type === 'published') {
    attributes.push('defail', 'state');
  }
  let data = await Dao.findAll(Task, {
      attributes: attributes,
      where: {
        state: TASK_STATE.COMPLETING
      }
    });

  ctx.render(`my_task_list`, {
    title: '未完成任务',
    data: data
  })
};

let myInfo = async ctx => {
  let user = await User.findById(ctx.state.user.id);

  ctx.render(`completedTasks`, {
    title: '已完成的任务',
    data: user
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
  ctx.render(`task_detail`, {
    title: '任务详情',
    data: data
  })
};

const takeList = async ctx => {
  let where = ctx.query.where;
  ctx.render(`take_task_list`, {
    title: TASK_TYPE[where],
    where: where
  })
};

module.exports = {
  'GET /task/mine/:type': mineTask,
  'GET /task/taskList': takeList,
  'GET /myInfo': myInfo,
  'GET /task/detail/:id': detail
};