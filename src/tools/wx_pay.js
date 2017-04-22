import crypto from "crypto";
import urlencode from "urlencode";
import superagent from "superagent";
import charset from "superagent-charset";

charset(superagent);


const APP_ID = 'wx90eb6b04dcbf5fb2';
const REDIRECT_URI = urlencode('http://i-sharing.xyz/');
const URL_OPEN_ID_CODE = `https://open.weixin.qq.com/connect/qrconnect?appid=${ APP_ID }&redirect_uri=${ REDIRECT_URI }&response_type=code&scope=snsapi_login#wechat_redirect`;


const paySign = (appid, body, mch_id, nonce_str, notify_url, openid, out_trade_no, spbill_create_ip, total_fee, trade_type) => {
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

const getOpenId = () => {

};

const getCode = async () => {
  let response = await superagent.get(URL_OPEN_ID_CODE);
  console.log(response);
};

export {
  paySign, getOpenId, getCode
};