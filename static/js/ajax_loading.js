function submitAjax(ajaxOption, submitBtnWordOption, successCallback) {
  let submit = $('.ladda-button'),
    submitBtnWord = $('.ladda-label'),
    loading = Ladda.create(submit.get(0));
  loading.start();
  $.ajax({
    type: ajaxOption.type,
    url: ajaxOption.url,
    data: ajaxOption.data || '',
    success: data => {
      if (data.result) {
        submitBtnWord.text(submitBtnWordOption.success);
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
      submitBtnWord.text(submitBtnWordOption.fail);
      setTimeout(() => {
        submitBtnWord.text(submitBtnWordOption.normal);
        loading.stop();
      }, 500);
    }
  });
}