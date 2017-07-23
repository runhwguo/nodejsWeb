# 校园任务发布接受系统

## 项目结构

```
├── TODO_LIST 项目todo list
├── build 构建目录 基于gulp
│   ├── .babelrc gulp的babel配置文件
│   └── gulpfile.babel.js gulpfile文件，.babel是支持gulpfile.js的代码es6语法
├── doc 项目文档
│   ├── keys.txt 项目开发的一些keys
│   ├── 测试文档.docx 测试文档
│   └── 资源共享平台项目说明书.docx 项目书
├── package.json
├── readme.md
├── script 自动化脚本
│   ├── commitAndPush.sh git提交代码
│   └── pullAndPublish.sh git更新代码
├── src .js源代码
│   ├── app.js 项目启动文件
│   ├── config 一些项目及配置
│   ├── controller controller层
│   ├── model model层
│   └── tool 一些工具
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
    ├── index.html
    ├── login.html
    ├── my_info.html
    ├── task
    ├── template
    └── user_info.html

```