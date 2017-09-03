$(() => {
  const $img          = $('img.thumbnail'),
        $laddaButton  = $('button.ladda-button'),
        $contactModal = $('#contactModal'),
        imgSrc        = $img.attr('src');
  imgSrc && (
    $img.click(() => {
      $('img.enlargeImageModalSource').attr('src', $img.attr('src'));
      $('#enlargeImageModal').modal('show');
    })
  );
  $laddaButton.click(function () {
    const where         = $('#where').val();
    let successCallback = null;
    if (where === 'unfinished') {
      successCallback = () => {
        $laddaButton.attr('disabled', true);
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

    const reward = Number.parseFloat($('#reward').text().substr(1));
    if ($('button.ladda-button span').text() === '接单' &&
      $('#rewardType').text() === '收取' &&
      reward > 0
    ) {
      const outTradeNo = randomString(28);
      startPay({fee: reward, body: '领取任务预支付费用', outTradeNo: outTradeNo}, () => {
        doSubmit(outTradeNo);
      }, () => {
      });
    } else {
      doSubmit();
    }
  });
  $('div.main').css('margin-bottom', (15 + $('div.navbar-fixed-bottom').height()));


  $contactModal.on('show.bs.modal', () => {
    $('div.modal div.modal-dialog').css({
      'overflow-y': 'auto',
      'max-height': $(window).height() / 2
    });
  });

  $('#contentTr').click(() => {
    $contactModal.modal();
  });
});