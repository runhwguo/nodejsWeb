import crypto from "crypto";
import * as wxPay from "./../../tools/wx_pay";

const TOKEN = 'FuckQ';

// 平台
const APP_ID = 'wx90eb6b04dcbf5fb2';
const APP_SECRET = '7e87a72a56080c466d9256387016c886';
const MCH_ID = '1462750902';
const DEVICE_INFO = 'WEB';
const TRADE_TYPE = 'JSAPI';


const ENCODING_AES_KEY = 'zhzyeMf9jzO9HEiVmCzi3KDGPjyxUyJUFyh1AkI7SfE';
const GET_ACCESS_TOKEN = 'https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=APPID&secret=APPSECRET';//get
const GET_WX_IP = 'https://api.weixin.qq.com/cgi-bin/getcallbackip?access_token=ACCESS_TOKEN';
const UNIFIEDORDER_URL = 'https://api.mch.weixin.qq.com/pay/unifiedorder';

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


const unifiedOrder = async () => {
  let notify_url = null;
  let out_trade_no = null;
  let total_fee = null;
  let attach = null;
  let body = null;
  let nonce_str = Math.random().toString();
  let formData = '<xml>';
  formData += `<appid>${ APP_ID }</appid>`; //appid
  formData += `<attach>${ attach }</attach>`; //附加数据
  formData += `<body>${ body }</body>`; //商品或支付单简要描述
  formData += `<mch_id>${ MCH_ID }</mch_id>`; //商户号
  formData += `<nonce_str>${ nonce_str }</nonce_str>`; //随机字符串，不长于32位
  formData += `<notify_url>${ notify_url }</notify_url>`; //支付成功后微信服务器通过POST请求通知这个地址
  formData += `<openid></openid>`; //扫码支付这个参数不是必须的
  formData += `<out_trade_no>${ out_trade_no }</out_trade_no>`; //订单号
  formData += `<spbill_create_ip></spbill_create_ip>`; //终端IP
  formData += `<total_fee>${ total_fee }</total_fee>`; //金额
  formData += `<trade_type>${ TRADE_TYPE }</trade_type>`; //NATIVE会返回code_url ，JSAPI不会返回
  formData += `<sign>${ wxPay.paySign(APP_ID, attach, body, out_trade_no, nonce_str, notify_url, '', out_trade_no, '', total_fee, TRADE_TYPE) }</sign>`;
  formData += '</xml>';
  console.log(formData);
};

module.exports = {
  'GET /api/wechat/': checkIsFromWeChatServer,
  'GET /api/wechat/pay/unifiedOrder': unifiedOrder
};