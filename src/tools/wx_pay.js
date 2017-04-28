import md5 from "MD5";
import superagent from "superagent";
import charset from "superagent-charset";
import config from "./config";

import json2xml from "json2xml";
import xml2json from "xml2json";
import tracer from "tracer";
import fs from "fs";
import appRootDir from "app-root-dir";
import path from "path";
import WXPay from 'weixin-pay';

let logger = tracer.console();

charset(superagent);

const APP_ID = 'wx90eb6b04dcbf5fb2';
const APP_SECRET = '7e87a72a56080c466d9256387016c886';
const MCH_ID = '1462750902';
const TRADE_TYPE = 'JSAPI';
const MCH_KEY = 'guohaoweilovechengxihuiforeveruu';//key为在微信商户平台(pay.weixin.qq.com)-->账户设置-->API安全-->密钥设置
const NOTIFY_URL = 'http://i-sharing.xyz/api/wechat/order/notify';


const MCH_PAU_URL = 'https://api.mch.weixin.qq.com/';

const URL_WX_OPEN_ID_ACCESS_TOKEN = `https://api.weixin.qq.com/sns/oauth2/access_token?appid=${ APP_ID }&secret=${ APP_SECRET }&code=CODE&grant_type=authorization_code`;

const weixinPayConfig = {
  appid: APP_ID,
  mch_id: MCH_ID,
  partner_key: MCH_KEY, //微信商户平台API密钥
  pfx: fs.readFileSync(path.join(appRootDir.get(), 'static/third-party/apiclient_cert.p12')), //微信商户平台证书
};


const _paySign = data => {
  let string = `${ _raw(data) }&key=${MCH_KEY}`;
  return md5(string).toUpperCase();
};

const _raw = args => {
  let keys = Object.keys(args);
  keys = keys.sort();
  let newArgs = {};
  keys.forEach(key => newArgs[key] = args[key]);

  let string = '';
  for (let k in newArgs) {
    string += `&${k}=${newArgs[k]}`;
  }
  string = string.substr(1);
  return string;
};

const _payApiRequest = async (data, url) => {
  logger.log('_payApiRequest');
  let sign = _paySign(data);

  let formData = {
    xml: Object.assign(data, {sign: sign})
  };

  formData = json2xml(formData);
  logger.log('test --');
  let response = await superagent
    .post(url)
    .send(formData)
    .key(MCH_ID)
    .pfx(fs.readFileSync(path.join(appRootDir.get(), 'static/third-party/apiclient_cert.p12')))
    .charset(config.common.char_set_utf8);
  logger.log('test --');
  // logger.log(response.text);
  let result = xml2json.toJson(response.text);
  logger.log(result);

  return JSON.parse(result);
};


const unifiedOrder = async ctx => {
  let body = ctx.query.body;
  let spbillCreateIp = ctx.ip;

  WXPay.createUnifiedOrder({
    body: body,
    out_trade_no: '20170428' + Math.random().toString().substr(2, 10),
    total_fee: 1,
    spbill_create_ip: spbillCreateIp,
    notify_url: NOTIFY_URL,
    trade_type: TRADE_TYPE
  }, function (err, result) {
    console.log(result);
  });
};

const refund = async param => {
  logger.log('refund');
  let totalFee = Math.abs(param.reward);

  let params = {
    appid: APP_ID,
    mch_id: MCH_ID,
    op_user_id: MCH_ID,
    out_refund_no: '20170428' + Math.random().toString().substr(2, 10),
    total_fee: totalFee, //原支付金额
    refund_fee: totalFee, //退款金额
    transaction_id: '微信订单号'
  };
  WXPay.refund(params, function (err, result) {
    console.log('refund', arguments);
  });
};

const getAccessTokenOpenId = async code => {
  let url = URL_WX_OPEN_ID_ACCESS_TOKEN.replace('CODE', code);

  let response = await superagent
    .get(url);
  let resObj = JSON.parse(response.text);
  return resObj.openid;
};

const getOnBridgeReadyRequest = async ctx => {
  wxpay.getBrandWCPayRequestParams({
    openid: ctx.cookies.get(config.session.wxOpenId),
    body: ctx.query.body,
    detail: ctx.query.detail,
    out_trade_no: '20170428' + Math.random().toString().substr(2, 10),
    total_fee: ctx.query.totalFee,
    spbill_create_ip: ctx.ip,
    notify_url: NOTIFY_URL
  }, function (err, result) {
    console.log('refund', arguments);
  });
};

export {
  unifiedOrder, getAccessTokenOpenId, getOnBridgeReadyRequest, refund
};