function isSupportWxPay() {
  let wxInfo = window.navigator.userAgent.match(/MicroMessenger\/([\d.]+)/i);
  return wxInfo && wxInfo[1] >= '5.0';
}

function onBridgeReady() {
  WeixinJSBridge.invoke(
    'getBrandWCPayRequest', {
      appId: 'wx90eb6b04dcbf5fb2',     //公众号名称，由商户传入
      timeStamp: `${Number.parseInt(Date.now() / 1000, 10)}`,         //时间戳，自1970年以来的秒数
      nonceStr: 'e61463f8efa94090b1f366cccfbbb444', //随机串
      package: 'prepay_id=u802345jgfjsdfgsdg888',
      signType: 'MD5',         //微信签名方式：
      paySign: '70EA570631E4BB79628FBCA90534C63FF7FADD89' //微信签名
    },
    res => {
      alert(res);
      if (res.err_msg === 'get_brand_wcpay_request:ok') {
        alert('pay success');
      }     // 使用以上方式判断前端返回,微信团队郑重提示：res.err_msg将在用户支付成功后返回    ok，但并不保证它绝对可靠。
    }
  );
}

function getCode() {
  const APP_ID = 'wx90eb6b04dcbf5fb2';
  const REDIRECT_URI = encodeURIComponent('http://i-sharing.xyz/');
  const URL_OPEN_ID_CODE = `https://open.weixin.qq.com/connect/oauth2/authorize?appid=${ APP_ID }&redirect_uri=${ REDIRECT_URI }&response_type=code&scope=snsapi_base&state=STATE#wechat_redirect`;

  $.get(URL_OPEN_ID_CODE);
  alert('get code');
}
// if (typeof WeixinJSBridge === 'undefined') {
//   if (document.addEventListener) {
//     document.addEventListener('WeixinJSBridgeReady', onBridgeReady, false);
//   } else if (document.attachEvent) {
//     document.attachEvent('WeixinJSBridgeReady', onBridgeReady);
//     document.attachEvent('onWeixinJSBridgeReady', onBridgeReady);
//   }
// } else {
//   onBridgeReady();
// }