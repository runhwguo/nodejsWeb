import Db from '../tool/db';

module.exports = Db.defineModel('users', {
  password: Db.STRING,
  name: Db.STRING,
  gender: Db.STRING,
  tel: Db.STRING,
  qq: Db.STRING,
  wx: {
    type: Db.STRING,
    allowNull: true
  },
  credit: {
    type: Db.INTEGER,
    defaultValue: 0
  },
  openId: {// 用户的openid
    type: Db.STRING,
    allowNull: true
  },
  headImgUrl: {
    type: Db.STRING,
    defaultValue: ''
  }
});