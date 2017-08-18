$(() => {
  let form          = $('form'),
      submitBtnWord = $('.ladda-label'),
      type          = $('#type'),
      reward        = $('#reward');

  const rewardReg = /^\d+(.\d{1,2})?$/;

  const formBootstrapValidator = name => {
    form.data('bootstrapValidator')
      .updateStatus(name, 'NOT_VALIDATED', null)
      .validateField(name);
  };

  mobiscroll.settings = {
    lang: 'zh',
    display: 'bottom'
  };

  $('#deadline').mobiscroll().date({
    dateFormat: 'yy-mm-dd'
  });

  type.mobiscroll().select();

  // MobiScroll 采用bootstrap风格
  $(`#${type.attr('id')}_dummy`).attr('class', 'form-control');

  reward.keypress((event) => {
    let which = event.which;
    if ((which >= '0'.charCodeAt(0) && which <= '9'.charCodeAt(0)) || which === '.'.charCodeAt(0)) {
    } else {
      event.preventDefault();
    }
  });

  form.bootstrapValidator({
    message: 'The form is not valid',
    feedbackIcons: {
      valid: 'glyphicon glyphicon-ok',
      invalid: 'glyphicon glyphicon-remove',
      validating: 'glyphicon glyphicon-refresh'
    },
    fields: {
      shareCount: {
        message: 'The type is not valid',
        validators: {
          notEmpty: {
            message: '请填写共享次数'
          }
        }
      },
      title: {
        message: 'The title is not valid',
        validators: {
          notEmpty: {
            message: '请填入任务标题'
          }
        }
      },
      reward: {
        message: 'The reward is not valid',
        validators: {
          notEmpty: {
            message: '请填写报酬'
          },
          regexp: {
            regexp: rewardReg,
            message: '请输入带1-2位小数的正数'
          },
          callback: {
            message: 'The reward is not valid',
            callback: (value, validator, $field) => {
              let reward = Number.parseFloat(value);
              if (reward > 0 && reward < 1.5) {
                return {
                  valid: false,
                  message: '报酬最少￥1.5'
                };
              }

              return true;
            }
          }
        }
      },
      deadline: {
        message: 'The deadline is not valid',
        validators: {
          notEmpty: {
            message: '请选择结束日期'
          }
        }
      },
      rewardType: {
        message: 'The deadline is not valid',
        validators: {
          notEmpty: {
            message: '请选择报酬类型'
          }
        }
      }
    }
  }).on('success.form.bv', e => {
    e.preventDefault();

    $('#publishOkBtn').click(() => {
      if ($('.modal-body').text().includes('成功')) {
        window.location.href = '/';
      } else {
        $('#publishModal').modal('hide');
      }
    });

    const doSubmit = outTradeNo => {
      let submit  = $('.submit'),
          loading = Ladda.create(submit.get(0));
      loading.start();
      let serializeArray = form.serializeArray(),
          data           = {};

      $.map(serializeArray, (n, i) => data[n['name']] = n['value'].replace(/"/g, '\\"'));
      if (outTradeNo) {
        data.outTradeNo = outTradeNo;
      } else {// 收
        data.reward = -data.reward;
      }
      const INTERVAL            = 1000,
            normalSubmitBtnWord = submitBtnWord.text();
      $.ajaxFileUpload({
        type: form.attr('method'),
        url: form.attr('action'),
        secureuri: false,
        fileElementId: 'file',
        data: data,
        dataType: 'json',
        success: (data, status) => {
          console.log(data, status);
          submitBtnWord.text('成功');
          setTimeout(() => {
            submitBtnWord.text(normalSubmitBtnWord);
            $('.modal-body').text('任务发布成功，跳回主页？');
            $('#publishModal').modal('show');
            loading.stop();
            // bootstrapValidator本身有prevent double click的逻辑，但是和Ladda有互相影响，手动加一下
            submit.attr('disabled', true);
          }, INTERVAL);
        },
        error: (xhr, status, e) => {
          submitBtnWord.text('失败');
          setTimeout(() => {
            submitBtnWord.text(normalSubmitBtnWord);
            $('.modal-body').text('任务发布失败');
            $('#publishModal').modal('show');
            loading.stop();
          }, INTERVAL);
        }
      });
    };

    let rewardType = $('#rewardType').val();
    let reward     = Number.parseFloat($('#reward').val());
    if (rewardType === '赏' && reward > 0) {
      let outTradeNo = randomString(28);
      startPay({fee: reward, body: '发布任务预支付费用', outTradeNo: outTradeNo}, () => {
        doSubmit(outTradeNo);
      }, () => {
      });
    } else {
      doSubmit();
    }
  });
  $('#createTaskTab').attr('href', 'javascript:void(0)');
  type.change(() => $('#shareCountDiv')[type.val() === '会员共享' ? 'show' : 'hide']('fast'));
  $('li[name="rewardValue"]').click(function () {
    $('#rewardType').val($(this).text());

    formBootstrapValidator('rewardType');
  });

  $.uploadPreview({
    input_field: '#file',   // Default: .file
    preview_box: '#image-preview',  // Default: .image-preview
    label_field: '#image-label',    // Default: .image-label
    label_default: '图片补充',   // Default: Choose File
    label_selected: '更换图片',  // Default: Change File
    no_label: false                 // Default: false
  });
  form.css('margin-bottom', 15 + $('.navbar-fixed-bottom').height());
});