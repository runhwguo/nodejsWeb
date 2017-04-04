import {MINE_TASK_TYPE, TASK_TYPE} from '../../models/Task';
import {Task, User} from '../../tools/model';
import * as Dao from '../../tools/dao';
import db from '../../tools/db';

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
  task = task.dataValues;
  if(task.type === TASK_TYPE.member_sharing) {
    await Dao.update(Task, {
      shareCount: db.sequelize.literal('shareCount-1')
    }, {
      where: {
        id: id
      }
    });
  }
  let user = await User.findOne({
    where: {id: task.userId},
    attributes: ['name', 'tel']
  });
  user = user.dataValues;
  let data = Object.assign({}, task, user);
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