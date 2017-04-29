import crypto from "crypto";
import * as wxPay from "../../tools/wx_pay";
import {session} from '../../tools/config';
import tracer from 'tracer';


let logger = tracer.console();

const TOKEN = 'FuckQ';

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
  logger.log(ctx);
  logger.log(ctx.request);
  logger.log(ctx.request.body);
  ctx.rest('');
};

const startPay = async ctx => {
  let openId = ctx.cookies.get(session.wxOpenId);
  let request = '';

  if (openId) {
    let result = await wxPay.unifiedOrder(ctx);
    let prepay_id = result.xml.prepay_id;
    request = await wxPay.getOnBridgeReadyRequest(prepay_id);
  }
  ctx.rest(request);
};

module.exports = {
  'GET /api/wechat/': checkIsFromWeChatServer,
  'POST /api/wechat/': checkIsFromWeChatServer,
  'POST /api/wechat/order/notify': orderNotify,
  'GET /api/wechat/pay/start': startPay
};