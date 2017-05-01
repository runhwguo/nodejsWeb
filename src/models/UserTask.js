import Db from '../tools/db';
import {UserTask} from '../tools/model';

const addTaskBelongAttr = (stateUserId, taskUserId, taskId) => {
  let isSelfPublishedTask = stateUserId === taskUserId;

  let userTask = UserTask.findOne({
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
