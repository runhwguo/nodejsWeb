const findAll = async (model, option = {}) => {
  let result = await model.findAll(option),
      data   = [];
  result.forEach(item => {
    data.push(item.dataValues);
  });
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
  let result = await model.destroy(option);
  return result > 0;
};

export {
  findAll, update, create, count, remove
};