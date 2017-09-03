$(() => {
  const $form     = $('form'),
        $nameVal  = $('#name').val(),
        $tel      = $('#tel'),
        $telVal   = $tel.val(),
        $wxVal    = $('#wx').val(),
        $qq       = $('#qq'),
        $qqVal    = $qq.val(),
        $whereVal = $('#where').val();

  const setButtonDisable = (disable = true) => {
    $whereVal === 'me' && $('button.submit').attr('disabled', disable);
  };
  setButtonDisable();

  $form.bootstrapValidator({
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
          },
          callback: {
            callback: name => {
              name !== $nameVal && setButtonDisable(false);

              return true;
            }
          }
        }
      },
      tel: {
        message: 'The tel is not valid',
        validators: {
          notEmpty: {
            message: '请填写手机号'
          },
          callback: {
            callback: tel => {
              tel !== $telVal && setButtonDisable(false);

              return true;
            }
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
            regexp: /^[1-9]\d{4,10}$/,
            message: '请填写正确的QQ号'
          },
          callback: {
            callback: qq => {
              $qqVal !== qq && setButtonDisable(false);

              return true;
            }
          }
        }
      },
      wx: {
        message: 'The wx is not valid',
        validators: {
          notEmpty: {
            message: '请填写微信号'
          },
          callback: {
            callback: wx => {
              wx !== $wxVal && setButtonDisable(false);

              return true;
            }
          }
        }
      }
    }
  }).on('success.form.bv', e => {
    e.preventDefault();

    submitAjax($('.ladda-button'), {
      type: $form.attr('method'),
      url: $form.attr('action'),
      data: JSON.parse('{"' + decodeURIComponent($form.serialize()).replace(/"/g, '\\"').replace(/&/g, '","').replace(/=/g, '":"') + '"}'),
    }, {
      success: '成功',
      fail: '失败'
    }, () => {
      // 登录成功，跳回主页，获取微信信息
      if ($whereVal === 'me') {
        window.location.href = '/me';
      } else {
        if (isSupportWxPay()) {
          // 获取用户的微信信息
          window.location.href = 'https://open.weixin.qq.com/connect/oauth2/authorize?appid=wx90eb6b04dcbf5fb2&redirect_uri=http%3A%2F%2Fi-sharing.xyz&response_type=code&scope=snsapi_userinfo&state=STATE#wechat_redirect';
        } else {
          window.location.href = '/';
        }
      }
    });
  });

  $tel.keypress(event => {
    const which = event.which;
    // 127 in ascii is DEL
    if (isDecimalDigit(which) || isDelOrBackspace(which)) {
      if (isDecimalDigit(which)) {
        const val = $tel.val();
        if (val.length >= 11) {
          event.preventDefault();
        }
      }
    } else {
      event.preventDefault();
    }
  });

  $qq.keypress(event => {
    const which = event.which;
    // 127 in ascii is DEL
    if (isDecimalDigit(which) || isDelOrBackspace(which)) {
      if (isDecimalDigit(which)) {
        const val = $qq.val();
        if (val.length >= 11) {
          event.preventDefault();
        }
      }
    } else {
      event.preventDefault();
    }
  });
});