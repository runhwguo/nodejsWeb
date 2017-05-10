// 应用正式环境的配置
module.exports = {

  session: {
    userCookieName: 'schoolResourceShare',
    adminCookieName: 'adminCookie',
    ujsCookieName: 'JSESSIONID',
    wxOpenId: 'openid',
    headImgUrl: 'headImgUrl',
    cookieKey: 'fuckQ',
    maxAge: 86400//1天
  },
  admin: {
    username: 'admin',
    password: 'admin'
  },
  common: {
    char_set_utf8: 'utf-8'
  }
};
