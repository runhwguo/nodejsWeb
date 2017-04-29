import superagent from "superagent";
import charset from "superagent-charset";
import config from "./config";

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


const URL_WX_OPEN_ID_ACCESS_TOKEN = `https://api.weixin.qq.com/sns/oauth2/access_token?appid=${ APP_ID }&secret=${ APP_SECRET }&code=CODE&grant_type=authorization_code`;

const weixinPayConfig = {
  appid: APP_ID,
  mch_id: MCH_ID,
  partner_key: MCH_KEY, //微信商户平台API密钥
  pfx: fs.readFileSync(path.join(appRootDir.get(), 'static/third-party/apiclient_cert.p12')), //微信商户平台证书
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
  let openId = ctx.cookies.get(session.wxOpenId);
  let result = '';

  if (openId) {
    WXPay.getBrandWCPayRequestParams({
      openid: openId,
      body: ctx.query.body,
      out_trade_no: '20170428' + Math.random().toString().substr(2, 10),
      total_fee: ctx.query.totalFee,
      spbill_create_ip: ctx.ip,
      notify_url: NOTIFY_URL
    }, function (err, _result) {
      console.log('getOnBridgeReadyRequest', arguments);
      result = _result;
    });
  }
};

export {
  unifiedOrder, getAccessTokenOpenId, getOnBridgeReadyRequest, refund
};