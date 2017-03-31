import db from '../tools/db';

module.exports = db.defineModel('userTasks', {
  userId: db.STRING,
  taskId: db.STRING
});
