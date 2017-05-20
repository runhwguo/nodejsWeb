require('./hook');

const Model = require('./model');

Model.sync().then(() => {
  console.log('Init database OK!');
  process.exit(0);
}).catch((e) => {
  console.log(e)
});