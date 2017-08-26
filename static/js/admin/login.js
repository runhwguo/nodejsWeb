const form   = $('form'),
      errMsg = $('.alert');
errMsg.hide();
form.submit(e => {
  e.preventDefault();
  $.ajax({
    url: form.attr('action'),
    data: form.serialize(),
    type: form.attr('method'),
    success: data => {
      if (data.result) {
        window.location.href = window.location.origin + '/admin/index';
      } else {
        errMsg.show();
        setTimeout(() => {
          errMsg.hide();
        }, 2000);
      }
    },
    error: xhr => {
    }
  });
  return false;
});