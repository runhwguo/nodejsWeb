const APIError = require('../../rest').APIError;

const COOKIE_NAME = 'school-resource-share-login-state';

module.exports = {
    'POST /api/login': async ctx => {
        let name = null;

        const config = require('../../config');
        const superagent = require('superagent');
        const charset = require('superagent-charset');
        const cheerio = require('cheerio');
        const fs = require('fs');


        charset(superagent);

        const UJS_MAIN_URL = 'http://my.ujs.edu.cn/';
        const CHAR_SET = 'utf-8';
        let username = ctx.request.body.id;
        let password = ctx.request.body.password;
        console.log(username + ', ' + password);
        let verificationCode;
        const verificationCodeReg = /^[0-9a-zA-Z]{4}$/;

        const userPasswordValidateUrl = UJS_MAIN_URL + 'userPasswordValidate.portal';
        const captchaGenerateUrl = UJS_MAIN_URL + 'captchaGenerate.portal';
        const loginSuccessUrl = UJS_MAIN_URL + 'loginSuccess.portal';
        const loginFailureUrl = UJS_MAIN_URL + 'loginFailure.portal';
        const UJS_INDEX_URL = UJS_MAIN_URL + 'index.portal';
        let cookie;

// baidu ocr
        const BAIDU_OCR_INDEX_URL = 'http://apistore.baidu.com/idlapi/';
        const BAIDU_OCR_RESULT_URL = 'http://apistore.baidu.com/idlapi/';
        const verificationCodePicture = 'out.png'; // 注意路径

// jinapdf ocr
        const JINA_OCR_INDEX_URL = 'http://www.jinapdf.com/cn/image-to-text-file.php';
        // const downloadUrl = 'http://www.jinapdf.com/download.php?file=/home/clients/client0/web13/web/uploads/17704707721770470772/converted_1770470772.txt';
        let response = await superagent.get(captchaGenerateUrl);
        if (response.ok) {
            console.log('验证码图片获取成功');
            cookie = response.header['set-cookieName'][0].split(';')[0];
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
                response = await
                    superagent
                        .get(BAIDU_OCR_INDEX_URL)
                        .query({
                            r: 'demo/ocr',
                            type: 'LocateRecognize',
                            tag: true,
                            apiserviceid: 969
                        });

                if (response.ok) {
                    console.log('baidu识别图片成功');
                    BAIDUIDCookie = response.header['set-cookieName'][0];
                    let $ = cheerio.load(response.body);
                    let im = 'C:\\fakepath\\' + verificationCodePicture;
                    response = await
                        superagent
                            .post(BAIDU_OCR_RESULT_URL)
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

            /**
             * jina平台识别出格式正确的验证码，如果识别错误让百度尝试，通过回调实现
             * @param callback
             */
            async function getUserInfo() {
                response = await
                    superagent
                        .post(userPasswordValidateUrl)
                        .send('Login.Token1=' + username)
                        .send('Login.Token2=' + password)
                        .send('captchaField=' + verificationCode)
                        .send('goto=' + loginSuccessUrl)
                        .send('gotoOnFail=' + loginFailureUrl)
                        .set('Cookie', cookie)
                        .charset(CHAR_SET);
                if (response.ok) {
                    let iPlanetDirectoryProCookie = response.header['set-cookieName'];
                    if (iPlanetDirectoryProCookie) {
                        iPlanetDirectoryProCookie = iPlanetDirectoryProCookie[0].split(';')[0];
                        response = await superagent
                            .get(UJS_INDEX_URL)
                            .set('Cookie', cookie + '; ' + iPlanetDirectoryProCookie);
                        if (response.ok) {
                            let $ = cheerio.load(response.text);
                            name = $('#topMenu').find('div:not(id)').text().split(',')[0];
                            console.log(name);
                        } else {
                            return false;
                        }
                    } else { // 用户名，密码或验证码错误
                        return false;
                    }
                }
                return true;
            }
        } else {
            throw new APIError('login:access_verification_code_fail', 'access verification code fail.');
        }

        function cookie2user(cookie) {
            if (cookie) {
                let cookieElements = cookie.split('-');
                if (cookieElements.length !== 3) {
                    // auth maxAge
                    let id = cookieElements[0],
                        expires = cookieElements[1],
                        sha1 = cookieElements[2];
                    if (expires - new Date.getTime() / 1000 < config.session.max()) {

                    }
                }
            }
        }

        //build cookieName string by: id-maxAge-sha1
        function user2cookie(user) {
            let sha1 = require('sha1');
            let expires = new Date().getTime() / 1000 + config.session.maxAge;
            return `${user.id}-${expires}-` + sha1(`${user.id}-${user.password}-${expires}-${config.session.cookieName}`);
        }

        if (!name) {
            ctx.cookies.set(config.session.cookieName);
        }
        ctx.rest({
            name: name
        });
    }
};