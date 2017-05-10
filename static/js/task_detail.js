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

    const doSubmit = outTradeNo => {
      submitAjax($(this), {
        type: 'PUT',
        url: `/api/task/state/${this.id}/${this.name}?where=${where}&outTradeNo=${outTradeNo}`
      }, {
        success: '成功',
        fail: '失败'
      }, successCallback);
    };

    let reward = Number.parseFloat($('#reward').text().substr(1));
    if ($('.ladda-button span').text() === '接单' &&
      $('#rewardType').text() === '收取' &&
      reward > 0
    ) {
      let outTradeNo = randomString(28);
      startPay({fee: reward * 100, body: '领去任务预支付费用', outTradeNo: outTradeNo}, () => {
        doSubmit(outTradeNo);
      }, () => {
      });
    } else {
      doSubmit();
    }
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