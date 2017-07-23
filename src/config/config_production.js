// 应用正式环境的配置
export default {
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