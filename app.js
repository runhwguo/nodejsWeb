import Koa from 'koa';
import bodyParser from 'koa-bodyparser';
import controller from './controller';
import templating from './templating';
import rest from './rest';

const app = new Koa();

const isProduction = process.env.NODE_ENV === 'production';

app.use(async(ctx, next) => {
    // log request URL
    console.log(`${ctx.request.method} ${ctx.url}`); // 打印URL
    let start = new Date().getTime();
    await next(); // 调用下一个middleware
    const ms = new Date().getTime() - start; // 耗费时间
    ctx.response.set('X-Response-Time', `${ms}ms`);
});
//在生产环境下，
// 静态文件是由部署在最前面的反向代理服务器（如Nginx）处理的，
// Node程序不需要处理静态文件。
// 而在开发环境下，我们希望koa能顺带处理静态文件，
// 否则，就必须手动配置一个反向代理服务器，
// 这样会导致开发环境非常复杂
if (!isProduction) {
    let staticFiles = require('./static-files');
    app.use(staticFiles('/static/', __dirname + '/static'));
}
// 解析POST请求
app.use(bodyParser());
// 给ctx加上render()来使用Nunjucks
app.use(templating('views', {
    noCache: !isProduction,
    watch: !isProduction
}));

//404页面, 根据文档https://github.com/koajs/examples/blob/master/404/app.js
app.use(function *pageNotFound(next) {
    yield next;

    if (404 != this.status) return;

    // we need to explicitly set 404 here
    // so that koa doesn't assign 200 on body=
    this.status = 404;

    switch (this.accepts('html', 'json')) {
        case 'html':
            this.type = 'html';
            this.body = '<p>页面不存在</p>';
            break;
        case 'json':
            this.body = {
                message: '页面不存在'
            };
            break;
        default:
            this.type = 'text';
            this.body = '页面不存在';
    }
});

// bind .rest() for ctx:
app.use(rest.restify());

// 处理URL路由
app.use(controller());
app.listen(3000);
console.log('app started at port 3000...');