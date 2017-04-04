const index = async ctx => {
  ctx.render('admin/login', {
    title: '管理员登录'
  });
};

module.exports = {
  'GET /admin/login': index
};