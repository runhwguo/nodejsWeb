import {admin, session} from "../../tools/config";
import * as Cookie from "../../tools/cookie";
import * as Dao from "../../tools/dao";
import {Task} from "../../tools/model";

const login = async ctx => {
  let username = ctx.request.body.username,
    password = ctx.request.body.password;

  let result = username === admin.username && password === admin.password;
  if (result) {
    const adminCookieName = session.adminCookieName;
    const adminCookie = Cookie.user2cookie(username, password, adminCookieName);
    ctx.cookies.set(adminCookieName, adminCookie);
  }

  ctx.rest({
    result: result
  });
};

const get = async ctx => {
  const LIMIT = 8;
  let page = Number.parseInt(ctx.query.page);
  let tasks = await Dao.findAll(Task, {
    attributes: ['type', 'title', 'detail', 'id', 'state'],
    where: {},
    offset: (page - 1) * LIMIT,
    limit: LIMIT,
    order: [
      ['state', 'ASC'],
      ['createdAt', 'DESC']
    ]
  });

  ctx.rest({
    result: tasks
  });
};

const count = async ctx => {
  let result = await Dao.count(Task);
  ctx.rest({
    result: result
  });
};

const remove = async ctx => {
  let id = ctx.query.id;
  let result = await  Dao.remove(Task, {
    where: {
      id: id
    }
  });
  ctx.rest({
    result: result
  });
};

module.exports = {
  'POST /api/admin/login': login,
  'GET /api/admin/task/get': get,
  'GET /api/admin/task/count': count,
  'DELETE /api/admin/task/remove': remove
};