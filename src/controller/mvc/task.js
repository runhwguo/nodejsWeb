import {MINE_TASK_TYPE, TASK_TYPE, TASK_STATE} from '../../model/Task';
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
  let task = await Task.findByPrimary(id,{
    attributes: {
      exclude: ['version', 'updatedAt', 'createdAt', 'deletedAt']
    }
  });
  task = task.dataValues;
  // 查看会员共享 付完款 就相当于    完成所有任务
  // console.log(task);
  if (task.type === TASK_TYPE.member_sharing && !where.endsWith('ed')) {
    let userTaskOption = {
      taskId: id,
      userId: ctx.state.user.id
    };
    let thisUserTask = await UserTask.findOne({
      where: userTaskOption
    });
    console.log(thisUserTask);
    if (thisUserTask && thisUserTask.dataValues) {
      console.log('查看过');
    } else {
      console.log('没有查看过');
      if (await Dao.create(UserTask, userTaskOption)) {
        if (await Dao.update(Task, {shareCount: Db.sequelize.literal('shareCount-1')}, {where: {id: id}})) {
          console.log('新建查看会员记录 success');
        } else {
          console.log('新建查看会员记录 fail');
        }
      }
    }
  }
  // 带上发任务或者接任务的人的联系方式
  let userId = task.userId;
  if (where.endsWith('published')) {// 查看自己发布的任务时
    // 如果任务被接单，被完成，支付了，就带上接单人信息
    if ([TASK_STATE.completing, TASK_STATE.completed, TASK_STATE.paid].includes(task.state)) {
      let userTask = await UserTask.findOne({
        where: {
          taskId: task.id
        },
        attributes: ['userId']
      });
      userId = userTask.dataValues.userId;
    }
  }

  let user = await User.findByPrimary(userId, {
    attributes: ['name', 'tel', 'qq', 'wx']
  });

  user = user.dataValues;

  let taskBelongAttr = await addTaskBelongAttr(ctx.state.user.id, task.userId, id);

  let data = Object.assign(task, user, taskBelongAttr);

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