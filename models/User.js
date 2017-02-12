import db from "../db";

module.exports = db.defineModel('users', {
    email: {
        type: db.STRING(50),
        unique: true
    },
    password: db.STRING(100),
    name: db.STRING(100),
    gender: db.BOOLEAN,
    tel: db.STRING(11),
    qq: db.STRING(15),
    wx: db.STRING(30)
});
