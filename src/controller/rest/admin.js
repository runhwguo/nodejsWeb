import {admin, session} from '../../tool/config';
import * as Cookie from '../../tool/cookie';
import * as Dao from '../../tool/dao';
// import Tracer from 'tracer';
import {Task} from '../../tool/model';

// const console = Tracer.console();

const login = async ctx => {
  let username = ctx.request.body.username,
      password = ctx.request.body.password;

  let result = username === admin.username && password === admin.password;
  if (result) {
    const adminCookieName = session.adminCookieName;
    const adminCookie     = Cookie.user2cookie(username, password, adminCookieName);
    ctx.cookies.set(adminCookieName, adminCookie, {
      maxAge: session.maxAge * 7 * 1000
    });
  }

  ctx.rest({
    result: result
  });
};

const _processKeywordWhere = ctx => {
  let keyword = ctx.query.keyword;
  let where   = {};
  // 对任务搜索做处理
  if (keyword) {
    where.$or = [
      {
        detail: {
          $like: `%${keyword}%`
        }
      },
      {
        type: {
          $like: `%${keyword}%`
        }
      },
      {
        title: {
          $like: `%${keyword}%`
        }
      }
    ];
  }

  return where;
};

const get = async ctx => {
  const LIMIT = 8;
  let page    = Number.parseInt(ctx.query.page);
  let tasks   = await Dao.findAll(Task, {
    attributes: ['type', 'title', 'detail', 'id', 'state'],
    where: _processKeywordWhere(ctx),
    offset: page * LIMIT,
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
  let result = await Dao.count(Task, {
    where: _processKeywordWhere(ctx)
  });
  ctx.rest({
    result: result
  });
};

const remove = async ctx => {
  let id     = ctx.query.id;
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