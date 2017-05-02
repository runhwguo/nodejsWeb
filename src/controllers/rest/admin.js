import {admin, session} from "../../tools/config";
import {Task} from "../../tools/model";
import * as Cookie from "../../tools/cookie";
import * as Dao from "../../tools/dao";

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
  let page = ctx.query.page;
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

module.exports = {
  'POST /api/admin/login': login,
  'GET /api/admin/get': get
};