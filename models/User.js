import db from "../db";

module.exports = db.defineModel('users', {
    password: db.STRING(100),
    name: db.STRING(100),
    gender: {
        type: db.BOOLEAN,
        allowNull: true
    },
    tel: {
        type: db.STRING(11),
        allowNull: true
    },
    qq: {
        type: db.STRING(15),
        allowNull: true
    },
    wx: {
        type: db.STRING(30),
        allowNull: true
    }
});
