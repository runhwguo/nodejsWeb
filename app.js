const Koa = require('koa');
const bodyParser = require('koa-bodyparser');
const controller = require('./controller');
const templating = require('./templating');


const app = new Koa();
const NODE_ENV = 'development';
// const NODE_ENV = 'production';
const isProduction = NODE_ENV === 'production';

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
app.use(templating('view', {
    noCache: !isProduction,
    watch: !isProduction
}));
// 处理URL路由
app.use(controller());
app.listen(3000);
console.log('app started at port 3000...');