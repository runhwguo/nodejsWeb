const findAll = async(model, option = {}) => {
  let result = await model.findAll(option);
  let tasks = [];
  for (let item of result) {
    tasks.push(item.dataValues);
  }

  return tasks;
};

const findById = async(model, id = '') => {
  let data = await model.findById(id);
  let user = null;
  if (data) {
    user = data.dataValues;
  }

  return user;
};

const update = async(model, values, options) => {
  return await model.update(values, options);
};

const create = async(model, option = {}) => {
  let isOk = false;
  if (await model.create(option)) {
    isOk = true;
  }
  return isOk;
};

export {
  findAll, findById, update, create
};