import MD5 from "md5";
import Superagent from "superagent";
import charset from "superagent-charset";
import config from "./config";
import {randomString, toCDATA} from "./common";

import Xml2Json from "xml2json";
import Json2Xml from "json2xml";
import Tracer from "tracer";
import fs from "mz/fs";
import AppRootDir from "app-root-dir";
import path from "path";
import request from "request-promise";

let console = Tracer.console();

charset(Superagent);

const APP_ID = 'wx90eb6b04dcbf5fb2';
const APP_SECRET = '7e87a72a56080c466d9256387016c886';
const MCH_ID = '1462750902';
const TRADE_TYPE = 'JSAPI';
const NOTIFY_URL = 'http://i-sharing.xyz/api/wechat/order/notify';
const MCH_KEY = 'guohaoweilovechengxihuiforeveruu';//key为在微信商户平台(pay.weixin.qq.com)-->账户设置-->API安全-->密钥设置

const URL_MCH_MAIN = 'https://api.mch.weixin.qq.com/';
const URL_UNIFIED_ORDER = `${ URL_MCH_MAIN }pay/unifiedorder`;
const URL_REFUND = `${ URL_MCH_MAIN }secapi/pay/refund`;
const URL_ENTERPRISE_PAY_TO_USER = `${ URL_MCH_MAIN }mmpaymkttransfers/promotion/transfers`;
const URL_WX_OPEN_ID_ACCESS_TOKEN = `https://api.weixin.qq.com/sns/oauth2/access_token?appid=${ APP_ID }&secret=${ APP_SECRET }&code=CODE&grant_type=authorization_code`;
const URL_WX_GET_USER_INFO = 'https://api.weixin.qq.com/sns/userinfo?access_token=ACCESS_TOKEN&openid=OPENID&lang=zh_CN';

const PFX = fs.readFileSync(path.join(AppRootDir.get(), 'static/third-party/apiclient_cert.p12')); //微信商户平台证书


const SUCCESS = 'SUCCESS';
const OK = 'OK';

const _paySign = data => {
  let string = `${ _sortAndGenerateParam(data) }&key=${MCH_KEY}`;
  return MD5(string).toUpperCase();
};

const _sortAndGenerateParam = args => {
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

const _addSignAndConvertToXml = data => {
  let sign = _paySign(data);

  let formData = {
    xml: Object.assign(data, {sign: sign})
  };

  formData = Json2Xml(formData);
  return formData;
};

const _xml2JsonObj = xmlStr => {
  return JSON.parse(Xml2Json.toJson(xmlStr)).xml;
};

const unifiedOrder = async ctx => {
  let body = ctx.query.body;
  let spbillCreateIp = ctx.ip;
  // math.abs()  考虑到reward的正负性
  let totalFee = Math.abs(Number.parseInt(ctx.query.fee));
  let nonceStr = Math.random().toString();
  let openid = ctx.cookies.get(config.session.wxOpenId);
  let outTradeNo = ctx.query.outTradeNo || randomString(28);

  let data = {
    appid: APP_ID,// appid
    body: body,// 商品或支付单简要描述
    mch_id: MCH_ID,// 商户号
    nonce_str: nonceStr,// 随机字符串，不长于32位
    notify_url: NOTIFY_URL,// 支付成功后微信服务器通过POST请求通知这个地址
    openid: openid,// 为微信用户在商户对应appid下的唯一标识
    out_trade_no: outTradeNo,//订单号
    spbill_create_ip: spbillCreateIp,//终端IP
    total_fee: totalFee,//金额
    trade_type: TRADE_TYPE//NATIVE会返回code_url ，JSAPI不会返回
  };
  // attach taskId
  if (ctx.query.attach) {
    data.attach = ctx.query.attach;
  }

  let formData = _addSignAndConvertToXml(data);
  console.log(formData);
  let response = await Superagent
    .post(URL_UNIFIED_ORDER)
    .send(formData)
    .charset(config.common.char_set_utf8);

  let result = _xml2JsonObj(response.text);

  console.log(result);

  if (_requestSuccessful(result)) {
    return result.prepay_id;
  }
};

const refund = async param => {
  console.log('refund');
  let nonceStr = Math.random().toString();
  let outTradeNo = param.outTradeNo;
  let totalFee = param.reward;
  let data = {
    appid: APP_ID,// appid
    mch_id: MCH_ID,// 商户号
    nonce_str: nonceStr,// 随机字符串，不长于32位
    op_user_id: MCH_ID,
    out_refund_no: outTradeNo,
    out_trade_no: outTradeNo,//订单号
    refund_fee: totalFee,
    total_fee: totalFee//金额
  };

  let formData = _addSignAndConvertToXml(data);
  let result = await request({
    url: URL_REFUND,
    method: 'POST',
    body: formData,
    agentOptions: {
      pfx: PFX,
      passphrase: MCH_ID
    }
  });
  result = _xml2JsonObj(result);

  console.log(result);

  return _requestSuccessful(result);
};

const getAccessTokenOpenId = async code => {
  console.log('get access token');
  let url = URL_WX_OPEN_ID_ACCESS_TOKEN.replace('CODE', code);

  let response = await Superagent.get(url);
  let resObj = JSON.parse(response.text);
  return [resObj.access_token, resObj.openid];
};

const getUserInfo = async (accessToken, openId)=>{
  let url = URL_WX_GET_USER_INFO
    .replace('ACCESS_TOKEN',accessToken)
    .replace('OPENID',openId);

  console.log(url);

  let response = await Superagent.get(url);
  let resObj = JSON.parse(response.text);
  console.log(resObj);
  return resObj.headimgurl;
};

const getOnBridgeReadyRequest = async prepay_id => {

  let data = {
    appId: APP_ID,     //公众号名称，由商户传入
    timeStamp: '' + Math.round(Date.now() / 1000),         //时间戳，自1970年以来的秒数
    nonceStr: Math.random().toString(), //随机串
    package: `prepay_id=${ prepay_id }`,
    signType: 'MD5' //微信签名方式：
  };

  let paySign = _paySign(data);

  return Object.assign(data, {
    paySign: paySign //微信签名
  });
};

const enterprisePayToUser = async param => {
  let data = {
    mch_appid: APP_ID,
    mchid: MCH_ID,
    nonce_str: randomString(),
    partner_trade_no: randomString(26),
    openid: param.openid,
    check_name: 'NO_CHECK',
    amount: Math.abs(param.amount) * 100,
    desc: '资源共享平台 做<' + param.taskTitle + '>任务的报酬, 平台收取报酬的10%',
    spbill_create_ip: param.ip,
  };

  let formData = _addSignAndConvertToXml(data);

  let response = await request({
    url: URL_ENTERPRISE_PAY_TO_USER,
    method: 'POST',
    body: formData,
    agentOptions: {
      pfx: PFX,
      passphrase: MCH_ID
    }
  });
  let result = _xml2JsonObj(response);
  console.log(result);
  return _requestSuccessful(result);
};

const _requestSuccessful = result => {
  return result && result.return_code && result.return_code === SUCCESS && result.result_code && result.result_code === SUCCESS;
};

const processNotifyCall = data => {
  let isSuccessful = _requestSuccessful(data);
  let result = null;
  if (isSuccessful) {
    result = Json2Xml({
      xml: {
        return_code: toCDATA(SUCCESS),
        return_msg: toCDATA(OK)
      }
    });
  }

  return [isSuccessful, result.replace(/&lt;/g, '<').replace(/&gt;/g, '>')];
};

export {
  unifiedOrder, getAccessTokenOpenId, getUserInfo, getOnBridgeReadyRequest, refund, enterprisePayToUser, processNotifyCall
};