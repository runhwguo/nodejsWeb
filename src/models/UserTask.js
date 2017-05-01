import Db from '../tools/db';
import {UserTask} from '../tools/model';

const addTaskBelongAttr = async (stateUserId, taskUserId, taskId) => {
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


module.exports = Db.defineModel('userTasks', {});

module.exports.addTaskBelongAttr = addTaskBelongAttr;
