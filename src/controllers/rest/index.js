import {User as User}  from '../../tools/model';
import cookie from '../../tools/cookie';
import {session as session} from '../../tools/config';
import tracer from 'tracer';

let logger = tracer.console();

let publish = async ctx => {
    let name = ctx.request.body.name;
    let wx = ctx.request.body.wx;
    let tel = ctx.request.body.tel;
    let qq = ctx.request.body.qq;

    let schoolResourceShareCookie = ctx.cookies.get(session.cookieName);
    let user = await cookie.cookie2user(schoolResourceShareCookie);
    let result = await User.update({
        wx: wx,
        name: name,
        tel: tel,
        qq: qq
    }, {
        where: {
            id: user.id
        }
    });
    if (!result) {
        logger.warn('写入用户信息失败');
    }
};


module.exports = {
    'POST /api/publish': publish
};