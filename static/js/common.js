// 红点吸引
$.get('/api/task/get/unread', data => {
  let badge = Number.parseInt(data.result);
  if (badge) {
    $('#meTab span.badge').text(badge)
  }
});