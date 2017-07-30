import Koa from 'koa';
import bodyParser from 'koa-bodyparser';
import KoaXml from 'koa-xml-body';
import logger from 'koa-logger';
import controller from './tool/controller';
import templating from './tool/templating';
import * as schedule from './tool/schedule';
import {cookie2user} from './tool/cookie';
import staticFiles from './tool/static_files';
import {restify} from './tool/rest';
import config from './tool/config';
import appRootDir from 'app-root-dir';
import IP from 'ip';

const session = config.session,
      app     = new Koa(),
      isProduction = config.project.isProduction;

// Ngnix remote ip代理
app.proxy = true;

// 打印url和请求时间 middleware
app.use(logger());

//wechat web page auth
app.use(async (ctx, next) => {
  let reqPath = ctx.request.path;
  if (reqPath === '/MP_verify_LXFIuaHyNWtcqG7k.txt') {
    ctx.response.type = 200;
    ctx.response.body = 'LXFIuaHyNWtcqG7k';
  } else {
    await next();
  }
});

const _generateUser = async (ctx) => {
  let userLoginCookie = ctx.cookies.get(session.userCookieName);
  let user            = await cookie2user(userLoginCookie, session.userCookieName);
  if (user) {
    ctx.state.user = user;
  }

  return !!user;
};

const _userAuth = async (ctx, next) => {
  if (await _generateUser(ctx)) {
    await next();
  } else {
    ctx.response.redirect('/login');
  }
};

// user & admin auth
app.use(async (ctx, next) => {
  let reqPath = ctx.request.path;
  if (reqPath.startsWith('/admin')) {
    let adminLoginCookie = ctx.cookies.get(session.adminCookieName);
    let admin            = await cookie2user(adminLoginCookie, session.adminCookieName);
    if (admin || reqPath.startsWith('/admin/login')) {
      await next();
    } else {
      ctx.response.redirect('/admin/login');
    }
  } else if (reqPath.startsWith('/api/')) {
    let reqApiPath = reqPath.substr('/api/'.length);
    // 不user鉴权
    if (reqApiPath.startsWith('wechat') ||
      reqApiPath.startsWith('login') ||
      reqApiPath.startsWith('admin/login') ||
      reqApiPath.startsWith('task/get') // 没登录的情况下，也可以看发布的任务
    ) {
      await _generateUser(ctx);
      await next();
    } else {
      await _userAuth(ctx, next);
    }
  } else {
    // 不user鉴权
    if (reqPath.startsWith('/static') || // 静态资源
      reqPath.startsWith('/login') || // 登录
      reqPath === '/') {
      await next();
    } else {
      await _userAuth(ctx, next);
    }
  }
});

app.use(staticFiles('/static/', `${appRootDir.get()}/${isProduction ? 'dist' : 'static'}`));

// 解析body xml
app.use(KoaXml({
  xmlOptions: {
    explicitArray: false
  }
}));
// 解析原始request请求，nodejs的request和koa的request都不解析request
app.use(bodyParser());
// 给ctx加上render()来使用Nunjucks middleware
app.use(templating({
  noCache: !isProduction,
  watch: !isProduction
}));

// bind .rest() for ctx:
app.use(restify());

// 处理URL路由
app.use(controller());

app.listen(config.project.port);
const uri = `http://${IP.address()}:${config.project.port}`;
console.log(`app started at port ${uri}...`);
console.log(`node is running in ${process.env.NODE_ENV}`);

process.on('exit', code => {
  schedule.cancelSchedule();

  console.log('进程退出码是:', code);
});

// 运行定时服务
schedule.startSchedule();