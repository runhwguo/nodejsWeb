import db from "../tools/db";

module.exports = db.defineModel('user_task', {
  userId: db.STRING(50),
  taskId: db.STRING(20)
});
