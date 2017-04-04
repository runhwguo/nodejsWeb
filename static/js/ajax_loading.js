function submitAjax(submit, ajaxOption, submitBtnWordOption, successCallback) {

  submitBtnWordOption.normal = submit.text();
  let loading = Ladda.create(submit[0]);
  loading.start();
  $.ajax({
    type: ajaxOption.type || '',
    url: ajaxOption.url || '',
    data: ajaxOption.data || '',
    success: data => {
      if (data.result) {
        submit.text(submitBtnWordOption.success);
        setTimeout(() => {
          loading.stop();
          // bootstrapValidator本身有prevent double click的逻辑，但是和Ladda有互相影响，手动加一下
          submit.attr('disabled', true);
          if (successCallback) {
            successCallback()
          }
        }, 500);
      }
    },
    error: xhr => {
      submit.text(submitBtnWordOption.fail);
      setTimeout(() => {
        submit.text(submitBtnWordOption.normal);
        loading.stop();
      }, 500);
    }
  });
}