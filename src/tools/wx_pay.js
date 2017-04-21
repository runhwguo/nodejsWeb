import crypto from "crypto";

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

export {
  paySign
};