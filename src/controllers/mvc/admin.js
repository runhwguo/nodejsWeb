const index = async ctx => {
  ctx.render('admin/index', {
    title: '任务列表'
  });
};

const login = async ctx => {
  ctx.render('admin/login', {
    title: '管理员登录'
  });
};

module.exports = {
  'GET /admin/index': index,
  'GET /admin/login': login,
  'GET /admin': login
};