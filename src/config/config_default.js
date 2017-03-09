// 存储默认的配置
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
    cookieName: 'schoolResourceShare',
    ujsCookieName: 'JSESSIONID',
    cookieKey: 'fuckQ',
    maxAge: 86400//一天
  },
  project: {
    port: 3000
  }
};

module.exports = config;
