// 应用正式环境的配置
const config = {
  db: {
    dialect: 'mysql',
    database: 'test',
    username: 'root',
    password: 'root',
    host: 'localhost',
    port: 3306
  },
  project: {
    port: 8080
  }
};

module.exports = config;
