// scan all models defined in models:
import fs from 'fs';
import db from './db';

let files = fs.readdirSync(`${__dirname}/../models`);

let jsFiles = files.filter(f => f.endsWith('.js'), files);

module.exports = {};

for (let f of jsFiles) {
  console.log(`import model from file ${f}...`);
  let name = f.substring(0, f.length - 3);
  module.exports[name] = require(`${__dirname}/../models/${f}`);
}

module.exports.sync = () =>db.sync();
