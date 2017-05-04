import crypto from "crypto";
import * as wxPay from "../../tool/wx_pay";
import {session} from "../../tool/config";
import tracer from "tracer";


let console = tracer.console();

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
  let data = ctx.request.body.xml;
  let [isSuccessful, result] = wxPay.processNotifyCall(data);
  if (isSuccessful) {
    // 付款成功，这里可以添加会员共享的打钱逻辑
  }
  console.log(data);
  console.log(result);

  ctx.rest(result.replace(/&lt;/g, '<').replace(/&gt;/g, '>'));
};

const startPay = async ctx => {
  let openId = ctx.cookies.get(session.wxOpenId);
  let request = '';

  if (openId) {
    let prepay_id = await wxPay.unifiedOrder(ctx);
    if (!prepay_id) {
      console.log('获取prepay_id失败');
    }
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