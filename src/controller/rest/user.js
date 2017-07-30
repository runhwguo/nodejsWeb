import {cookie2user} from '../../tool/cookie';
import config from '../../tool/config';
import {User} from '../../tool/model';

const save = async ctx => {
  let body = ctx.request.body,
      name = body.name,
      wx   = body.wx,
      tel  = body.tel,
      qq   = body.qq;

  let schoolResourceShareCookie = ctx.cookies.get(config.session.userCookieName),
      user                      = await cookie2user(schoolResourceShareCookie, config.session.userCookieName),
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
  'POST /save': save
};