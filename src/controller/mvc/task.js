import {MINE_TASK_TYPE, TASK_TYPE, isSelfPublishedTask} from '../../model/Task';
import {addTaskBelongAttr} from '../../model/UserTask';
import {Task, User, UserTask} from '../../tool/model';
import * as Dao from '../../tool/dao';
import Db from '../../tool/db';
import Tracer from 'tracer';

const console = Tracer.console();

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
  let where = ctx.query.where;
  let task = await Task.findOne({
    where: {
      id: id
    },
    attributes: {exclude: ['version', 'updatedAt', 'createdAt', 'deletedAt']}
  });
  task = task.dataValues;
  // 查看会员共享 付完款 就相当于    完成所有任务
  if (task.type === TASK_TYPE.member_sharing && !where.endsWith('ed')) {
    let userTaskOption = {
      taskId: id,
      userId: ctx.state.user.id
    };
    let thisUserTask = await Dao.findAll(UserTask, userTaskOption);
    if (!thisUserTask || thisUserTask.length === 0) {
      await Dao.create(UserTask, userTaskOption);

      await Dao.update(Task, {
        shareCount: Db.sequelize.literal('shareCount-1')
      }, {
        where: {
          id: id
        }
      });
    }
  }
  let publishTaskUser = await User.findOne({
    where: {id: task.userId},
    attributes: ['name', 'tel', 'qq', 'wx']
  });
  publishTaskUser = publishTaskUser.dataValues;

  let taskBelongAttr =addTaskBelongAttr(ctx.state.user.id, task.userId, id);

  let data = Object.assign(task, publishTaskUser, taskBelongAttr);

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