import tracer from 'tracer';
import appRootDir from 'app-root-dir';
import path from 'path';
import {Task as Task}  from '../../tools/model';
import {cookie2user} from '../../tools/cookie';
import {session as session} from '../../tools/config';
import {uploadFile} from '../../tools/upload';

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
    let reward = ctx.request.body.reward;

    let serverFilePath = path.join(appRootDir.get(), 'upload_files');

    // 上传文件事件
    let getRandomInt = (min, max) => {
        return Math.floor(Math.random() * (max - min + 1) + min);
    };
    let firstDir = getRandomInt(0, 9);
    let secondDir = getRandomInt(0, 9);
    let result = await uploadFile(ctx, {
        fileType: 'album/' + firstDir + '/' + secondDir,
        path: serverFilePath
    });
    let picture = result.filename;

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