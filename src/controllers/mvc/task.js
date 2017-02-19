let unfinishedTasks = async ctx => {
    // simulate data
    let data = [
        {
            "type": "代课",
            "location": "三江楼马克思",
            "reward": "10"
        },{
            "type": "代课",
            "location": "三江楼马克思",
            "reward": "10"
        },{
            "type": "代课",
            "location": "三江楼马克思",
            "reward": "10"
        },{
            "type": "代课",
            "location": "三江楼马克思",
            "reward": "10"
        },{
            "type": "代课",
            "location": "三江楼马克思",
            "reward": "10"
        }
    ];

    ctx.render('rest/completedTasks.html', {
        title: '已完成的任务',
        data: data
    })
};
let completedTasks = async ctx => {
    // simulate data
    let data = [
        {
            "type": "代课",
            "location": "三江楼马克思",
            "reward": "10"
        },{
            "type": "代课",
            "location": "三江楼马克思",
            "reward": "10"
        },{
            "type": "代课",
            "location": "三江楼马克思",
            "reward": "10"
        },{
            "type": "代课",
            "location": "三江楼马克思",
            "reward": "10"
        },{
            "type": "代课",
            "location": "三江楼马克思",
            "reward": "10"
        }
    ];

    ctx.render('rest/completedTasks.html', {
        title: '已完成的任务',
        data: data
    })
};
let sentTasks = async ctx => {
    // simulate data
    let data = [
        {
            "type": "代课",
            "location": "三江楼马克思",
            "reward": "10"
        },{
            "type": "代课",
            "location": "三江楼马克思",
            "reward": "10"
        },{
            "type": "代课",
            "location": "三江楼马克思",
            "reward": "10"
        },{
            "type": "代课",
            "location": "三江楼马克思",
            "reward": "10"
        },{
            "type": "代课",
            "location": "三江楼马克思",
            "reward": "10"
        }
    ];

    ctx.render('rest/completedTasks.html', {
        title: '已完成的任务',
        data: data
    })
};
let myInfo = async ctx => {
    // simulate data
    let data = [
        {
            "type": "代课",
            "location": "三江楼马克思",
            "reward": "10"
        },{
            "type": "代课",
            "location": "三江楼马克思",
            "reward": "10"
        },{
            "type": "代课",
            "location": "三江楼马克思",
            "reward": "10"
        },{
            "type": "代课",
            "location": "三江楼马克思",
            "reward": "10"
        },{
            "type": "代课",
            "location": "三江楼马克思",
            "reward": "10"
        }
    ];

    ctx.render('rest/completedTasks.html', {
        title: '已完成的任务',
        data: data
    })
};

module.exports = {
    'GET /unfinishedTasks': unfinishedTasks,
    'GET /completedTasks': completedTasks,
    'GET /sentTasks': sentTasks,
    'GET /myInfo': myInfo
};