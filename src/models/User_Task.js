import db from '../tools/db';

module.exports = db.defineModel('user_task', {
  userId: db.STRING,
  taskId: db.STRING
});
