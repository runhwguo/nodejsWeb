function submitAjax(submit, ajaxOption, submitBtnWordOption, successCallback) {
  let submitBtnWord = submit[0],
    loading = Ladda.create(submitBtnWord);
  loading.start();
  $.ajax({
    type: ajaxOption.type || '',
    url: ajaxOption.url || '',
    data: ajaxOption.data || '',
    success: data => {
      if (data.result) {
        submitBtnWord.textContent = submitBtnWordOption.success;
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
      submitBtnWord.textContent = submitBtnWordOption.fail;
      setTimeout(() => {
        submitBtnWord.textContent = submitBtnWordOption.normal;
        loading.stop();
      }, 500);
    }
  });
}