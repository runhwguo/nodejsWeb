function _isSupportWxPay() {
  let wxInfo = window.navigator.userAgent.match(/MicroMessenger\/([\d.]+)/i);
  return wxInfo && wxInfo[1] >= '5.0';
}

function onBridgeReady(fee) {
  $.get('/api/wechat/pay/start', {
      fee: fee
    }, result => {
      alert(result);
      if (result) {
        WeixinJSBridge.invoke('getBrandWCPayRequest', result, res => {
            alert(res);
            if (res.err_msg === 'get_brand_wcpay_request:ok') {
              alert('pay success');
            }     // 使用以上方式判断前端返回,微信团队郑重提示：res.err_msg将在用户支付成功后返回    ok，但并不保证它绝对可靠。
          }
        );
      }
    }
  );
}

function startPay(fee) {
  if (_isSupportWxPay) {
    if (typeof WeixinJSBridge === 'undefined') {
      if (document.addEventListener) {
        document.addEventListener('WeixinJSBridgeReady', onBridgeReady, false);
      } else if (document.attachEvent) {
        document.attachEvent('WeixinJSBridgeReady', onBridgeReady);
        document.attachEvent('onWeixinJSBridgeReady', onBridgeReady);
      }
    } else {
      onBridgeReady(fee);
    }
  } else {
    alert('请升级微信!');
  }
}