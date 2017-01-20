import db from "../db";

module.exports = db.defineModel('users', {
    email: {
        type: db.STRING(100),
        unique: true
    },
    password: db.STRING(100),
    name: db.STRING(100),
    gender: db.BOOLEAN
});
