$(() => {
  let form = $('form'),
    submitBtnWord = $('.ladda-label'),
    deadline = $('#deadline'),
    reward = $('#reward'),
    createTask = $('#createTaskTab');

  const rewardReg = /^\d+(.\d{1,2})?$/;
  deadline.datepicker({
    minDate: 0,
    maxDate: 31,
    autoclose: true,
    yearSuffix: '年',
    dateFormat: 'yy-mm-dd',
    onSelect: () => {
      form.data('bootstrapValidator')
        .updateStatus('deadline', 'NOT_VALIDATED', null)
        .validateField('deadline');
    },
    showMonthAfterYear: true,
    dayNamesMin: ['日', '一', '二', '三', '四', '五', '六'],
    monthNames: ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月']
  });

  deadline.click(() => {
    let uiDatepickerDiv = $('#ui-datepicker-div');
    let viewportWidth = $(window).width();
    let viewportHeight = $(window).height();
    let datepickerWidth = uiDatepickerDiv.width();
    let datepickerHeight = uiDatepickerDiv.height();
    let leftPos = (viewportWidth - datepickerWidth) / 2; //Standard centering method
    let topPos = (viewportHeight - datepickerHeight) / 2; //Standard centering method
    uiDatepickerDiv.css({
      left: leftPos,
      top: topPos,
      position: 'absolute'
    }).css('z-index', 999);
  });

  reward.keypress((event) => {
    let which = event.which;
    if ((which >= '0'.charCodeAt(0) && which <= '9'.charCodeAt(0)) || which === '.'.charCodeAt(0)) {
    } else {
      event.preventDefault();
    }
  });

  /**
   * 生成随机字符串，默认去掉了容易混淆的字符oOLl,9gq,Vv,Uu,I1
   * @param len
   * @returns {string}
   */
  const randomString = (len = 32) => {
    const chars = 'ABCDEFGHJKMNPQRSTWXYZabcdefhijkmnprstwxyz2345678';
    let maxPos = chars.length;
    let pwd = '';
    for (let i = 0; i < len; i++) {
      pwd += chars[Math.floor(Math.random() * maxPos)];
    }
    return pwd;
  };

  form.bootstrapValidator({
    message: 'The form is not valid',
    feedbackIcons: {
      valid: 'glyphicon glyphicon-ok',
      invalid: 'glyphicon glyphicon-remove',
      validating: 'glyphicon glyphicon-refresh'
    },
    fields: {
      type: {
        message: 'The type is not valid',
        validators: {
          notEmpty: {
            message: '请选择任务类型'
          }
        }
      },
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
            message: "请输入带1-2位小数的正数"
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

    const doSubmit = (outTradeNo) => {
      let submit = $('.submit'),
        loading = Ladda.create(submit.get(0));
      loading.start();
      let serializeArray = form.serializeArray(),
        data = {};

      $.map(serializeArray, (n, i) => data[n['name']] = n['value'].replace(/"/g, '\\"'));
      if (outTradeNo) {
        data.outTradeNo = outTradeNo;
      } else {// 收
        data.reward = -data.reward;
      }
      const interval = 1000,
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
            loading.stop();
            // bootstrapValidator本身有prevent double click的逻辑，但是和Ladda有互相影响，手动加一下
            submit.attr('disabled', true);
          }, interval);
        },
        error: (xhr, status, e) => {
          submitBtnWord.text('失败');
          setTimeout(() => {
            submitBtnWord.text(normalSubmitBtnWord);
            loading.stop();
          }, interval);
        }
      });
    };

    let rewardType = $('#rewardType').val();
    let reward = $('#reward').val();
    if (rewardType === '赏' && reward > 0) {
      let outTradeNo = randomString(28);
      startPay({fee: reward * 100, body: '发布任务预支付费用', outTradeNo: outTradeNo}, () => {
        doSubmit(outTradeNo);
      }, () => {
      });
    } else {
      doSubmit();
    }
  });
  createTask.attr('href', 'javascript:void(0)');
  let selectpicker = $('.selectpicker');
  selectpicker.change(() => {
      if (selectpicker.val() === '会员共享') {
        $('#shareCountDiv').show('fast');
      } else {
        $('#shareCountDiv').hide('fast');
      }
    }
  );
  $('li[name="rewardValue"]').click(function () {
    $('#rewardType').val($(this).text());

    form.data('bootstrapValidator')
      .updateStatus('rewardType', 'NOT_VALIDATED', null)
      .validateField('rewardType');
  });

  $.uploadPreview({
    input_field: "#file",   // Default: .file
    preview_box: "#image-preview",  // Default: .image-preview
    label_field: "#image-label",    // Default: .image-label
    label_default: "图片补充",   // Default: Choose File
    label_selected: "更换图片",  // Default: Change File
    no_label: false                 // Default: false
  });
  form.css('margin-bottom', 15 + $('.navbar-fixed-bottom').height());
});