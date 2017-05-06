// 应用正式环境的配置
const config = {

  session: {
    userCookieName: 'schoolResourceShare',
    adminCookieName: 'adminCookie',
    ujsCookieName: 'JSESSIONID',
    wxOpenId: 'openid',
    cookieKey: 'fuckQ',
    maxAge: 86400 * 7//一天
  },
  admin: {
    username: 'admin',
    password: 'admin'
  },
  common: {
    char_set_utf8: 'utf-8'
  }
};

module.exports = config;
