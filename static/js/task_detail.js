$(() => {
  $('img').click(() => {
    $('.enlargeImageModalSource').attr('src', $('img').attr('src'));
    $('#enlargeImageModal').modal('show');
  });
  $('.ladda-button').click(function () {
    let where = $('input:hidden')[0].value;
    let successCallback = null;
    if (where === 'unfinished') {
      successCallback = () => {
        $('.ladda-button').attr('disabled', true);
      };
    }
    submitAjax($(this), {
      type: 'PUT',
      url: `/api/task/state/${this.id}/${this.name}?where=${where}`
    }, {
      success: '成功',
      fail: '失败'
    }, successCallback);
  });
  $('div.main').css('margin-bottom', (15 + $('.navbar-fixed-bottom').height()));
});