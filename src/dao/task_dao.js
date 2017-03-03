import {Task}  from '../tools/model';


const findAll = async(option = {}) => {
  let result = await Task.findAll(option);
  let tasks = [];
  for (let item of result) {
    tasks.push(item.dataValues);
  }

  return tasks;
};

const update = async(values, options) => {
  return await Task.update(values, options);
};

const create = async(option = {}) => {
  let isOk = false;
  if (await Task.create(option)) {
    isOk = true;
  }
  return isOk;
};


module.exports = {
  findAll, update, create
};