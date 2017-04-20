function isSupportWxPay() {
  let wxInfo = window.navigator.userAgent.match(/MicroMessenger\/([\d.]+)/i);
  let result = !wxInfo && wxInfo[1] < '5.0';
  alert(window.navigator.userAgent);
  alert(result);
  return result;
}