const findAll = async(model, option = {}) => {
  let result = await model.findAll(option);
  let tasks = [];
  for (let item of result) {
    tasks.push(item.dataValues);
  }

  return tasks;
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

const count = async(model) => {
  return await model.count();
};

const remove = async(model, option = {}) => {
  let opt = Object.assign(option, {force: true});
  return await model.destroy(opt);
};

export {
  findAll, update, create, count, remove
};