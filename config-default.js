// 存储默认的配置
let config = {
    db: {
        dialect: 'mysql',
        database: 'test',
        username: 'root',
        password: 'root',
        host: 'localhost',
        port: 3306
    },
    session: {
        cookieName: 'school-resource-share',
        cookieKey: 'fuckQ',
        expires: 86400//一天
    }
};

module.exports = config;
