import fs from 'fs';
import uuid from 'uuid';
import path from 'path';
import Superagent from 'superagent';
import AppRootDir from 'app-root-dir';
import charset from 'superagent-charset';
import Tracer from 'tracer';

import {session} from '../../tool/config';
import * as Common from '../../tool/common';
import {count} from '../../tool/user_task_dao';
import {mkDirsSync} from '../../tool/upload';
import * as Dao from '../../tool/dao';
import {TASK_STATE} from '../../model/Task';
import * as wxPay from '../../tool/wx_pay';
import {Task, User} from '../../tool/model';

const console = Tracer.console();

charset(Superagent);

// 公众号的Click按钮  引导用户同意授权
const index = async ctx => {
  let code  = ctx.query.code,
      state = ctx.query.state;
  console.log('state = ' + state + ', code = ' + code);

  if (code) {
    let [accessToken, openId] = await wxPay.getAccessTokenOpenId(code);
    let headImgUrl            = await wxPay.getUserInfo(accessToken, openId);
    await _storageHeadImgUrl(ctx, headImgUrl);
    ctx.cookies.set(session.wxOpenId, openId, {
      maxAge: session.maxAge * 1000
    });
  }
  // console.log('openId = ' + openId);
  ctx.render('index', {
    title: '校园资源共享',
    where: 'index'
  });
};

const _storageHeadImgUrl = async (ctx, headImgUrl) => {
  let user = ctx.state.user;
  if (user) {
    if (headImgUrl !== user.headImgUrl) {
      user.headImgUrl = headImgUrl;
      console.log('拿到头像 url -> ' + headImgUrl);
      await Dao.update(User,
        {
          headImgUrl: headImgUrl
        },
        {
          where: {
            id: user.id
          }
        });
    }
  } else {
    // 用户没登录，先把头像存在cookie中，等用户登录时，再写入user
    ctx.cookies.set(session.headImgUrl,
      headImgUrl,
      {
        maxAge: session.maxAge * 1000
      });
  }
};

const me = async ctx => {
  let user       = ctx.state.user,
      headImgUrl = ctx.cookies.get(session.headImgUrl);

  await _storageHeadImgUrl(ctx, headImgUrl);

  let unfinishedBadge = await count(user.id, TASK_STATE.completing);
  let data            = {
    title: '我的信息',
    username: user.name,
    gender: user.gender,
    headImgUrl: user.headImgUrl
  };
  if (unfinishedBadge) {
    data.unfinishedBadge = unfinishedBadge;
  }

  let unPaidBadge = await Dao.count(Task, {
    where: {
      userId: user.id,
      state: TASK_STATE.completed
    }
  });
  if (unPaidBadge) {
    data.unPaidBadge = unPaidBadge;
  }
  ctx.render('my_info', data);
};

const createTask = async ctx => {
  ctx.render('task/create_task', {
    title: '发布任务',
    user: ctx.state.user
  });
};

const login = async ctx => {
  const UJS_MAIN_URL       = 'http://my.ujs.edu.cn/',
        captchaGenerateUrl = `${UJS_MAIN_URL}captchaGenerate.portal`,
        idPng              = `${ uuid.v4() }.png`,
        codeDir            = `static/tmp/verificationCode/${ Common.getRandomInt() }/${ Common.getRandomInt() }`,
        codeRealDir        = path.join(AppRootDir.get(), codeDir);
  if (!mkDirsSync(codeRealDir)) {
    console.error('create ' + codeRealDir + ' dir fail!');
  }
  const verificationCodePicture    = path.join(codeRealDir, idPng),
        verificationCodePictureUrl = path.join(codeDir, idPng);

  let response = await Superagent.get(captchaGenerateUrl);
  if (response.ok) {
    console.log('验证码图片获取成功');
    let cookie = response.header['set-cookie'][0].split(';')[0];
    console.log('ujs cookie = ' + cookie);
    ctx.cookies.set(session.ujsCookieName,
      cookie,
      {
        maxAge: session.maxAge * 1000
      }
    );
    await fs.writeFile(verificationCodePicture, response.body, 'binary');
    ctx.render('login', {
      title: '教务处身份验证',
      verificationCodePictureUrl: verificationCodePictureUrl
    });
  }
};

const userInfo = async ctx => {
  ctx.render('user_info', {
    title: '完善用户信息',
    user: ctx.state.user,
    where: ctx.query.where
  });
};

const signOut = async ctx => {
  ctx.cookies.set(session.wxOpenId, '');
  ctx.cookies.set(session.userCookieName, '');
  ctx.cookies.set(session.ujsCookieName, '');

  ctx.render('index', {
    title: '校园资源共享',
    where: 'index'
  });
};

module.exports = {
  'GET /': index,
  'GET /me': me,
  'GET /createTask': createTask,
  'GET /login': login,
  'GET /userInfo': userInfo,
  'GET /userInfo/signOut': signOut
};