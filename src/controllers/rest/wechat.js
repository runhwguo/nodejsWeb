import crypto from "crypto";
import * as wxPay from "./../../tools/wx_pay";
import config from "./../../tools/config";

import superagent from "superagent";
import charset from "superagent-charset";
import json2xml from "json2xml";
import urlencode from "urlencode";

charset(superagent);

const TOKEN = 'FuckQ';

// 平台
const APP_ID = 'wx90eb6b04dcbf5fb2';
const APP_SECRET = '7e87a72a56080c466d9256387016c886';
const MCH_ID = '1462750902';
const TRADE_TYPE = 'JSAPI';


const ENCODING_AES_KEY = 'zhzyeMf9jzO9HEiVmCzi3KDGPjyxUyJUFyh1AkI7SfE';
const GET_ACCESS_TOKEN = 'https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=APPID&secret=APPSECRET';//get
const GET_WX_IP = 'https://api.weixin.qq.com/cgi-bin/getcallbackip?access_token=ACCESS_TOKEN';
const UNIFIED_ORDER_URL = 'https://api.mch.weixin.qq.com/pay/unifiedorder';
const REDIRECT_URI = urlencode('');
const OPEN_ID_CODE = `https://open.weixin.qq.com/connect/qrconnect?appid=${ APP_ID }&redirect_uri=${ REDIRECT_URI }&response_type=code&scope=snsapi_login#wechat_redirect`;

const checkIsFromWeChatServer = async ctx => {
  let signature = ctx.query.signature;
  let timestamp = ctx.query.timestamp;
  let nonce = ctx.query.nonce;
  let echostr = ctx.query.echostr;

  let result = checkIsFromWxServer(signature, timestamp, nonce);
  if (result) {
    ctx.rest(echostr);
  } else {
    ctx.rest('error');
  }
};

const checkIsFromWxServer = async (signature, timestamp, nonce) => {
  let code = crypto.createHash('sha1').update([TOKEN, timestamp, nonce].sort().toString().replace(/,/g, ''), 'utf-8').digest('hex');

  return code === signature;
};


const unifiedOrder = async (ctx, option) => {
  let notify_url = null;
  let total_fee = option.total_fee;
  let body = '测试支付';
  let openid = null;
  let nonce_str = Math.random().toString();
  let out_trade_no = `out_trade_no-${ nonce_str }`;
  let spbill_create_ip = ctx.ip;
  let sign = wxPay.paySign(APP_ID, body, MCH_ID, nonce_str, notify_url, openid, out_trade_no, spbill_create_ip, total_fee, TRADE_TYPE);

  let formData = {
    xml: {
      appid: APP_ID,// appid
      body: body,// 商品或支付单简要描述
      mch_id: MCH_ID,// 商户号
      nonce_str: nonce_str,// 随机字符串，不长于32位
      notify_url: notify_url,// 支付成功后微信服务器通过POST请求通知这个地址
      openid: openid,// 为微信用户在商户对应appid下的唯一标识
      out_trade_no: out_trade_no,//订单号
      spbill_create_ip: spbill_create_ip,//终端IP
      total_fee: total_fee,//金额
      trade_type: TRADE_TYPE,//NATIVE会返回code_url ，JSAPI不会返回
      sign: sign
    }
  };

  formData = json2xml(formData);

  console.log(formData);

  let response = await superagent
    .post(UNIFIED_ORDER_URL)
    .send(formData)
    .charset(config.common.char_set_utf8);

  console.log(response);
};

const notify = async (ctx) => {
};

module.exports = {
  'GET /api/wechat/': checkIsFromWeChatServer,
  'GET /api/wechat/pay/unifiedOrder': unifiedOrder,
  'GET /api/wechat/pay/notify': notify
};