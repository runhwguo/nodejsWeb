require('./hook.js');

import model from "./model.js";

model.sync().then(() => {
    console.log('Init database OK!');
    process.exit(0);
}).catch((e) => {
    console.log(e)
});