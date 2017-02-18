import {APIError as APIError} from '../../tools/rest';
import {User as User}  from '../../tools/model';
import fs from 'fs';
import config from '../../tools/config';
import superagent from 'superagent';
import charset from 'superagent-charset';
import cheerio from 'cheerio';
import cookie from '../../tools/cookie';

charset(superagent);

let login = async ctx => {
    let schoolResourceShareCookie = ctx.cookies.get(config.session.cookieName);
    let user = null;
    if (!schoolResourceShareCookie) {
        const UJS_MAIN_URL = 'http://my.ujs.edu.cn/';
        const CHAR_SET = 'utf-8';
        let username = ctx.request.body.id;
        let password = ctx.request.body.password;
        let verificationCode;
        const verificationCodeReg = /^[0-9a-zA-Z]{4}$/;

        const userPasswordValidateUrl = UJS_MAIN_URL + 'userPasswordValidate.portal';
        const captchaGenerateUrl = UJS_MAIN_URL + 'captchaGenerate.portal';
        const loginSuccessUrl = UJS_MAIN_URL + 'loginSuccess.portal';
        const loginFailureUrl = UJS_MAIN_URL + 'loginFailure.portal';
        //http://stu.ujs.edu.cn/Mobile/rsbulid/r_3_3_st_jbxg.aspx

        const STU_INFO_LOGIN = 'http://stu.ujs.edu.cn/mobile/login.aspx';
        const STU_INFO = 'http://stu.ujs.edu.cn/mobile/rsbulid/r_3_3_st_jbxg.aspx';
// baidu ocr
        const BAIDU_OCR_INDEX_URL = 'http://apistore.baidu.com/idlapi/';
        const verificationCodePicture = 'out.png'; // 注意路径

// jinapdf ocr
        const JINA_OCR_INDEX_URL = 'http://www.jinapdf.com/cn/image-to-text-file.php';
        // const downloadUrl = 'http://www.jinapdf.com/download.php?file=/home/clients/client0/web13/web/uploads/17704707721770470772/converted_1770470772.txt';
        let response = await superagent.get(captchaGenerateUrl);
        if (response.ok) {
            console.log('验证码图片获取成功');
            let cookie = response.header['set-cookie'][0].split(';')[0];
            fs.writeFileSync(verificationCodePicture, response.body, 'binary');

            response = await superagent
                .post(JINA_OCR_INDEX_URL)
                .attach('picture', verificationCodePicture);

            if (response.ok) {
                let $ = cheerio.load(response.text);
                let downloadUrl = 'http://www.jinapdf.com' + $('#downloadfile').find('.download-file').attr('href').split('..')[1];

                response = await superagent.get(downloadUrl).buffer();
                verificationCode = response.body.toString();
                verificationCode = verificationCode.replace(/\s+/g, '').replace(/[>?]/g, '7');
                console.log('jinapdf识别出来的验证码是：' + verificationCode + ', len = ' + verificationCode.length);
                let isSuccessful = false;
                if (verificationCodeReg.test(verificationCode)) { // 如果jinapdf识别的不是四位数，再让baidu去识别
                    let iPlanetDirectoryProCookie = await login();
                    isSuccessful = await getUserInfo(iPlanetDirectoryProCookie);
                }
                if (!isSuccessful) {
                    console.log('jinapdf识别出来有误, 让baidu识别');
                    await baiduGetVerificationCode();
                }
            } else {
                console.log('往jinapdf上传图片失败');
            }

            async function baiduGetVerificationCode() {
                let BAIDUIDCookie;
                response = await superagent
                    .get(BAIDU_OCR_INDEX_URL)
                    .query({
                        r: 'demo/ocr',
                        type: 'LocateRecognize',
                        tag: true,
                        apiserviceid: 969
                    });

                if (response.ok) {
                    console.log('baidu识别图片成功');
                    BAIDUIDCookie = response.header['set-cookie'][0];
                    let $ = cheerio.load(response.body);
                    let im = 'C:\\fakepath\\' + verificationCodePicture;
                    response = await superagent
                        .post(BAIDU_OCR_INDEX_URL)
                        .query({
                            r: 'demo/ocrret',
                            type: 'LocateRecognize',
                            im: im
                        })
                        .attach('image', verificationCodePicture)
                        .set('Cookie', BAIDUIDCookie);
                    if (response.ok) {
                        $ = cheerio.load(response.text);
                        verificationCode = $('table.table_list tr:nth-last-child(1) td:nth-child(2)').text().replace(/\s+/g, '').replace(/[>?]/g, '7');
                        console.log('baidu识别出来的验证码是：' + verificationCode + ', len = ' + verificationCode.length);
                        let isSuccessful = false;
                        if (verificationCodeReg.test(verificationCode)) {
                            let iPlanetDirectoryProCookie = await login();
                            isSuccessful = await getUserInfo(iPlanetDirectoryProCookie);
                        }
                        if (!isSuccessful) {
                            throw new APIError('login:both_engine_recognise_fail', 'should request once more.');
                        }
                    } else {
                        console.log('baidu取验证码结果失败');
                    }
                } else {
                    console.log('baidu识别验证码失败');
                }
            }

            async function getUserInfo(iPlanetDirectoryProCookie) {
                if (iPlanetDirectoryProCookie) {
                    iPlanetDirectoryProCookie = response.header['set-cookie'][0].split(';')[0];
                    response = await superagent
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
                response = await superagent
                    .post(userPasswordValidateUrl)
                    .send('Login.Token1=' + username)
                    .send('Login.Token2=' + password)
                    .send('captchaField=' + verificationCode)
                    .send('goto=' + loginSuccessUrl)
                    .send('gotoOnFail=' + loginFailureUrl)
                    .set('Cookie', cookie)
                    .charset(CHAR_SET);
                if (response.ok) {
                    return response.header['set-cookie'];
                }
                return '';
            }
        } else {
            throw new APIError('login:access_verification_code_fail', 'access verification code fail.');
        }

        if (user) {
            ctx.cookies.set(config.session.cookieName, cookie.user2cookie(username, password));
        }
    } else {
        user = await cookie.cookie2user(schoolResourceShareCookie);
    }

    ctx.rest({
        user: user.dataValues
    });
};

module.exports = {
    'POST /api/login': login
};