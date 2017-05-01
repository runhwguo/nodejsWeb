import {admin} from "../../tools/config";

const login = async ctx => {
  let username = ctx.request.body.username,
    password = ctx.request.body.password;

  let result = username === admin.username && password === admin.password;
  ctx.rest({
    result: result
  });
};

module.exports = {
  'POST /api/admin/login': login
};