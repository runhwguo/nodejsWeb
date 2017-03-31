import {cookie2user} from "../../tools/cookie";
import {session} from "../../tools/config";
import {mkDirsSync} from "../../tools/upload";
import {Task} from "../../tools/model";
import fs from "fs";
import uuid from "uuid";
import path from "path";
import appRootDir from "app-root-dir";
import superagent from "superagent";
import charset from "superagent-charset";

charset(superagent);

const index = async ctx => {
  ctx.render(`index`, {
    title: '校园资源共享',
    where: 'index'
  });
};

const me = async ctx => {
  let user = ctx.state.user;
  let data = {
    title: '我的信息'
  };
  let badge = 0;
  if (badge) {
    data.badge = badge;
  }
  ctx.render(`myInfo`, {
    title: '我的信息'
  });
};

const createTask = async ctx => {
  let schoolResourceShareCookie = ctx.cookies.get(session.cookieName);
  let user = await cookie2user(schoolResourceShareCookie);
  ctx.render(`task/createTask`, {
    title: '发布任务',
    user: user
  });
};

const login = async ctx => {
  const UJS_MAIN_URL = 'http://my.ujs.edu.cn/';
  const captchaGenerateUrl = `${UJS_MAIN_URL}captchaGenerate.portal`;
  const idPng = uuid.v4() + '.png';
  const codeDir = 'static/tmp/verificationCode';
  const codeRealDir = path.join(appRootDir.get(), codeDir);
  if (!mkDirsSync(codeRealDir)) {
    console.error('create ' + codeRealDir + ' dir fail!');
  }
  const verificationCodePicture = path.join(codeRealDir, idPng),
    verificationCodePictureUrl = path.join(codeDir, idPng);

  let response = await superagent.get(captchaGenerateUrl);
  if (response.ok) {
    console.log('验证码图片获取成功');
    let cookie = response.header['set-cookie'][0].split(';')[0];
    console.log('ujs cookie = ' + cookie);
    ctx.cookies.set(session.ujsCookieName, cookie,
      {
        maxAge: session.maxAge * 1000
      }
    );
    fs.writeFileSync(verificationCodePicture, response.body, 'binary');
    ctx.render('login', {
      title: '教务处身份验证',
      verificationCodePictureUrl: verificationCodePictureUrl
    });
  }
};

const userInfo = async ctx => {
  let schoolResourceShareCookie = ctx.cookies.get(session.cookieName);
  let user = await cookie2user(schoolResourceShareCookie);
  ctx.render(`userInfo`, {
    title: '完善用户信息',
    user: user
  });
};


module.exports = {
  'GET /': index,
  'GET /me': me,
  'GET /createTask': createTask,
  'GET /login': login,
  'GET /userInfo': userInfo
};