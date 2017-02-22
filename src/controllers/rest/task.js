import tracer from 'tracer';
import {Task as Task}  from '../../tools/model';
import {cookie2user as cookie2user} from '../../tools/cookie';
import {session as session} from '../../tools/config';

let logger = tracer.console();

let completedTasks = async ctx => {

};

let publish = async ctx => {
    let schoolResourceShareCookie = ctx.cookies.get(session.cookieName);
    let user = await cookie2user(schoolResourceShareCookie);

    let userId = user.id;
    let type = ctx.request.body.taskType;
    let name = ctx.request.body.name;
    let tel = ctx.request.body.tel;
    let deadline = ctx.request.body.deadline;
    let detail = ctx.request.body.detail;
    let picture = ctx.request.body.picture;
    let reward = ctx.request.body.reward;
    logger.info(userId);
    logger.info(type);
    logger.info(name);
    logger.info(tel);
    logger.info(deadline);
    logger.info(detail);
    logger.info(picture);
    logger.info(reward);

    await Task.create({
        userId: userId,
        type: type,
        name: name,
        tel: tel,
        deadline: deadline,
        detail: detail,
        picture: picture,
        reward: reward
    });
};


module.exports = {
    'POST /api/completedTasks': completedTasks,
    'POST /api/publish': publish
};