/**
 * 生成随机字符串，默认去掉了容易混淆的字符oOLl,9gq,Vv,Uu,I1
 * @param len
 * @returns {string}
 */
const randomString = (len = 32) => {
  const chars = 'ABCDEFGHJKMNPQRSTWXYZabcdefhijkmnprstwxyz2345678';
  let maxPos  = chars.length;
  let pwd     = '';
  for (let i = 0; i < len; i++) {
    pwd += chars[Math.floor(Math.random() * maxPos)];
  }
  return pwd;
};

function isSupportWxPay() {
  const wxInfo = window.navigator.userAgent.match(/MicroMessenger\/([\d.]+)/i);
  return wxInfo && wxInfo.length >= 2 && wxInfo[1] >= '5.0';
}

// 本地是否登录
function getCookie(name) {
  const match = document.cookie.match(new RegExp(name + '=([^;]+)'));
  return match && match[1];
}