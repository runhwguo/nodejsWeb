$(() => {
  let form = $('form'),
    submitBtnWord = $('.ladda-label'),
    deadline = $('#deadline'),
    createTask = $('#createTaskTab');
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

  deadline.click((event) => {
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
    });
  });

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
          regexp: {
            regexp: /^[0-9]\d*$/,
            message: "请输入正整数的钱数"
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
      }
    }
  }).on('success.form.bv', e => {
    e.preventDefault();

    const doSubmit = () => {
      let submit = $('.submit'),
        loading = Ladda.create(submit.get(0));
      loading.start();
      let serializeArray = form.serializeArray(),
        formData = {};

      $.map(serializeArray, (n, i) => formData[n['name']] = n['value'].replace(/"/g, '\\"'));
      $.ajaxFileUpload({
        type: form.attr('method'),
        url: form.attr('action'),
        secureuri: false,
        fileElementId: 'file',
        data: JSON.parse(JSON.stringify(formData)),
        dataType: 'json',
        success: (data, status) => {
          console.log(data, status);
          submitBtnWord.text('成功');
          setTimeout(() => {
            submitBtnWord.text('发布');
            loading.stop();
            // bootstrapValidator本身有prevent double click的逻辑，但是和Ladda有互相影响，手动加一下
            submit.attr('disabled', true);
          }, 1000);
        },
        error: (xhr, status, e) => {
          submitBtnWord.text('失败');
          setTimeout(() => {
            submitBtnWord.text('发布');
            loading.stop();
          }, 1000);
        }
      });
    };

    let rewardType = $('#rewardType').text();
    if (rewardType === '悬赏') {
      let reward = $('#reward')[0].value;
      startPay(reward * 100, () => {
        doSubmit();
      }, () => {
      });
    } else {
      doSubmit();
    }
  });
  createTask.attr('href', 'javascript:void(0)');
  let selectpicker = $('.selectpicker');
  selectpicker.change(() => {
      if (selectpicker[0].value === '会员共享') {
        $('#shareCountDiv').show(300);
      } else {
        $('#shareCountDiv').hide(300);
      }
    }
  );
  $('li[name="rewardValue"]').click(function () {
    console.log(this);
    $('#rewardType').text($(this).text());
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