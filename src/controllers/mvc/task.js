import {MINE_TASK_TYPE, TASK_TYPE} from '../../models/Task';
import {Task, User, UserTask} from '../../tools/model';
import * as Dao from '../../tools/dao';
import db from '../../tools/db';
import Tracer from 'tracer';

const console = Tracer.console;

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
  });
};

const detail = async ctx => {
  let id = ctx.params.id;
  let task = await Task.findOne({
    where: {id: id},
    attributes: {exclude: ['version', 'updatedAt', 'createdAt', 'deletedAt']}
  });
  console.log(task);
  task = task.dataValues;
  if (task.type === TASK_TYPE.member_sharing) {
    await Dao.update(Task, {
      shareCount: db.sequelize.literal('shareCount-1')
    }, {
      where: {
        id: id
      }
    });
    // 查看会员共享 付完款 就相当于    完成所有任务
    await Dao.create(UserTask, {
      taskId: id,
      userId: ctx.state.user.id
    });
  }
  let user = await User.findOne({
    where: {id: task.userId},
    attributes: ['name', 'tel', 'qq', 'wx']
  });
  user = user.dataValues;
  let isSelfTask = task.userId === ctx.state.user.id;
  let data = Object.assign({}, task, user, {isSelfTask: isSelfTask});

  data.reward = Math.abs(data.reward);
  ctx.render(`task/task_detail`, {
    title: '任务详情',
    data: data,
    where: ctx.query.where
  });
};

module.exports = {
  'GET /task/mine/:where': list,
  'GET /task/take/:where': list,
  'GET /task/detail/:id': detail
};