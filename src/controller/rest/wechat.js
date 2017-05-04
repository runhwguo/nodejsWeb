import crypto from "crypto";
import * as wxPay from "../../tool/wx_pay";
import {session} from "../../tool/config";
import * as Dao from "../../tool/dao";
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
  //{ appid: 'wx90eb6b04dcbf5fb2',
  // bank_type: 'CFT',
  //   cash_fee: '100',
  //   fee_type: 'CNY',
  //   is_subscribe: 'Y',
  //   mch_id: '1462750902',
  //   nonce_str: '0.16139921218732156',
  //   openid: 'o6wcgw5MG8zW5ChT_KogzpKbOgbk',
  //   out_trade_no: '1493888860431',
  //   result_code: 'SUCCESS',
  //   return_code: 'SUCCESS',
  //   sign: 'D54902686145C965667BEF53DA2415F4',
  //   time_end: '20170504170749',
  //   total_fee: '100',
  //   trade_type: 'JSAPI',
  //   transaction_id: '4010162001201705049538003990' }
  //   attach:  taskId
  console.log('isSuccessful -> '+isSuccessful);
  console.log('result.attach -> '+result.attach);
  if (isSuccessful && data.attach) {
    // 付款成功，这里可以添加会员共享的打钱逻辑
    let taskId = result.attach;
    let task = await Task.findByPrimary(taskId);
    let userId = task.dataValues.userId;
    let reward = task.dataValues.reward;
    let user = await User.findByPrimary(userId);
    let openId = user.dataValues.openId;
    let isOk = await Dao.create(Bill, {
      taskId: result.attach,
      userOpenId: openId,
      amount: reward
    });
    console.log('会员共享查看费用账单生成 -> ' + isOk);
  }

  result = result.replace(/&lt;/g, '<').replace(/&gt;/g, '>');
  console.log(data);
  console.log(result);

  ctx.rest(result);
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