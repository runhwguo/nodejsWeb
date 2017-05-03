import Koa from "koa";
import bodyParser from "koa-bodyparser";
import logger from "koa-logger";
import controller from "./tool/controller";
import templating from "./tool/templating";
import schedule from "./tool/schedule";
import {cookie2user} from "./tool/cookie";
import staticFiles from "./tool/static_files";
import {restify} from "./tool/rest";
import {project, session} from "./tool/config";
import appRootDir from "app-root-dir";

const app = new Koa();

app.proxy = true;

const isProduction = process.env.NODE_ENV === 'production';
// 打印url和请求时间 middleware
app.use(logger());

//wechat pay
app.use(async (ctx, next) => {
  let reqPath = ctx.request.path;
  if (reqPath === '/MP_verify_LXFIuaHyNWtcqG7k.txt') {
    ctx.response.type = 200;
    ctx.response.body = 'LXFIuaHyNWtcqG7k';
  } else {
    await next();
  }
});

// auth
app.use(async (ctx, next) => {
  let userLoginCookie = ctx.cookies.get(session.userCookieName);
  let user = await cookie2user(userLoginCookie, session.userCookieName);
  if (user) {
    ctx.state.user = user;
  }
  let reqPath = ctx.request.path;
  if (reqPath.startsWith('/admin')) {
    let adminLoginCookie = ctx.cookies.get(session.adminCookieName);
    let admin = await cookie2user(adminLoginCookie, session.adminCookieName);
    if (admin) {
      await next();
    } else if (!reqPath.startsWith('/admin/login')) {
      ctx.response.redirect('/admin/login');
    } else {
      await next();
    }
  } else {
    if (user || reqPath === '/' || reqPath.startsWith('/static') || reqPath === '/login' || reqPath.startsWith('/api')) {
      await next();
    } else {
      ctx.response.redirect('/login');
    }
  }
});

app.use(staticFiles('/static/', `${appRootDir.get()}/static`));
// 解析原始request请求，nodejs的request和koa的request都不解析request
app.use(bodyParser());
// 给ctx加上render()来使用Nunjucks middleware
app.use(templating('view', {
  noCache: !isProduction,
  watch: !isProduction
}));

// bind .rest() for ctx:
app.use(restify());

// 处理URL路由
app.use(controller());

app.listen(project.port);
const uri = `http://localhost:${project.port}`;
console.log(`app started at port ${uri}...`);
if (process.env.NODE_ENV !== 'production') {
  console.log('不是生产环境');
}
console.log(`node is running in ${process.env.NODE_ENV}`);


// 运行定时服务
schedule();