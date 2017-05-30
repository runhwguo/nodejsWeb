import {User} from '../../tool/model';
import config from '../../tool/config';
import superagent from 'superagent';
import charset from 'superagent-charset';
import cheerio from 'cheerio';
import sha1 from 'sha1';
import * as cookie from '../../tool/cookie';

charset(superagent);

const login = async ctx => {
  let schoolResourceShareCookie = ctx.cookies.get(config.session.userCookieName),
      ujsCookieName             = ctx.cookies.get(config.session.ujsCookieName),
      user                      = null;
  if (schoolResourceShareCookie) {
    user = await cookie.cookie2user(schoolResourceShareCookie, config.session.userCookieName);
  }
  if (!user) {
    const URL_UJS_MAIN        = 'http://my.ujs.edu.cn/';
    let username              = ctx.request.body.id;
    let password              = ctx.request.body.password;
    let verificationCode      = ctx.request.body.verificationCode;
    const verificationCodeReg = /^[0-9a-zA-Z]{4}$/;

    const URL_USER_PASSWORD_VALIDATE = `${URL_UJS_MAIN}userPasswordValidate.portal`,
          URL_LOGIN_SUCCESS          = `${URL_UJS_MAIN}loginSuccess.portal`,
          URL_LOGIN_FAILURE          = `${URL_UJS_MAIN}loginFailure.portal`,
          STU_INFO_LOGIN             = 'http://stu.ujs.edu.cn/mobile/login.aspx',
          STU_INFO                   = 'http://stu.ujs.edu.cn/mobile/rsbulid/r_3_3_st_jbxg.aspx';

    const _getUserInfo = async iPlanetDirectoryProCookie => {
      if (iPlanetDirectoryProCookie) {
        let ASP_NET_SessionId = null;
        try {
          await superagent
            .get(STU_INFO)
            .redirects(0)
            .set('Cookie', iPlanetDirectoryProCookie);
        } catch (e) {
          ASP_NET_SessionId = e.response.header['set-cookie'];
        }

        console.log(ASP_NET_SessionId);

        await superagent
          .get(STU_INFO_LOGIN)
          .set('Cookie', iPlanetDirectoryProCookie + '; ' + ASP_NET_SessionId);

        let response = await superagent
          .get(STU_INFO)
          .set('Cookie', ASP_NET_SessionId);
        let $        = cheerio.load(response.text);

        let name   = $('#y_xm').text(),
            gender = $('#y_xbdm').text(),
            qq     = $('#y_qq').text(),
            tel    = $('#y_cell').text(),
            openId = ctx.cookies.get(config.session.wxOpenId);
        await User.upsert({
          id: username,
          name: name,
          password: sha1(password),
          tel: tel,
          qq: qq,
          gender: gender,
          openId: openId
        });
        user = await User.findByPrimary(username, {
          attributes: ['id']
        });
        user = user.dataValues;
        return true;
      }
    };

    const _login = async () => {
      let response = await superagent
        .post(URL_USER_PASSWORD_VALIDATE)
        .send('Login.Token1=' + username)
        .send('Login.Token2=' + password)
        .send('captchaField=' + verificationCode)
        .send('goto=' + URL_LOGIN_SUCCESS)
        .send('gotoOnFail=' + URL_LOGIN_FAILURE)
        .set('Cookie', ujsCookieName)
        .charset(config.common.char_set_utf8);
      if (response.ok) {
        return response.header['set-cookie'];
      }
    };

    let isSuccessful = false;
    if (verificationCodeReg.test(verificationCode)) {
      let iPlanetDirectoryProCookie = await _login();
      isSuccessful                  = await _getUserInfo(iPlanetDirectoryProCookie);
    }

    if (user && isSuccessful) {
      ctx.cookies.set(config.session.userCookieName,
        cookie.user2cookie(username, sha1(password),
          config.session.userCookieName),
        {
          maxAge: config.session.maxAge * 7 * 1000
        }
      );
    }
  }
  ctx.rest({
    result: !!user
  });
};

module.exports = {
  'POST /api/login': login
};