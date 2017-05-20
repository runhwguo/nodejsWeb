import {User} from '../../tool/model';
import {cookie2user} from '../../tool/cookie';
import {session} from '../../tool/config';

const save = async ctx => {
  let name = ctx.request.body.name,
      wx   = ctx.request.body.wx,
      tel  = ctx.request.body.tel,
      qq   = ctx.request.body.qq;

  let schoolResourceShareCookie = ctx.cookies.get(session.userCookieName),
      user                      = await cookie2user(schoolResourceShareCookie, session.userCookieName),
      result                    = await User.update({
    wx: wx,
    name: name,
    tel: tel,
    qq: qq
  }, {
    where: {
      id: user.id
    }
  });
  ctx.rest({
    result: !!result
  });
};


module.exports = {
  'POST /api/save': save
};