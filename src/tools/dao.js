const findAll = async (model, option = {}) => {
  let result = await model.findAll(option);
  let data = [];
  for (let item of result) {
    data.push(item.dataValues);
  }

  return data;
};

const update = async (model, values, option) => {
  return await model.update(values, option);
};

const create = async (model, option = {}) => {
  let isOk = false;
  if (await model.create(option)) {
    isOk = true;
  }
  return isOk;
};

const count = async (model, option = {}) => {
  return await model.count(option);
};

const remove = async (model, option = {}) => {
  return await model.destroy(option);
};

export {
  findAll, update, create, count, remove
};