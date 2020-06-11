(function() {
  Date.prototype.Format = function(format) {
    format = format || 'yyyy-MM-dd hh:mm:ss';
    var o = {
      "M+": this.getMonth() + 1,
      "d+": this.getDate(),
      "h+": this.getHours(),
      "m+": this.getMinutes(),
      "s+": this.getSeconds(),
      "q+": Math.floor((this.getMonth() + 3) / 3),
      "S": this.getMilliseconds()
    };
    if (/(y+)/.test(format)) {
      format = format.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
    }
    for (var k in o) {
      if (new RegExp("(" + k + ")").test(format)) {
        format = format.replace(RegExp.$1, RegExp.$1.length == 1 ? o[k] : ("00" + o[k]).substr(("" + o[k]).length));
      }
    }
    return format;
  }

  var ua = navigator.userAgent;
  var MD5KEY = '8d4795529a205048',
    open_url;
  var common = {
    version: '1.0.0',
    isClient: ua.indexOf('Edaijia/') !== -1,
    defaultAjaxOption: {
      type: 'GET',
      dataType: 'json',
      timeout: 5000,
    },
    defaultRequestData: {}
  }


  if (location.href.indexOf("h5.edaijia") === -1) {
    open_url = "//api.d.edipao.cn/";
  } else {
    open_url = "//api.edipao.cn/";
  }


  common.urlGet = function() {
    var args = {};
    var query = location.search.substring(1);
    var pairs = query.split("&");
    for (var i = 0; i < pairs.length; i++) {
      var pos = pairs[i].indexOf('=');
      if (pos == -1) continue;
      var argname = pairs[i].substring(0, pos);
      var value = pairs[i].substring(pos + 1);
      value = decodeURIComponent(value);
      args[argname] = value;
    }
    return args;
  }

  function getSig(param) {
    var paramStr = [],
      paramStrSorted = [];
    for (var n in param) {
      paramStr.push(n);
    }
    paramStr = paramStr.sort();
    $(paramStr).each(function(index) {
      paramStrSorted.push(this + '=' + param[this]);
    });
    var text = paramStrSorted.join('&') + '&secretKey=' + MD5KEY;
    console.log(text)
    var sign = $.md5(text).slice(0, 30)
    return sign.toUpperCase();
  }

  function stringify(data) {
    var value = [];
    for (prop in data) {
      value.push(prop + "=" + encodeURIComponent(data[prop]));
    }
    return value.join('&');
  }

  function request(_options, hideLoading, hideToast) {
    var options = $.extend({}, common.defaultAjaxOption, _options);
    var data = $.extend({}, common.defaultRequestData, options.data);
    var loading = common.loading();
    data.timestamp = new Date().getTime();
    data.sign = getSig(data);
    options.data = stringify(data);

    !hideLoading && loading.show();
    return $.ajax(options)
      .done(function() {
        !hideLoading && loading.hide();
      })
      .fail(function() {
        !hideLoading && loading.hide();
        common.toast('网络异常,请检查网络')
      });
  }

  function openRequest(_options, hideLoading, hideToast) {
    _options.url = open_url + _options.url;
    return request(_options, hideLoading, hideToast)
  }
  common.openRequest = openRequest;

  function createToast(text) {
    if($('.container-toast').length < 1){
      var toast = $('<div class="toast-layer"><div class="container-toast">' + text + '</div></div>');
      toast.appendTo('body').fadeIn('fast', function() {
        setTimeout(function() {
          toast.fadeOut('fast', function() { toast.remove() });
        }, 1500)
      });
    } else {
      $('.container-toast').text(text);
    }
  }

  function createModel(text){
    $('body').append('<div class="model-layer"><div class="model-inner">' + text + '</div></div>')
  }

  function Loading() {
    this.elem = $('<div class="loading-layer"><div class="loading-inner"><img src="img/loading.png" /></div></div>');
  }

  Loading.prototype.show = function() {
    this.elem.appendTo('body').fadeIn('fast');
  }
  Loading.prototype.hide = function() {
    var that = this;
    this.elem.fadeOut('fast', function() {
      that.elem.remove();
    });
  }
  common.toast = createToast;
  common.model = createModel;
  common.loading = function() {
    return new Loading();
  }

  function getLocalStroge(key) {
    return localStorage.getItem('meitu-' + key);
  }

  function setLocalStroge(key, value) {
    localStorage.setItem('meitu-' + key, value);
  }

  function removeLocalStroge(key) {
    localStorage.removeItem('meitu-' + key);
  }

  function clearLocalStroge() {
    localStorage.clear();
  }

  common.getLocalStroge = getLocalStroge;
  common.setLocalStroge = setLocalStroge;
  common.removeLocalStroge = removeLocalStroge;

  window.common = common;
})();
