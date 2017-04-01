// scan all models defined in models:
import fs from 'fs';
import db from './db';

let files = fs.readdirSync(`${__dirname}/../models`);

let jsFiles = files.filter(f => f.endsWith('.js'), files);

module.exports = {};

for (let f of jsFiles) {
  console.log(`import model from file ${f}...`);
  let name = f.substr(0, f.length - 3);
  module.exports[name] = require(`${__dirname}/../models/${f}`);
}

// 定义外键关系  start
let Task = module.exports.Task;
let User = module.exports.User;
let UserTask = module.exports.UserTask;
console.log('----- foreign key -----');
User.hasMany(Task);
Task.belongsTo(User);

User.hasMany(UserTask);
UserTask.belongsTo(User);
Task.hasMany(UserTask);
UserTask.belongsTo(Task);
// end

module.exports.sync = () => db.sync();
