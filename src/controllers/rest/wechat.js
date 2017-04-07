import crypto from  'crypto';

const TOKEN = "FuckQ";
const APP_ID = "wx4e4e65e636691304";
// const APP_ID = "wx90eb6b04dcbf5fb2";  平台
const APP_SECRET = "267497e487074a081b2bf0d609169bb7";
// const APP_SECRET = "7e87a72a56080c466d9256387016c886";  平台
const ENCODING_AES_KEY = "MdnDaEKiUmUOPK8YGYuvimwMbpp0rd8lZZ7lwai7vmN";
const GET_ACCESS_TOKEN = 'https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=APPID&secret=APPSECRET';//get
const GET_WX_IP = 'https://api.weixin.qq.com/cgi-bin/getcallbackip?access_token=ACCESS_TOKEN';

const check = async ctx => {
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

const checkIsFromWxServer = async(signature, timestamp, nonce) => {
  let code = crypto.createHash("sha1").update([TOKEN, timestamp, nonce].sort().toString().replace(/,/g, ""), 'utf-8').digest("hex");

  return code === signature;
};

module.exports = {
  'GET /api/wechat/': check
};