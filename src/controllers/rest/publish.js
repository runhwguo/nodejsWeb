import {User as User}  from '../../tools/model';
import tracer from 'tracer';

let logger = tracer.console();

let publish = async ctx => {
    let name = ctx.request.body.name;
    let wx = ctx.request.body.wx;
    let tel = ctx.request.body.tel;
    let qq = ctx.request.body.qq;
    // TODO 补全信息
    let result = await User.update({
        wx: wx,
        name: name,
        tel: tel,
        qq: qq
    });
    if (!result) {
        logger.warn('写入用户信息失败');
    }
};


module.exports = {
    'POST /api/publish': publish
};