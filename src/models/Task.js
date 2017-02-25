import db from "../tools/db";

module.exports = db.defineModel('tasks', {
    userId: db.STRING(50),
    type: db.STRING(11),
    deadline: db.STRING(15),
    detail: db.TEXT,
    picture: db.STRING,
    reward: db.INTEGER
});
