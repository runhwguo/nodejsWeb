let _param = [];
let _successCallback = null;
let _failCallback = null;


function _isSupportWxPay() {
  let wxInfo = window.navigator.userAgent.match(/MicroMessenger\/([\d.]+)/i);
  return wxInfo && wxInfo[1] >= '5.0';
}

function onBridgeReady() {
  $.get(`/api/wechat/pay/start?` + $.param(_param), data => {
      if (data) {
        WeixinJSBridge.invoke('getBrandWCPayRequest', data, res => {
            // 使用以上方式判断前端返回,微信团队郑重提示：res.err_msg将在用户支付成功后返回    ok，但并不保证它绝对可靠。
            if ('get_brand_wcpay_request:ok' === res.err_msg) {
              if (_successCallback) {
                _successCallback();
              }
            } else {
              if (_failCallback) {
                _failCallback();
              }
            }
          }
        );
      }
    }
  );
}

function startPay(param, successCallback, failCallback) {
  _param = param;
  _successCallback = successCallback;
  _failCallback = failCallback;
  if (_isSupportWxPay) {
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
    alert('请升级微信!');
  }
}