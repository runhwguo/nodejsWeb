import crypto from  'crypto';

const TOKEN = "FuckQ";
const APP_ID = "AppSecret";
const APP_SECRET = "811ab6450256efbd880e241aad7c570c";
const ENCODING_AES_KEY = "MdnDaEKiUmUOPK8YGYuvimwMbpp0rd8lZZ7lwai7vmN";

const check = async ctx => {
  let signature = ctx.query.signature;
  let timestamp = ctx.query.timestamp;
  let nonce = ctx.query.nonce;
  let echostr = ctx.query.echostr;

  /*  加密/校验流程如下： */
  //1. 将token、timestamp、nonce三个参数进行字典序排序
  let array = [TOKEN, timestamp, nonce];
  array.sort();
  var str = array.toString().replace(/,/g, "");

  //2. 将三个参数字符串拼接成一个字符串进行sha1加密
  var sha1Code = crypto.createHash("sha1");
  let code = sha1Code.update(str, 'utf-8').digest("hex");

  //3. 开发者获得加密后的字符串可与signature对比，标识该请求来源于微信
  if (code === signature) {
    ctx.rest(echostr);
  } else {
    ctx.rest('error');
  }
};

module.exports = {
  'GET /api/wechat/': check
};