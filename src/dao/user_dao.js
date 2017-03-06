import {User}  from '../tools/model';


const findById = async(id = '') => {
  let data = await User.findById(id);
  let user = null;
  if (data) {
    user = data.dataValues;
  }

  return user;
};

const update = async(option = {}) => {
  return await User.update(option);
};

const create = async(option = {}) => {
  let isOk = false;
  if (await User.create(option)) {
    isOk = true;
  }
  return isOk;
};

export {
  findById, update, create
};