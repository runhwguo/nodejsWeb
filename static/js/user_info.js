$(() => {
  let form = $('form');

  form.bootstrapValidator({
    message: 'The form is not valid',
    feedbackIcons: {
      valid: 'glyphicon glyphicon-ok',
      invalid: 'glyphicon glyphicon-remove',
      validating: 'glyphicon glyphicon-refresh'
    },
    fields: {
      name: {
        message: 'The name is not valid',
        validators: {
          notEmpty: {
            message: '请填写姓名'
          }
        }
      },
      tel: {
        message: 'The tel is not valid',
        validators: {
          notEmpty: {
            message: '请填写手机号'
          }
        }
      },
      qq: {
        message: 'The qq is not valid',
        validators: {
          notEmpty: {
            message: '请填写QQ号'
          },
          regexp: {
            regexp: /^[1-9]\d{4,9}$/,
            message: '请填写正确的QQ号'
          }
        }
      },
      wx: {
        message: 'The wx is not valid',
        validators: {
          notEmpty: {
            message: '请填写微信号'
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
      window.location.href = 'https://open.weixin.qq.com/connect/oauth2/authorize?appid=wx90eb6b04dcbf5fb2&redirect_uri=http%3A%2F%2Fi-sharing.xyz&response_type=code&scope=snsapi_userinfo&state=STATE#wechat_redirect';
    });
  });

  if ($('#where').val() === 'me') {
    $('.submit').attr('disabled', true);
  }
});