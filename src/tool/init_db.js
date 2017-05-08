require('./hook.js');

const Model = require('./model.js');

Model.sync().then(() => {
  console.log('Init database OK!');
  process.exit(0);
}).catch((e) => {
  console.log(e)
});