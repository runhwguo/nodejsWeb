import db from "../tools/db";

module.exports = db.defineModel('users', {
  password: db.STRING(100),
  name: db.STRING(100),
  gender: db.STRING(5),
  tel: db.STRING(11),
  qq: db.STRING(15),
  wx: db.STRING(30)
});
