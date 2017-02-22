import {cookie2user as cookie2user} from '../../tools/cookie';
import {session as session} from '../../tools/config';

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
    })
};

let me = async ctx => {
    ctx.render('mvc/myInfo.html', {
        title: '我的信息'
    })
};

let createTask = async ctx => {
    let schoolResourceShareCookie = ctx.cookies.get(session.cookieName);
    let user = await cookie2user(schoolResourceShareCookie);
    ctx.render('mvc/createTask.html', {
        title: '发布任务',
        user: user
    })
};

let login = async ctx => {
    ctx.render('mvc/login.html', {
        title: '教务处身份验证'
    })
};

let userInfo = async ctx => {
    let schoolResourceShareCookie = ctx.cookies.get(session.cookieName);
    let user = await cookie2user(schoolResourceShareCookie);
    ctx.render('mvc/userInfo.html', {
        title: '完善用户信息',
        user: user
    })
};


module.exports = {
    'GET /': home,
    'GET /me': me,
    'GET /createTask': createTask,
    'GET /login': login,
    "GET /userInfo": userInfo
};