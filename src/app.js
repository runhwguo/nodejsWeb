import Koa from "koa";
import bodyParser from "koa-bodyparser";
import logger from "koa-logger";
import controller from "./tools/controller";
import templating from "./tools/templating";
import {cookie2user} from "./tools/cookie";
import staticFiles from "./tools/static_files";
import {restify} from "./tools/rest";
import {project, session} from "./tools/config";
import appRootDir from "app-root-dir";

const app = new Koa();

app.proxy = true;

const isProduction = process.env.NODE_ENV === 'production';
// 打印url和请求时间 middleware
app.use(logger());

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
    } else {
      ctx.response.redirects('admin/login');
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
app.use(templating('views', {
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