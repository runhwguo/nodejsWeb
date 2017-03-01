import db from '../tools/db';

module.exports = db.defineModel('tasks', {
  userId: db.STRING(50),
  type: db.STRING(20),
  deadline: db.BIGINT,
  detail: db.TEXT,
  filename: db.STRING,
  reward: db.INTEGER
});
