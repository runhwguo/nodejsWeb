$.extend({
  handleError: (s, xhr, status, e) => {
    // If a local callback was specified, fire it
    if (s.error) {
      s.error(xhr, status, e);
    } else if (xhr.responseText) {// If we have some XML response text (e.g. from an AJAX call) then log it in the console
      console.log(xhr.responseText);
    }
  },
  createUploadIframe: (id, uri) => {
    //create frame
    let frameId = 'jUploadFrame' + id,
        io;
    if (window.ActiveXObject) {
      io = document.createElement('<iframe id="' + frameId + '" name="' + frameId + '" />');
      if (typeof uri === 'boolean') {
        io.src = 'javascript:false';
      } else if (typeof uri === 'string') {
        io.src = uri;
      }
    } else {
      io      = document.createElement('iframe');
      io.id   = frameId;
      io.name = frameId;
    }
    io.style.position = 'absolute';
    io.style.top      = '-1000px';
    io.style.left     = '-1000px';

    document.body.appendChild(io);

    return io;
  },
  createUploadForm: (id, fileElementId, data) => {
    //create form
    let formId     = 'jUploadForm' + id,
        fileId     = 'jUploadFile' + id,
        form       = $('<form  action="" method="POST" name="' + formId + '" id="' + formId + '" enctype="multipart/form-data"></form>'),
        oldElement = $('#' + fileElementId),
        newElement = $(oldElement).clone();
    $(oldElement).attr('id', fileId);
    $(oldElement).before(newElement);
    $(oldElement).appendTo(form);

    //增加文本参数的支持
    if (data) {
      for (const i in data) {
        $('<input type="hidden" name="' + i + '"/>').val(data[i]).appendTo(form);
      }
    }

    //set attributes
    $(form).css({
      position: 'absolute',
      top: '-1200px',
      left: '-1200px'
    });
    $(form).appendTo('body');
    return form;
  },

  ajaxFileUpload: s => {
    // introduce global settings, allowing the client to modify them for all requests, not only timeout
    s        = $.extend({}, $.ajaxSettings, s);
    let id   = Date.now(),
        form = $.createUploadForm(id, s.fileElementId, s.data);
    $.createUploadIframe(id, s.secureuri);
    let frameId     = 'jUploadFrame' + id,
        formId      = 'jUploadForm' + id,
        requestDone = false,
        xml         = {};
    // Watch for a new set of requests
    if (s.global && !$.active++) {
      $.event.trigger('ajaxStart');
    }
    // Create the request object
    if (s.global) {
      $.event.trigger('ajaxSend', [xml, s]);
    }
    // Wait for a response to come back
    let uploadCallback = isTimeout => {
      let io = document.getElementById(frameId);
      try {
        if (io.contentWindow) {
          xml.responseText = io.contentWindow.document.body ? io.contentWindow.document.body.innerHTML : null;
          xml.responseXML  = io.contentWindow.document.XMLDocument ? io.contentWindow.document.XMLDocument : io.contentWindow.document;
        } else if (io.contentDocument) {
          xml.responseText = io.contentDocument.document.body ? io.contentDocument.document.body.innerHTML : null;
          xml.responseXML  = io.contentDocument.document.XMLDocument ? io.contentDocument.document.XMLDocument : io.contentDocument.document;
        }
      } catch (e) {
        $.handleError(s, xml, null, e);
      }
      if (xml) {
        requestDone = true;
        let status;
        try {
          status = isTimeout !== 'timeout' ? 'success' : 'error';
          // Make sure that the request was successful or notmodified
          if (status !== 'error') {
            // process the data (runs the xml through httpData regardless of callback)
            let data = $.uploadHttpData(xml, s.dataType);
            // If a local callback was specified, fire it and pass it the data
            if (s.success) {
              s.success(data, status);
            }

            // Fire the global callback
            if (s.global) {
              $.event.trigger('ajaxSuccess', [xml, s]);
            }
          } else {
            $.handleError(s, xml, status);
          }
        } catch (e) {
          status = 'error';
          $.handleError(s, xml, status, e);
        }

        // The request was completed
        if (s.global) {
          $.event.trigger('ajaxComplete', [xml, s]);
        }

        // Handle the global AJAX counter
        if (s.global && !--$.active) {
          $.event.trigger('ajaxStop');
        }

        // Process result
        if (s.complete) {
          s.complete(xml, status);
        }

        $(io).unbind();

        setTimeout(() => {
          try {
            $(io).remove();
            $(form).remove();
          } catch (e) {
            $.handleError(s, xml, null, e);
          }
        }, 100);
        xml = null;
      } else if (isTimeout === 'timeout') {
        requestDone = true;
        let status  = 'error';
        try {
          status = isTimeout === 'timeout' ? 'error' : 'success';
          // Make sure that the request was successful or notmodified
          if (status === 'error') {
            $.handleError(s, xml, status);
          } else {
            // process the data (runs the xml through httpData regardless of callback)
            let data = $.uploadHttpData(xml, s.dataType);
            // If a local callback was specified, fire it and pass it the data
            if (s.success) {
              s.success(data, status);
            }

            // Fire the global callback
            if (s.global) {
              $.event.trigger('ajaxSuccess', [xml, s]);
            }
          }
        } catch (e) {
          $.handleError(s, xml, status, e);
        }

        // The request was completed
        if (s.global) {
          $.event.trigger('ajaxComplete', [xml, s]);
          // Handle the global AJAX counter
          if (!--$.active) {
            $.event.trigger('ajaxStop');
          }
        }

        // Process result
        if (s.complete) {
          s.complete(xml, status);
        }

        $(io).unbind();

        setTimeout(() => {
          try {
            $(io).remove();
            $(form).remove();
          } catch (e) {
            $.handleError(s, xml, null, e);
          }
        }, 100);
        xml = null;
      }
    };
    // Timeout checker
    if (s.timeout > 0) {
      setTimeout(() => {
        // Check to see if the request is still happening
        if (!requestDone) uploadCallback('timeout');
      }, s.timeout);
    }
    try {
      // var io = $('#' + frameId);
      const form = $('#' + formId);
      $(form).attr({
        'action': s.url,
        'method': 'POST',
        'target': frameId
      });
      if (form.encoding) {
        form.encoding = 'multipart/form-data';
      } else {
        form.enctype = 'multipart/form-data';
      }
      $(form).submit();
    } catch (e) {
      $.handleError(s, xml, null, e);
    }
    if (window.attachEvent) {
      document.getElementById(frameId).attachEvent('onload', uploadCallback);
    } else {
      document.getElementById(frameId).addEventListener('load', uploadCallback, false);
    }
    return {
      abort: () => {
      }
    };
  },

  uploadHttpData: (r, type) => {
    let data = !type;
    data     = type === 'xml' || data ? r.responseXML : r.responseText;
    // If the type is 'script', eval it in global context
    if (type === 'script') {
      $.globalEval(data);
    }
    // Get the JavaScript object, if JSON is used.
    if (type === 'json') {
      data      = r.responseText;
      let start = data.indexOf('>');
      if (start !== -1) {
        let end = data.indexOf('<', start + 1);
        if (end !== -1) {
          data = data.substring(start + 1, end);
        }
      }
      eval('data = ' + data);
    }
    // evaluate scripts within html
    if (type === 'html') {
      $('<div>').html(data).evalScripts();
    }
    //alert($('param', data).each(function(){alert($(this).attr('value'));}));
    return data;
  }
});