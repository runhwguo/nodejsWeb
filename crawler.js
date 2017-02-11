const superagent = require('superagent');
const charset = require('superagent-charset');
const cheerio = require('cheerio');
const fs = require('fs');
const http = require('http');
const config = require('./my-config');

charset(superagent);

const UJS_MAIN_URL = 'http://my.ujs.edu.cn/';
const CHAR_SET = 'utf-8';
let username = config.username;
let password = config.password;
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

superagent
    .get(captchaGenerateUrl)
    .end((err, response) => {
        if (!err && response.ok) {
            console.log('验证码图片获取成功');
            cookie = response.header['set-cookie'][0].split(';')[0];
            fs.writeFileSync(verificationCodePicture, response.body, 'binary');

            superagent
                .post(JINA_OCR_INDEX_URL)
                .attach('picture', verificationCodePicture)
                .end((err, response) => {
                    if (!err && response.ok) {
                        console.log(response.text);
                        let $ = cheerio.load(response.text);
                        let downloadUrl = 'http://www.jinapdf.com' + $('#downloadfile').find('.download-file').attr('href').split('..')[1];
                        console.log(downloadUrl);
                        readRemoteFile(downloadUrl, (error, buffer) => {
                            if (error) {
                                console.log('jina 取识别结果失败');
                            } else {
                                verificationCode = buffer.toString().replace(/\s+/g, '').replace(/[>?]/g, '7');
                                console.log('jinapdf识别出来的验证码是：' + verificationCode + ', len = ' + verificationCode.length);
                                if (verificationCodeReg.test(verificationCode)) { // 如果jinapdf识别的不是四位数，再让baidu去识别
                                    getUserInfo(baiduGetVerificationCode);
                                } else {
                                    console.log('jinapdf识别出来的验证码不是四位数, 让baidu识别');
                                    baiduGetVerificationCode();
                                }
                            }
                        });
                    } else {
                        console.log('往jinapdf上传图片失败');
                    }

                    function baiduGetVerificationCode() {
                        let BAIDUIDCookie;
                        superagent
                            .get(BAIDU_OCR_INDEX_URL)
                            .query({
                                r: 'demo/ocr',
                                type: 'LocateRecognize',
                                tag: true,
                                apiserviceid: 969
                            })
                            .end((err, response) => {
                                if (!err && response.ok) {
                                    console.log('baidu识别图片成功');
                                    BAIDUIDCookie = response.header['set-cookie'][0];
                                    let $ = cheerio.load(response.body);
                                    let im = 'C:\\fakepath\\' + verificationCodePicture;
                                    superagent
                                        .post(BAIDU_OCR_RESULT_URL)
                                        .query({
                                            r: 'demo/ocrret',
                                            type: 'LocateRecognize',
                                            im: im
                                        })
                                        .attach('image', verificationCodePicture)
                                        .set('Cookie', BAIDUIDCookie)
                                        .end((err, response) => {
                                            if (!err && response.ok) {
                                                $ = cheerio.load(response.text);
                                                verificationCode = $('table.table_list tr:nth-last-child(1) td:nth-child(2)').text().replace(/\s+/g, '').replace(/[>?]/g, '7');
                                                console.log('baidu识别出来的验证码是：' + verificationCode + ', len = ' + verificationCode.length);
                                                if (verificationCodeReg.test(verificationCode)) {
                                                    getUserInfo(bothFail);
                                                } else {
                                                    bothFail();
                                                }
                                                function bothFail() {
                                                    // 两者识别的都不是四位数，换验证码
                                                    console.warn('两个线上识别api的结果都不正确');
                                                }
                                            } else {
                                                console.log('baidu取验证码结果失败');
                                            }
                                        });
                                } else {
                                    console.log('baidu识别验证码失败');
                                }
                            });
                    }

                    function readRemoteFile(url, cb) {
                        let callback = function () {
                            // 回调函数，避免重复调用
                            callback = () => {
                            };
                            cb.apply(null, arguments);
                        };

                        http
                            .get(url, response => {
                                let b = [];
                                response.on('data', c => b.push(c))
                                    .on('end', () => callback(null, Buffer.concat(b)))
                                    .on('error', callback);
                            })
                            .on('error', callback);
                    }

                    /**
                     * jina平台识别出格式正确的验证码，如果识别错误让百度尝试，通过回调实现
                     * @param callback
                     */
                    function getUserInfo(callback) {
                        superagent
                            .post(userPasswordValidateUrl)
                            .send('Login.Token1=' + username)
                            .send('Login.Token2=' + password)
                            .send('captchaField=' + verificationCode)
                            .send('goto=' + loginSuccessUrl)
                            .send('gotoOnFail=' + loginFailureUrl)
                            .set('Cookie', cookie)
                            .charset(CHAR_SET)
                            .end((err, response) => {
                                let iPlanetDirectoryProCookie = response.header['set-cookie'];
                                if (iPlanetDirectoryProCookie) {
                                    iPlanetDirectoryProCookie = iPlanetDirectoryProCookie[0].split(';')[0];
                                    superagent
                                        .get(UJS_INDEX_URL)
                                        .set('Cookie', cookie + '; ' + iPlanetDirectoryProCookie)
                                        .end((err, response) => {
                                            let $ = cheerio.load(response.text);
                                            let name = $('#topMenu').find('div:not(id)').text().split(',')[0];
                                            console.log(name)
                                        });
                                } else if (callback) { // 用户名，密码或验证码错误
                                    callback();
                                }
                            });
                    }
                });
        } else {
            console.log('验证码图片获取成功失败');
        }
    });