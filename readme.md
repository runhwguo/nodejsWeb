[![Gitter](https://badges.gitter.im/gitterHQ/gitter.svg)](https://gitter.im/nodejsWeb/Lobby)

# nodejs-koa

## 项目结构

```
.
├── app.js
├── asyncHello.js
├── config-default.js
├── config-test.js
├── config.js
├── controller.js
├── controllers
│   ├── mvc
│   └── rest
├── crawler.js
├── data.txt
├── db.js
├── hello.js
├── hook.js
├── init_db.js
├── initSql.txt
├── model.js
├── models
│   ├── Pet.js
│   └── User.js
├── my-config.js
├── package.json
├── products.js
├── readme.md
├── rest.js
├── start.js
├── static
│   ├── css
│   ├── fonts
│   ├── images
│   └── js
├── static_files.js
├── templating.js
├── test
│   ├── asyncTest.js
│   └── helloTest.js
└── views
    ├── mvc
    └── rest
```

<!---
- controllers  控制层逻辑，URL处理
  - mvc  mvc层的控制器
  - rest  rest格式的接口交互
- models/  模型层逻辑，对应数据库中的表
- static/  静态资源
- test/  待测试js文件,mocha测试框架，mocha默认会测试test下的所有文件，在package.json中的scripts中指定
  - await-test.js  异步测试
- views/  Nunjucks模板引擎，HTML模板文件
  - mvc  mvc 的网页
  - rest  rest mvc
- app.js  使用koa的入口js
- asyncHello.js, hello.js  待测试的js
- package.json  项目描述文件
- products.js  rest demo 临时数据库
- node_modules/  npm安装的所有依赖包
- config.js, config-default.js, config-test.js, config-override.js  MySQL配置文件, 默认配置, 测试环境配置, 运营需要特别配置
- controller.js  扫描注册Controller
- data.txt  异步测试的数据文件
- db.js  统一Model的定义
- hook.js  babel引入
- init_db.js  自动创建数据库, 首次使用sync()也可以自动创建出表结构，避免了手动运行SQL的问题
- initSql.txt  数据库sql的文本
- model.js  如何导入Model
- rest.js  统一处理rest风格的接口
- start.js  启动入口js
- static_files.js  middleware, 处理静态文件, 处理以/static/开头的URL
- templating.js  middleware, 渲染模板 MVC结构
supervisor,如果需要 自动检测到变化然后重启，请安装这个库
--->
