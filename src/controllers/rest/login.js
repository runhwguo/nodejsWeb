import {APIError as APIError} from '../../tools/rest';
import model from '../../tools/model';
import fs from 'fs';
import config from '../../tools/config';
import superagent from 'superagent';
import charset from 'superagent-charset';
import cheerio from 'cheerio';
import cookie from '../../tools/cookie';
import logger from 'tracer';

charset(superagent);
let log = logger.colorConsole();
let User = model.User;

module.exports = {
    'POST /api/login': async ctx => {
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

            const STU_INFO = 'http://stu.ujs.edu.cn/mobile/rsbulid/r_3_3_st_jbxg.aspx';
// baidu ocr
            const BAIDU_OCR_INDEX_URL = 'http://apistore.baidu.com/idlapi/';
            const verificationCodePicture = 'out.png'; // 注意路径

// jinapdf ocr
            const JINA_OCR_INDEX_URL = 'http://www.jinapdf.com/cn/image-to-text-file.php';
            // const downloadUrl = 'http://www.jinapdf.com/download.php?file=/home/clients/client0/web13/web/uploads/17704707721770470772/converted_1770470772.txt';
            let response = await superagent.get(captchaGenerateUrl);
            let name = null;
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
                        isSuccessful = await getUserInfo();
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
                                isSuccessful = await getUserInfo();
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

                async function getUserInfo() {
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
                        let iPlanetDirectoryProCookie = response.header['set-cookie'];
                        if (iPlanetDirectoryProCookie) {
                            iPlanetDirectoryProCookie = response.header['set-cookie'][0].split(';')[0];
                            response = await superagent
                                .get(STU_INFO)
                                .set('Host', 'stu.ujs.edu.cn')
                                .set('Accept', 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8')
                                .set('Accept-Language', 'zh-CN,zh;q=0.8,en;q=0.6')
                                .set('Accept-Encoding', 'gzip, deflate, sdch')
                                .set('Cache-Control', 'no-cache')
                                .set('Connection', 'keep-alive')
                                .set('Pragma', 'no-cache')
                                .set('Upgrade-Insecure-Requests', 1)
                                .set('User-Agent', 'Mozilla/5.0 (iPhone; CPU iPhone OS 9_1 like Mac OS X) AppleWebKit/601.1.46 (KHTML, like Gecko) Version/9.0 Mobile/13B143 Safari/601.1')
                                .set('Cookie', iPlanetDirectoryProCookie);

                            // const ASP_NET_SessionId = response.header['set-cookie'][0].split(';')[0];
                            const ASP_NET_SessionId = response.header['set-cookie'][0].split(';')[0];
                            console.log(response.header['set-cookie'][0]);
                            response = await superagent
                                .get(STU_INFO)
                                .set('Cookie', ASP_NET_SessionId);
                            // console.log(response.text);
                            console.log(iPlanetDirectoryProCookie);
                            console.log(ASP_NET_SessionId);
                            return true;
                        }
                    }
                    return false;
                }
            } else {
                throw new APIError('login:access_verification_code_fail', 'access verification code fail.');
            }

            if (name) {
                await User.upsert({
                    id: username,
                    name: name,
                    password: password
                });
                user = await User.findById(username);
                ctx.cookies.set(config.session.cookieName, cookie.user2cookie(username, password));
            }
        } else {
            user = await cookie.cookie2user(schoolResourceShareCookie)
        }

        ctx.rest({
            user: user
        });
    }
};