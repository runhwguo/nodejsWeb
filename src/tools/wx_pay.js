import crypto from "crypto";
import superagent from "superagent";
import charset from "superagent-charset";
import config from "./config";

import json2xml from "json2xml";

charset(superagent);


const APP_ID = 'wx90eb6b04dcbf5fb2';
const APP_SECRET = '7e87a72a56080c466d9256387016c886';
const MCH_ID = '1462750902';
const TRADE_TYPE = 'JSAPI';

const URL_UNIFIED_ORDER = 'https://api.mch.weixin.qq.com/pay/unifiedorder';


const _paySign = (appid, body, mch_id, nonce_str, notify_url, openid, out_trade_no, spbill_create_ip, total_fee, trade_type) => {
  let ret = {
    appid: appid,
    body: body,
    mch_id: mch_id,
    nonce_str: nonce_str,
    notify_url: notify_url,
    openid: openid,
    out_trade_no: out_trade_no,
    spbill_create_ip: spbill_create_ip,
    total_fee: total_fee,
    trade_type: trade_type
  };
  let string = _raw(ret);
  let key = '';
  string += `&key=${key}`;  //key为在微信商户平台(pay.weixin.qq.com)-->账户设置-->API安全-->密钥设置
  return crypto.createHash('md5').update(string, 'utf8').digest('hex');
};

const _raw = args => {
  let keys = Object.keys(args);
  keys = keys.sort();
  let newArgs = {};
  keys.forEach(key => newArgs[key.toLowerCase()] = args[key]);

  let string = '';
  for (let k of newArgs) {
    string += `&${k}'=${newArgs[k]}`;
  }
  string = string.substr(1);
  return string;
};


const unifiedOrder = async (ctx, totalFee) => {
  let notify_url = 'http://i-sharing.xyz/api/wechat/pay/notify';
  let total_fee = totalFee || 1;
  let body = '测试支付';
  let openid = ctx.cookies.get(config.session.wxOpenId);
  let nonce_str = Math.random().toString();
  let out_trade_no = `out_trade_no-${ nonce_str }`;
  let spbill_create_ip = ctx.ip;
  let sign = _paySign(APP_ID, body, MCH_ID, nonce_str, notify_url, openid, out_trade_no, spbill_create_ip, total_fee, TRADE_TYPE);

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
    .post(URL_UNIFIED_ORDER)
    .send(formData)
    .charset(config.common.char_set_utf8);

  console.log(response);
};

export {
  unifiedOrder
};