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
    result['userId'] = userId;
    result['deadline'] = new Date(result['deadline']).getTime();
    console.info(result);

    await Task.create(result);
};


module.exports = {
    'POST /api/completedTasks': completedTasks,
    'POST /api/publish': publish
};