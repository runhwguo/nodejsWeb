// scan all models defined in models:
import fs from 'mz/fs';
import db from './db';

let files = fs.readdirSync(`${__dirname}/../model`);

const jsExt = '.js';

let jsFiles = files.filter(f => f.endsWith(jsExt), files);

for (let f of jsFiles) {
  // console.log(`import model from file ${f}...`);
  let name = f.substr(0, f.length - jsExt.length);
  exports[name] = require(`${__dirname}/../model/${f}`);
}

// 定义外键关系  start
let Task = exports.Task,
  User = exports.User,
  UserTask = exports.UserTask,
  Bill = exports.Bill;


console.log('----- foreign key -----');
User.hasMany(Task);
Task.belongsTo(User);

User.hasMany(UserTask);
UserTask.belongsTo(User);
Task.hasMany(UserTask);
UserTask.belongsTo(Task);

// Bill 参考Task  外键
Task.hasMany(Bill);
Bill.belongsTo(Task);

// end

exports.sync = () => db.sync();
