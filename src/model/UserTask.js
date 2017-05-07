import Db from '../tool/db';
import {UserTask} from '../tool/model';
import Tracer from 'tracer';

const console = Tracer.console();

const addTaskBelongAttr = async (stateUserId, taskUserId, taskId) => {
  console.log('debug add attr ->' + stateUserId, taskUserId, taskId);

  let isSelfPublishedTask = stateUserId === taskUserId;

  let userTask = await UserTask.findOne({
    where: {
      userId: stateUserId,
      taskId: taskId
    }
  });
  let isSelfOrderedTask = !!(userTask && userTask.dataValues);

  return {
    isSelfPublishedTask: isSelfPublishedTask,
    isSelfOrderedTask: isSelfOrderedTask
  };
};

exports = Db.defineModel('userTasks', {});

exports = Object.assign(exports, {
  addTaskBelongAttr: addTaskBelongAttr
});

module.exports = exports;
