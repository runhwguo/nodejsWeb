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

let myinfo = async ctx => {

    ctx.render('mvc/myinfo.html', {
        title: '我的信息'
    })
};

let createTask = async ctx => {

    ctx.render('mvc/createTask.html', {
        title: '发布任务'
    })
};

let login = async ctx => {
    ctx.render('mvc/login.html', {
        title: '教务处身份验证'
    })
};

let contactInfo = async ctx => {
    ctx.render('mvc/contactInfo.html', {
        title: '填写联系方式'
    })
};


module.exports = {
    'GET /': home,
    'GET /myinfo': myinfo,
    'GET /createTask': createTask,
    'GET /login': login,
    'GET /contactInfo': contactInfo
};