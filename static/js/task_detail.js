$(() => {
  $('img').click(() => {
    $('.enlargeImageModalSource').attr('src', $('img').attr('src'));
    $('#enlargeImageModal').modal('show');
  });
  $('.ladda-button').click(function () {
    let where = $('#where').val();
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

  let contactModal = $('#contactModal');

  contactModal.on('show.bs.modal', () => {
    $('.modal .modal-dialog').css('overflow-y', 'auto').css('max-height', $(window).height() * 0.5);
  });

  $('#contentTr').click(() => {
    contactModal.modal();
  });
});