const findAll = async (model, option = {}) => {
  let result = await model.findAll(option);
  let tasks = [];
  for (let item of result) {
    tasks.push(item.dataValues);
  }

  return tasks;
};

const update = async (model, values, options) => {
  return await model.update(values, options);
};

const create = async (model, option = {}) => {
  let isOk = false;
  if (await model.create(option)) {
    isOk = true;
  }
  return isOk;
};

const count = async (model, opt = {}) => {
  return await model.count(opt);
};

const remove = async (model, option = {}) => {
  return await model.destroy(option);
};

export {
  findAll, update, create, count, remove
};