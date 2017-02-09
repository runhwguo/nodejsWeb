let mvc_index = async ctx => {
    ctx.render('mvc/index.html', {
        title: 'mvc Welcome'
    });
};

let rest_index = async ctx => {
    ctx.render('rest/index.html', {
        title: 'Welcome'
    });
};

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
}

let mvc_signin = async ctx => {
    let name = ctx.request.body.name || '',
        password = ctx.request.body.password || '';
    console.log(`signin with name: ${name}, password: ${password}`);
    if (name === 'koa@qq.com' && password === '123456') {
        ctx.response.body = `<h1>Welcome, ${name}!</h1>`;
    } else {
        ctx.response.body = `<h1>Login failed!</h1>
        <p><a href="/mvc">Try again</a></p>`;
    }
};

module.exports = {
    'GET /mvc': mvc_index,
    'GET /api': rest_index,
    'POST /mvc/signin': mvc_signin,
    'GET /home': home
};