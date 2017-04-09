import {cookie2user} from '../../tools/cookie';
import {session} from '../../tools/config';
import {getUserUnfinishedTasks} from '../../tools/multi_dao';
import {mkDirsSync} from '../../tools/upload';
import fs from 'fs';
import uuid from 'uuid';
import path from 'path';
import appRootDir from 'app-root-dir';
import superagent from 'superagent';
import charset from 'superagent-charset';
import * as Dao from '../../tools/dao';
import {Task} from '../../tools/model';
import {TASK_STATE} from '../../models/Task';

charset(superagent);

const index = async ctx => {
  ctx.render(`index`, {
    title: '校园资源共享',
    where: 'index'
  });
};

const me = async ctx => {
  let user = ctx.state.user;
  let result = await getUserUnfinishedTasks(user.id);
  let data = {
    title: '我的信息',
    username: user.name,
    gender: user.gender
  };
  let unfinishedBadge = result.length;
  if (unfinishedBadge) {
    data.unfinishedBadge = unfinishedBadge;
  }

  result = await Dao.count(Task, {
    where: {
      userId: user.id,
      state: Object.keys(TASK_STATE)[3]
    }
  });
  if (result) {
    data.unPaidBadge = result;
  }
  ctx.render(`my_info`, data);
};

const createTask = async ctx => {
  let schoolResourceShareCookie = ctx.cookies.get(session.userCookieName);
  let user = await cookie2user(schoolResourceShareCookie, session.userCookieName);
  ctx.render(`task/create_task`, {
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
    ctx.cookies.set(session.ujsCookieName, cookie, {
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
  let schoolResourceShareCookie = ctx.cookies.get(session.userCookieName);
  let user = await cookie2user(schoolResourceShareCookie,session.userCookieName);
  let where = ctx.query.where;
  ctx.render(`user_info`, {
    title: '完善用户信息',
    user: user,
    where: where
  });
};


module.exports = {
  'GET /': index,
  'GET /me': me,
  'GET /createTask': createTask,
  'GET /login': login,
  'GET /userInfo': userInfo
};