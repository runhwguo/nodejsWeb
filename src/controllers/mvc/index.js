import {cookie2user} from '../../tools/cookie';
import {session} from '../../tools/config';
import {mkDirsSync} from '../../tools/upload';
import fs from 'fs';
import uuid from 'uuid';
import path from 'path';
import appRootDir from 'app-root-dir';
import superagent from 'superagent';
import charset from 'superagent-charset';

charset(superagent);

const DIR = 'mvc/';

let home = async ctx => {
  // query form database TODO
  let data = [
    {
      "type": "代取",
      "location": "第二食堂",
      "reward": "15元",
      "date": "2017-08-08"
    },
    {
      "type": "代取",
      "location": "第二食堂",
      "reward": "15元",
      "date": "2017-08-08"
    }
  ];

  ctx.render(`${DIR}home`, {
    title: '校园资源共享',
    data: data
  });
};

let me = async ctx => {
  ctx.render(`${DIR}myInfo`, {
    title: '我的信息'
  });
};

let createTask = async ctx => {
  let schoolResourceShareCookie = ctx.cookies.get(session.cookieName);
  let user = await cookie2user(schoolResourceShareCookie);
  ctx.render(`${DIR}createTask`, {
    title: '发布任务',
    user: user
  });
};

let login = async ctx => {
  const UJS_MAIN_URL = 'http://my.ujs.edu.cn/';
  const captchaGenerateUrl = `${UJS_MAIN_URL}captchaGenerate.portal`;
  const idPng = uuid.v4() + '.png';
  const codeDir = 'static/tmp/verificationCode';
  const codeRealDir = path.join(appRootDir.get(), codeDir);
  if (!mkDirsSync(codeRealDir)) {
    console.error('create ' + codeRealDir + ' dir fail!');
  }
  const verificationCodePicture = path.join(codeRealDir, idPng);
  let verificationCodePictureUrl = path.join(codeDir, idPng);

  let response = await superagent.get(captchaGenerateUrl);
  if (response.ok) {
    console.log('验证码图片获取成功');
    let cookie = response.header['set-cookie'][0].split(';')[0];
    console.log('ujs cookie = ' + cookie);
    ctx.cookies.set(session.ujsCookieName, cookie);
    fs.writeFileSync(verificationCodePicture, response.body, 'binary');
    ctx.render('mvc/login', {
      title: '教务处身份验证',
      verificationCodePictureUrl: verificationCodePictureUrl
    });
  }
};

let userInfo = async ctx => {
  let schoolResourceShareCookie = ctx.cookies.get(session.cookieName);
  let user = await cookie2user(schoolResourceShareCookie);
  ctx.render(`${DIR}userInfo`, {
    title: '完善用户信息',
    user: user
  });
};


module.exports = {
  'GET /': home,
  'GET /me': me,
  'GET /createTask': createTask,
  'GET /login': login,
  "GET /userInfo": userInfo
};