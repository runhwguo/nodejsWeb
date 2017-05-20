// 应用测试环境的配置
module.exports = {
  db: {
    dialect: 'mysql',
    database: 'test',
    username: 'root',
    password: 'root',
    host: 'localhost',
    port: 3306
  },
  project: {
    port: 8081
  }
};