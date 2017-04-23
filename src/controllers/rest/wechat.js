import crypto from "crypto";
import * as wxPay from "../../tools/wx_pay";
import {session} from '../../tools/config';

const TOKEN = 'FuckQ';

// 平台
const APP_ID = 'wx90eb6b04dcbf5fb2';
const APP_SECRET = '7e87a72a56080c466d9256387016c886';
const MCH_ID = '1462750902';
const TRADE_TYPE = 'JSAPI';


const ENCODING_AES_KEY = 'zhzyeMf9jzO9HEiVmCzi3KDGPjyxUyJUFyh1AkI7SfE';
const GET_ACCESS_TOKEN = 'https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=APPID&secret=APPSECRET';//get
const GET_WX_IP = 'https://api.weixin.qq.com/cgi-bin/getcallbackip?access_token=ACCESS_TOKEN';

const checkIsFromWeChatServer = async ctx => {
  let signature = ctx.query.signature;
  let timestamp = ctx.query.timestamp;
  let nonce = ctx.query.nonce;
  let echostr = ctx.query.echostr;

  let result = _isFromWechatServer(signature, timestamp, nonce);
  if (result) {
    ctx.rest(echostr);
  } else {
    ctx.rest('error');
  }
};

const _isFromWechatServer = async (signature, timestamp, nonce) => {
  let code = crypto.createHash('sha1').update([TOKEN, timestamp, nonce].sort().toString().replace(/,/g, ''), 'utf-8').digest('hex');

  return code === signature;
};

const orderNotify = async ctx => {
  console.log('receive order notify');
  ctx.rest('');
};

const startPay = async ctx => {
  let fee = ctx.query.fee;
  let openId = ctx.cookies.get(session.wxOpenId);
  let result = '';

  if (openId) {
    let result = await wxPay.unifiedOrder(ctx, fee);
    let prepay_id = result.xml.prepay_id;
    console.log('prepay_id = ' + prepay_id);
    result = await wxPay.getOnBridgeReadyRequest(prepay_id);
  }

  ctx.rest({
    result: result
  });
}

module.exports = {
  'GET /api/wechat/': checkIsFromWeChatServer,
  'POST /api/wechat/': checkIsFromWeChatServer,
  'GET /api/wechat/order/notify': orderNotify,
  'GET /api/wechat/pay/start': startPay
};