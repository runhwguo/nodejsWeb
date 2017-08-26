$(() => {
  const form = $('form');
  form.bootstrapValidator({
    message: 'The form is not valid',
    feedbackIcons: {
      valid: 'glyphicon glyphicon-ok',
      invalid: 'glyphicon glyphicon-remove',
      validating: 'glyphicon glyphicon-refresh'
    },
    fields: {
      id: {
        message: 'The id is not valid',
        validators: {
          notEmpty: {
            message: '请填写学号'
          },
          regexp: {
            regexp: /^[0-9]+$/,
            message: '请填写正确的学号'
          }
        }
      },
      password: {
        message: 'The password is not valid',
        validators: {
          notEmpty: {
            message: '请填写密码'
          }
        }
      },
      verificationCode: {
        message: 'The verificationCode is not valid',
        validators: {
          notEmpty: {
            message: '请填写验证码'
          },
          regexp: {
            regexp: /^[a-zA-Z0-9]{4}$/,
            message: '请填写正确的验证码'
          }
        }
      }
    }
  }).on('success.form.bv', e => {
    e.preventDefault();

    submitAjax($('.ladda-button'), {
      type: form.attr('method'),
      url: form.attr('action'),
      data: JSON.parse('{"' + decodeURIComponent(form.serialize()).replace(/"/g, '\\"').replace(/&/g, '","').replace(/=/g, '":"') + '"}'),
    }, {
      success: '成功',
      fail: '失败'
    }, () => {
      window.location.href = '/userInfo?where=login';
    });
  });
  for (const tab of ['meTab', 'createTaskTab'].map(e => $(`#${e}`))) {
    tab.attr('href', 'javascript:void(0)');
  }
});