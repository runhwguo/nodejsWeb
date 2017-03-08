import {User}  from '../../tools/model';
import config from '../../tools/config';
import superagent from 'superagent';
import charset from 'superagent-charset';
import cheerio from 'cheerio';
import * as cookie from '../../tools/cookie';

charset(superagent);

let login = async ctx => {
  let schoolResourceShareCookie = ctx.cookies.get(config.session.cookieName);
  let ujsCookieName = ctx.cookies.get(config.session.ujsCookieName);
  let user = null;
  if (schoolResourceShareCookie) {
    user = await cookie.cookie2user(schoolResourceShareCookie);
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

    let isSuccessful = false;
    if (verificationCodeReg.test(verificationCode)) {
      let iPlanetDirectoryProCookie = await login();
      isSuccessful = await getUserInfo(iPlanetDirectoryProCookie);
    }

    async function getUserInfo(iPlanetDirectoryProCookie) {
      if (iPlanetDirectoryProCookie) {
        let response = await superagent
          .get(STU_INFO)
          .set('Cookie', iPlanetDirectoryProCookie);
        const ASP_NET_SessionId = response.header['set-cookie'][0].split(';')[0];
        console.log(response.header['set-cookie'][0]);

        await superagent
          .get(STU_INFO_LOGIN)
          .set('Cookie', iPlanetDirectoryProCookie + '; ' + ASP_NET_SessionId);

        response = await superagent
          .get(STU_INFO)
          .set('Cookie', ASP_NET_SessionId);
        let $ = cheerio.load(response.text);

        let name = $('#y_xm').text();
        let gender = $('#y_xbdm').text();
        let qq = $('#y_qq').text();
        let tel = $('#y_cell').text();
        await User.upsert({
          id: username,
          name: name,
          password: password,
          tel: tel,
          qq: qq,
          gender: gender
        });
        user = await User.findById(username);
        return true;
      }
      return false;
    }

    async function login() {
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
      return '';
    }


    if (user && isSuccessful) {
      ctx.cookies.set(config.session.cookieName, cookie.user2cookie(username, password));
    }
  }
  ctx.rest({
    result: !!user
  });
};

module.exports = {
  'POST /api/login': login
};