// 红点吸引
$.get('/api/task/get/unread', data => {
  let badge = Number.parseInt(data.result);
  if (badge) {
    $('#meTab span.badge').text(badge)
  }
});

$(() => {
  let pathname = window.location.pathname;
  let bottomTabId = null;
  if (pathname === '/') {
    bottomTabId = 'indexTab';
  } else if (pathname === '/me') {
    bottomTabId = 'meTab';
  }
  if (bottomTabId) {
    $(`#${ bottomTabId }`).css('color', '#337ab7');
  }
});