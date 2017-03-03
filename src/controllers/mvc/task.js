import taskDao from '../../dao/task_dao';
import userDao from '../../dao/user_dao';
import {TASK_STATE}  from '../../models/Task';

const DIR = 'mvc/';
let unfinishedTasks = async ctx => {
  let data = await taskDao.findAll({
    attributes: ['id', 'type', 'deadline', 'detail', 'filename', 'reward'],
    where: {
      state: TASK_STATE.COMPLETING
    }
  });

  ctx.render(`${DIR}unfinishedTasks`, {
    title: '未完成任务',
    data: data
  })
};
let completedTasks = async ctx => {
  let data = await taskDao.findAll({
    attributes: ['id', 'type', 'deadline', 'detail', 'filename', 'reward'],
    where: {
      state: TASK_STATE.COMPLETED,
      receiveTaskUserId: ctx.state.user.id
    }
  });

  ctx.render(`${DIR}completedTasks`, {
    title: '已完成的任务',
    data: data
  })
};
let publishedTasks = async ctx => {
  let data = await taskDao.findAll({
    attributes: ['id', 'type', 'deadline', 'detail', 'filename', 'reward'],
    where: {
      publishUserId: ctx.state.user.id
    }
  });

  ctx.render(`${DIR}completedTasks`, {
    title: '发布的任务',
    data: data
  })
};
let myInfo = async ctx => {
  let user = await userDao.findById(ctx.state.user.id);

  ctx.render(`${DIR}completedTasks`, {
    title: '已完成的任务',
    data: user
  })
};

module.exports = {
  'GET /unfinishedTasks': unfinishedTasks,
  'GET /completedTasks': completedTasks,
  'GET /publishedTasks': publishedTasks,
  'GET /myInfo': myInfo
};