//应用测试环境的配置
let config = {
  db: {
    dialect: 'mysql',
    database: 'test',
    username: 'www',
    password: 'www',
    host: 'localhost',
    port: 3306
  },
  session: {
    cookieName: 'schoolResourceShare',
    ujsCookieName: 'JSESSIONID',
    cookieKey: 'fuckQ',
    maxAge: 86400//一天
  }
};

module.exports = config;