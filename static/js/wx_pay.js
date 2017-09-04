let _param           = [],
    _successCallback = null,
    _failCallback    = null;

/**
 * 微信回调支付接口
 */
function onBridgeReady() {
  $.get(`/api/wechat/pay/start?${$.param(_param)}`,
    data => {
      if (data) {
        WeixinJSBridge.invoke('getBrandWCPayRequest', data,
          res => {
            // 使用以上方式判断前端返回,微信团队郑重提示：res.err_msg将在用户支付成功后返回    ok，但并不保证它绝对可靠。
            if ('get_brand_wcpay_request:ok' === res.err_msg) {
              _successCallback && _successCallback();
            } else {
              alert(JSON.stringify(res));
              _failCallback && _failCallback();
            }
          }
        );
      } else {
        alert(JSON.stringify(data));
      }
    }
  );
}

/**
 * 调用微信支付
 * @param param
 * @param successCallback
 * @param failCallback
 */
function startPay(param, successCallback, failCallback) {
  _param           = param;
  _successCallback = successCallback;
  _failCallback    = failCallback;
  if (isSupportWxPay()) {
    if (typeof WeixinJSBridge === 'undefined') {
      if (document.addEventListener) {
        document.addEventListener('WeixinJSBridgeReady', onBridgeReady, false);
      } else if (document.attachEvent) {
        document.attachEvent('WeixinJSBridgeReady', onBridgeReady);
        document.attachEvent('onWeixinJSBridgeReady', onBridgeReady);
      }
    } else {
      onBridgeReady();
    }
  } else {
    const msg = '微信版本过低，不支持WeChatPay！';
    alert(msg);
    console.warn(msg);
  }
}
