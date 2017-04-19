import {User} from '../../tools/model';
import config from '../../tools/config';
import superagent from 'superagent';
import charset from 'superagent-charset';
import cheerio from 'cheerio';
import sha1 from 'sha1';
import * as cookie from '../../tools/cookie';

charset(superagent);

const login = async ctx => {
  let schoolResourceShareCookie = ctx.cookies.get(config.session.userCookieName);
  let ujsCookieName = ctx.cookies.get(config.session.ujsCookieName);
  let user = null;
  if (schoolResourceShareCookie) {
    user = await cookie.cookie2user(schoolResourceShareCookie, config.session.userCookieName);
  }
  if (!user) {
    const UJS_MAIN_URL = 'http://my.ujs.edu.cn/';
    const CHAR_SET = 'utf-8';
    let username = ctx.request.body.id;
    let password = ctx.request.body.password;
    let verificationCode = ctx.request.body.verificationCode;
    const verificationCodeReg = /^[0-9a-zA-Z]{4}$/;

    const userPasswordValidateUrl = `${UJS_MAIN_URL}userPasswordValidate.portal`;
    const loginSuccessUrl = `${UJS_MAIN_URL}loginSuccess.portal`;
    const loginFailureUrl = `${UJS_MAIN_URL}loginFailure.portal`;

    const STU_INFO_LOGIN = 'http://stu.ujs.edu.cn/mobile/login.aspx';
    const STU_INFO = 'http://stu.ujs.edu.cn/mobile/rsbulid/r_3_3_st_jbxg.aspx';

    const _getUserInfo = async iPlanetDirectoryProCookie => {
      if (iPlanetDirectoryProCookie) {
        let ASP_NET_SessionId=null;
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
        let $ = cheerio.load(response.text);

        let name = $('#y_xm').text(),
          gender = $('#y_xbdm').text(),
          qq = $('#y_qq').text(),
          tel = $('#y_cell').text();
        await User.upsert({
          id: username,
          name: name,
          password: sha1(password),
          tel: tel,
          qq: qq,
          gender: gender
        });
        user = await User.findByPrimary(username);
        return true;
      }
    };

    const _login = async ()=> {
      let response = await superagent
        .post(userPasswordValidateUrl)
        .send('Login.Token1=' + username)
        .send('Login.Token2=' + password)
        .send('captchaField=' + verificationCode)
        .send('goto=' + loginSuccessUrl)
        .send('gotoOnFail=' + loginFailureUrl)
        .set('Cookie', ujsCookieName)
        .charset(CHAR_SET);
      if (response.ok) {
        return response.header['set-cookie'];
      }
    };

    let isSuccessful = false;
    if (verificationCodeReg.test(verificationCode)) {
      let iPlanetDirectoryProCookie = await _login();
      isSuccessful = await _getUserInfo(iPlanetDirectoryProCookie);
    }

    if (user && isSuccessful) {
      ctx.cookies.set(config.session.userCookieName, cookie.user2cookie(username, sha1(password), config.session.userCookieName), {
          maxAge: config.session.maxAge * 1000
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