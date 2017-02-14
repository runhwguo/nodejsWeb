import itdb from "../tools/db";

module.exports = db.defineModel('users', {
    password: db.STRING(100),
    name: db.STRING(100),
    gender: {//从教务处爬
        type: db.BOOLEAN,
        allowNull: true
    },
    tel: {//从教务处爬
        type: db.STRING(11),
        allowNull: true
    },
    qq: {//ujs爬
        type: db.STRING(15),
        allowNull: true
    },
    wx: {
        type: db.STRING(30),
        allowNull: true
    }
});
