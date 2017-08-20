# 校园任务发布接收系统

## 项目结构

```
.
├── README.md
├── TODO_LIST todo list
├── app.json pm2配置文件
├── build 构建目录
│   └── gulpfile.babel.js gulpfile文件，.babel是支持gulpfile.js的代码es6语法
├── doc
│   ├── keys.txt keys
│   ├── server_config.txt server配置
├── package.json
├── script 自动化脚本
│   ├── GeneratePasswordWithOneKey.jar 加解密工具(Java)
│   ├── auto_script.py 集成脚本(Python)
│   └── usual_cmd 常用命令记录
├── src
│   ├── app.js     启动文件
│   ├── config     配置文件
│   ├── controller 控制层
│   ├── model      模型层
│   └── tool       工具类
├── start.js
├── static
│   ├── css
│   ├── font
│   ├── image
│   ├── js
│   ├── libs
│   └── third-party
└── view
    ├── admin
    ├── task
    ├── template

```