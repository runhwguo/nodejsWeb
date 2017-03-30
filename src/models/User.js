import db from '../tools/db';

module.exports = db.defineModel('users', {
  password: db.STRING,
  name: db.STRING,
  gender: db.STRING,
  tel: db.STRING,
  qq: db.STRING,
  wx: {
    type: db.STRING,
    allowNull: true
  },
  credit: {
    type: db.INTEGER,
    defaultValue: 0
  }
});
