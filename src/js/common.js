// 请求地址
var ipUrl = 'http://www.d.edipao.cn/';


layui.define([], function(exports) {
    var Common = function() {
        this.VERSION = '1.0.0';
        this.API_HOST = 'http://www.d.edipao.cn';
        this.requestDefaultOption = {
            type: "POST",
            dataType: 'json',
            timeout: 5000,
        }
    }

    Common.prototype.request = function(options) {
        var that = this;
        options = $.extend({}, this.requestDefaultOption, options)
        options.url = this.API_HOST + options.url;
        if(!options.data) options.data = {};
        if(this.getLoginStaffId){
            options.data.loginStaffId = this.getLoginStaffId;
        }
        return $.ajax(options)
            .done(function(res) {
                if(['4004','4010'].indexOf(res.code) !== -1){
                    that.tokenExpired()
                }
                if(res.code != 0){
                   layui.layer.msg(res.message)
                }
            }).fail(function() {});
    }

    Common.prototype.tokenExpired = function() {
      layui.sessionData('user',null);
      window.top.goToLogin();
    }

    Common.prototype.getLoginStaffId = function() {
      var user = layui.sessionData('user');
      return user.staffId
    }

    Common.prototype.urlGet = function() {
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


    exports('edipao', new Common());
});


layui.define(['layer','element'], function(exports) {
    var doc = document,
        layer = layui.layer,
        element = layui.element,
        Xadmin = function() {
            this.v = '2.2'; //版本号
        };

    Xadmin.prototype.init = function() {
        var tab_list = this.get_data();
        for (var i in tab_list) {
            this.add_lay_tab(tab_list[i].title, tab_list[i].url, i);
        }
        element.tabChange('xbs_tab', i);
    };
    /**
     * [end 执行结束要做的]
     * @return {[type]} [description]
     */
    Xadmin.prototype.end = function() {

        var cate_list = this.get_cate_data();

        for (var i in cate_list) {
            if (cate_list[i] != null) {
                $('.left-nav #nav li').eq(cate_list[i]).click();
            }
        }
    };

    Xadmin.prototype.add_tab = function(title, url, is_refresh) {
        var id = url; //md5每个url

        //重复点击
        for (var i = 0; i < $('.x-iframe').length; i++) {
            if ($('.x-iframe').eq(i).attr('tab-id') == id) {
                element.tabChange('xbs_tab', id);
                if (is_refresh)
                    $('.x-iframe').eq(i).attr("src", $('.x-iframe').eq(i).attr('src'));
                return;
            }
        };

        this.add_lay_tab(title, url, id);
        this.set_data(title, url, id);
        element.tabChange('xbs_tab', id);

    }

    Xadmin.prototype.del_tab = function(id) {

        if (id) {
            console.log(88);
        } else {
            var id = $(window.frameElement).attr('tab-id');
            parent.element.tabDelete('xbs_tab', id);
        }
    }

    Xadmin.prototype.add_lay_tab = function(title, url, id) {
        element.tabAdd('xbs_tab', {
            title: title,
            content: '<iframe tab-id="' + id + '" frameborder="0" src="' + url + '" scrolling="yes" class="x-iframe"></iframe>',
            id: id
        })
    }
    /**
     * [open 打开弹出层]
     * @param  {[type]}  title [弹出层标题]
     * @param  {[type]}  url   [弹出层地址]
     * @param  {[type]}  w     [宽]
     * @param  {[type]}  h     [高]
     * @param  {Boolean} full  [全屏]
     * @return {[type]}        [description]
     */
    Xadmin.prototype.open = function(title, url, w, h, full) {
        if (title == null || title == '') {
            var title = false;
        };
        if (url == null || url == '') {
            var url = "404.html";
        };
        if (w == null || w == '') {
            var w = ($(window).width() * 0.9);
        };
        if (h == null || h == '') {
            var h = ($(window).height() - 50);
        };
        var index = layer.open({
            type: 2,
            area: [w + 'px', h + 'px'],
            fix: false, //不固定
            maxmin: true,
            shadeClose: true,
            shade: 0.4,
            title: title,
            content: url
        });
        if (full) {
            layer.full(index);
        }
    }
    /**
     * [close 关闭弹出层]
     * @return {[type]} [description]
     */
    Xadmin.prototype.close = function() {
        var index = parent.layer.getFrameIndex(window.name);
        parent.layer.close(index);
    };
    /**
     * [close 关闭弹出层父窗口关闭]
     * @return {[type]} [description]
     */
    Xadmin.prototype.father_reload = function() {
        parent.location.reload();
    };
    /**
     * [get_data 获取所有项]
     * @return {[type]} [description]
     */
    Xadmin.prototype.get_data = function() {
        if (typeof is_remember != "undefined")
            return false;
        return layui.data('tab_list')
    }
    /**
     * [set_data 增加某一项]
     * @param {[type]} id [description]
     */
    Xadmin.prototype.set_data = function(title, url, id) {

        if (typeof is_remember != "undefined")
            return false;

        layui.data('tab_list', {
            key: id,
            value: { title: title, url: url }
        });
    };

    /**
     * [get_data 获取所有项]
     * @return {[type]} [description]
     */
    Xadmin.prototype.get_cate_data = function() {
        if (typeof is_remember != "undefined")
            return false;
        return layui.data('cate')
    }
    /**
     * [set_data 增加某一项]
     * @param {[type]} id [description]
     */
    Xadmin.prototype.set_cate_data = function(data) {

        if (typeof is_remember != "undefined")
            return false;

        layui.data('cate', data);
    };
    /**
     * [del_data 删除某一项]
     * @param  {[type]} id [description]
     * @return {[type]}    [description]
     */
    Xadmin.prototype.del_data = function(id) {
        if (typeof is_remember != "undefined")
            return false;
        if (typeof id != "undefined") {
            layui.data('tab_list', {
                key: id,
                remove: true
            });
        } else {
            layui.data('tab_list', null);
        }
    };
    /**
     * [del_other_data 删除其它]
     * @param  {[type]} id [description]
     * @return {[type]}    [description]
     */
    Xadmin.prototype.del_other_data = function(id) {
        if (typeof is_remember != "undefined")
            return false;
        var tab_list = this.get_data();

        layui.data('tab_list', null);

        layui.data('tab_list', {
            key: id,
            value: tab_list[id]
        });
    };

    exports('xadmin', new Xadmin());
})