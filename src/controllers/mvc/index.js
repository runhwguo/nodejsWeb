import {cookie2user as cookie2user} from '../../tools/cookie';
import {session as session} from '../../tools/config';
import fs from 'fs';
import uuid from 'uuid';
import appRootDir from 'app-root-dir';
import superagent from 'superagent';
import charset from 'superagent-charset';

charset(superagent);

let home = async ctx => {
    // simulate data
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

    ctx.render('mvc/home.html', {
        title: '校园资源共享',
        data: data
    });
};

let me = async ctx => {
    ctx.render('mvc/myInfo.html', {
        title: '我的信息'
    });
};

let createTask = async ctx => {
    let schoolResourceShareCookie = ctx.cookies.get(session.cookieName);
    let user = await cookie2user(schoolResourceShareCookie);
    ctx.render('mvc/createTask.html', {
        title: '发布任务',
        user: user
    });
};

let login = async ctx => {
    const UJS_MAIN_URL = 'http://my.ujs.edu.cn/';
    const captchaGenerateUrl = UJS_MAIN_URL + 'captchaGenerate.portal';
    const id = uuid.v4();
    const verificationCodePicture = appRootDir.get() + '/static/tmp/' + id + '.png';
    let verificationCodePictureUrl = 'http://localhost:8080/static/tmp/' + id + '.png';

    let response = await superagent.get(captchaGenerateUrl);
    if (response.ok) {
        console.log('验证码图片获取成功');
        let cookie = response.header['set-cookie'][0].split(';')[0];
        console.log('ujs cookie = ' + cookie)
        ctx.cookies.set(session.ujsCookieName, cookie);
        fs.writeFileSync(verificationCodePicture, response.body, 'binary');
        ctx.render('mvc/login.html', {
            title: '教务处身份验证',
            verificationCodePictureUrl: verificationCodePictureUrl
        });
    }
};

let userInfo = async ctx => {
    let schoolResourceShareCookie = ctx.cookies.get(session.cookieName);
    let user = await cookie2user(schoolResourceShareCookie);
    ctx.render('mvc/userInfo.html', {
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