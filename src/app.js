import Koa from 'koa';
import bodyParser from 'koa-bodyparser';
import logger from 'koa-logger';
import controller from './tools/controller';
import templating from './tools/templating';
import rest from './tools/rest';
import cookie from './tools/cookie';
import config from './tools/config';

const app = new Koa();

const isProduction = process.env.NODE_ENV === 'production';
// 打印url和请求时间 middleware
app.use(logger());

app.use(async(ctx, next) => {
  let reqPath = ctx.request.path;
  if (!(reqPath === '/' || reqPath.startsWith('/static') || reqPath === '/login' || reqPath.startsWith('/api'))) {
    // console.log('验证用户是否登录');
    let loginCookie = ctx.cookies.get(config.session.cookieName);
    let user = await cookie.cookie2user(loginCookie);
    if (user) {
      // console.log('用户有login state cookieName');
      await next();
    } else {
      // console.log('用户没有login state cookieName');
      ctx.response.redirect('/login');
    }
  } else {
    await next();
  }
});

//在生产环境下，
// 静态文件是由部署在最前面的反向代理服务器（如Nginx）处理的，
// Node程序不需要处理静态文件。
// 而在开发环境下，我们希望koa能顺带处理静态文件，
// 否则，就必须手动配置一个反向代理服务器，
// 这样会导致开发环境非常复杂
if (!isProduction) {
  let staticFiles = require('./tools/static_files');
  // middleware
  app.use(staticFiles('/static/', __dirname + '/../static'));
}
// 解析原始request请求，nodejs的request和koa的request都不解析request
app.use(bodyParser());
// 给ctx加上render()来使用Nunjucks middleware
app.use(templating('views', {
  noCache: !isProduction,
  watch: !isProduction
}));

// bind .rest() for ctx:
app.use(rest.restify());

// 处理URL路由
app.use(controller());
app.listen(8080);
console.log('app started at port 8080...');