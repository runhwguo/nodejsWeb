// 应用测试环境的配置
const config = {
  db: {
    dialect: 'mysql',
    database: 'test',
    username: 'root',
    password: 'root',
    host: 'localhost',
    port: 3306
  },
  session: {
    userCookieName: 'schoolResourceShare',
    ujsCookieName: 'JSESSIONID',
    adminCookieName: 'adminCookie',
    cookieKey: 'fuckQ',
    maxAge: 86400//一天
  },
  project: {
    port: 8080
  },
  admin: {
    username: 'admin',
    password: 'admin'
  }
};

module.exports = config;