import Db from '../tool/db';
import {UserTask} from '../tool/model';

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

let exportModule = Db.defineModel('userTasks', {});

exportModule = Object.assign(exportModule, {
  addTaskBelongAttr: addTaskBelongAttr
});

module.exports = exportModule;
