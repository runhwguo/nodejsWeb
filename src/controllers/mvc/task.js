import {Task, User} from "../../tools/model";
import * as Dao from "../../tools/dao";
import {TASK_STATE, TASK_TYPE} from "../../models/Task";

const unfinishedTasks = async ctx => {
  let data = await Dao.findAll(Task, {
    attributes: ['id', 'type', 'deadline', 'detail', 'filename', 'reward'],
    where: {
      state: TASK_STATE.COMPLETING
    }
  });

  ctx.render(`my_task_list`, {
    title: '未完成任务',
    data: data
  })
};
const completedTasks = async ctx => {
  let data = await Dao.findAll(Task, {
    attributes: ['id', 'type', 'deadline', 'detail', 'filename', 'reward'],
    where: {
      state: TASK_STATE.COMPLETED,
      receiveTaskUserId: ctx.state.user.id
    }
  });

  ctx.render(`my_task_list`, {
    title: '已完成的任务',
    data: data
  })
};
const publishedTasks = async ctx => {
  let data = await Dao.findAll(Task, {
    attributes: ['id', 'type', 'deadline', 'detail', 'filename', 'reward'],
    where: {
      publishUserId: ctx.state.user.id
    },
    limit: 5
  });

  ctx.render(`my_task_list`, {
    title: '发布的任务',
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

const taskDetail = async ctx => {
  let task = null;
  ctx.render(`task_detail`, {
    title: '任务详情',
    data: task
  })
};

const taskList = async ctx => {
  let where = ctx.query.where;
  ctx.render(`take_task_list`, {
    title: TASK_TYPE[where],
    where: where
  })
};

module.exports = {
  'GET /unfinishedTasks': unfinishedTasks,
  'GET /completedTasks': completedTasks,
  'GET /publishedTasks': publishedTasks,
  'GET /taskList': taskList,
  'GET /myInfo': myInfo
};