// 业务common
// 红点吸引
if (getCookie('schoolResourceShare')) {
  $.get('/api/task/get/unread', data => {
    const badge = Number.parseInt(data.result);
    badge && $('#meTab span.badge').text(badge);
  });
}

let pathname    = window.location.pathname,
    bottomTabId = null;
if (pathname === '/') {
  bottomTabId = 'indexTab';
} else if (pathname === '/me') {
  bottomTabId = 'meTab';
}
bottomTabId && $(`#${ bottomTabId }`).css('color', '#337ab7');