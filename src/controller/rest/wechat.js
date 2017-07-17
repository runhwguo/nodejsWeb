import crypto from 'crypto';
import * as wxPay from '../../tool/wx_pay';
import {session} from '../../tool/config';
import * as Dao from '../../tool/dao';
import {API_RETURN_TYPE} from '../../tool/rest';
import {toCDATA} from '../../tool/common';
import {Task, User, Bill} from '../../tool/model';
import tracer from 'tracer';
import Json2Xml from 'json2xml';


let console = tracer.console();

const TOKEN = 'FuckQ';

const REPLY_WORD = '亲爱的小伙伴，感谢关注校园资源共享“的”平台，代取快递，代写作业，代刷游戏，代视听说，代课代活动，找顺风车…一切不想做的事都可以扔到平台找人代做。闲置的书，自行车，衣服，电器，还有视频网站的会员都可以放到平台上有偿共享。闲来无事的小伙伴可以接单领任务，在校内做兼职。详情请点击下面的“进入主页”👇';

const checkIsFromWeChatServer = async ctx => {
  let signature = ctx.query.signature,
    timestamp = ctx.query.timestamp,
    nonce = ctx.query.nonce,
    echostr = ctx.query.echostr;

  let result = _isFromWechatServer(signature, timestamp, nonce);
  if (result) {
    let msg = ctx.request.body.xml;

    if (msg) {
      let msgType = msg.MsgType;
      if (msgType === 'event') {
        let event = msg.Event;
        if (event === 'subscribe') {
          result = _replyToWechat(REPLY_WORD, msg);

          ctx.rest(result, API_RETURN_TYPE.XML);
        } else {

        }
      } else if (msgType === 'text') {
        result = _replyToWechat(REPLY_WORD, msg);

        ctx.rest(result, API_RETURN_TYPE.XML);
      } else {
        result = _replyToWechat('公众号目前不支持此消息类型', msg);

        ctx.rest(result, API_RETURN_TYPE.XML);
      }
    } else {
      ctx.rest(echostr);
    }

  } else {
    ctx.rest('error');
  }
};

const _replyToWechat = (text, msg) => {
  let result = Json2Xml({
    xml: {
      ToUserName: toCDATA(msg.FromUserName),
      FromUserName: toCDATA(msg.ToUserName),
      CreateTime: toCDATA(Math.round(Date.now() / 1000)),
      MsgType: toCDATA('text'),
      Content: toCDATA(text)
    }
  });

  result = result.replace(/&lt;/g, '<').replace(/&gt;/g, '>');

  return result;
};

const _isFromWechatServer = async (signature, timestamp, nonce) => {
  let code = crypto.createHash('sha1').update([TOKEN, timestamp, nonce].sort().toString().replace(/,/g, ''), 'utf-8').digest('hex');

  return code === signature;
};

const orderNotify = async ctx => {
  let data = ctx.request.body.xml;
  let [isSuccessful, result] = wxPay.processNotifyCall(data);
  console.log('isSuccessful -> ' + isSuccessful);
  console.log('result.attach -> ' + result.attach);
  if (isSuccessful && data.attach) {
    // 付款成功，这里可以添加会员共享的打钱逻辑
    let taskId = data.attach,
      task = await Task.findByPrimary(taskId),
      userId = task.dataValues.userId,
      reward = task.dataValues.reward;
    let user = await User.findByPrimary(userId, {
      attributes: ['openId']
    });
    let openId = user.dataValues.openId;
    let isOk = await Dao.create(Bill, {
      taskId: data.attach,
      userOpenId: openId,
      amount: reward
    });
    console.log('会员共享查看费用账单生成 -> ' + isOk);
  }

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
      console.error('获取prepay_id失败');
    }
    request = await wxPay.getOnBridgeReadyRequest(prepay_id);
  }
  ctx.rest(request);
};

module.exports = {
  'GET /': checkIsFromWeChatServer,
  'POST /': checkIsFromWeChatServer,
  'POST /order/notify': orderNotify,
  'GET /pay/start': startPay
};