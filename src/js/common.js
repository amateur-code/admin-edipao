layui.define([], function(exports) {
    var Common = function() {
        this.VERSION = '1.0.0';
        this.API_HOST = 'https://api.d.edipao.cn';
        if(location.href.indexOf('test.edipao.cn') > -1){
            this.API_HOST = location.protocol + '//api.d.edipao.cn';
        }
        if(location.href.indexOf('wwwv2.edipao.cn') > -1){
            this.API_HOST = location.protocol + '//api.edipao.cn';
        }
        if(location.href.indexOf('localhost') > -1){
            this.API_HOST = 'http://localhost:8080';
        }
        this.requestDefaultOption = {
            type: "POST",
            dataType: 'json',
            timeout: 20000,
        }
    }

    Common.prototype.exportData = function (options) {
        var _this = this;
        var promise = $.Deferred();
        var pageSize = options.pageSize;
        var pageNo = 1;
        var url = options.url;
        var method = options.method || "GET";
        var limit = options.limit;
        var params = options.params;
        var result = [];
        var step = options.step || 200;
        var checkFunction = options.checkFunction;
        get();
        function get() {
            if(step * (pageNo - 1) >= limit){
                promise.resolve(result);
                return;
            }
            params.pageNo = pageNo;
            params[pageSize] = step;
            _this.request({
                method: method,
                data: params,
                url: url,
                timeout: 100000
            }, true).done(function (res) {
                if(res.code == 0){
                    if(checkFunction(res)){
                        pageNo++;
                        result.push(res.data);
                        get();
                    }else{
                        promise.resolve(result);
                    }
                }else{
                    promise.resolve(result);
                }
            }).fail(function () {
                promise.resolve(result);
                
            });
        }
        return promise.promise();
    }

    Common.prototype.getCitys = function (cb) {
        this.request({
            url: '/admin/city/all',
        }).done(res=>{
            if(res.code == 0){
                var data = res.data;
                if(data){
                    cb && cb(toTree(data));
                }
            }else{
                layer.msg(res.message)
            }
        })
        function toTree(data) {
             var val = [
                     {
                         name: '请选择省份',
                         code:'',
                         cityList: [
                             { name: '请选择市级', areaList: [],code:'', },
                         ]
                     }
                 ];
            var level2 = [];
            layui.each(data,function (index,item) {
                if(item.level == 1){
                    var cityList = []
                    if(item.province.indexOf('北京')=='-1'&&item.province.indexOf('天津')=='-1'&&item.province.indexOf('上海')=='-1'&&item.province.indexOf('重庆')=='-1'){
                        cityList = [{ name: '全部', areaList: []}]
                    }
                    val.push({
                        name: item.province,
                        code:item.code,
                        cityList:cityList
                    })
                }else{
                    level2.push(item)
                }
            });
    
            layui.each(val,function (k,v) {
                layui.each(level2,function (m,n) {
                    if(v.name==n.province){
                        val[k]['cityList'].push({
                            name: n.city,
                            code:n.code,
                            areaList:[]
                        });
                    }
                })
            });
            return val;
        }
    }

    Common.prototype.request = function(options, hideAlert) {
        var that = this;
        options = $.extend({}, this.requestDefaultOption, options)
        options.url = this.API_HOST + options.url;
        if(!options.data) options.data = {};
        if(this.getLoginStaffId){
            options.data.loginStaffId = this.getLoginStaffId;
        }
        return $.ajax(options)
            .done(function(res) {
              that.codeMiddleware(res, hideAlert);
            }).fail(function() {
              if(!hideAlert) layui.layer.msg('网络异常，请重试');
            });
    }

    Common.prototype.exportLog = function(options){
        var that = this;
        that.request({
            method: "POST",
            url: "/admin/log/export-log/add",
            data: options
        });
    }

    Common.prototype.codeMiddleware = function(res, hideAlert){
      if(res.code == 0) return;
      if(!hideAlert) layui.layer.msg(res.message);
      if(['4010'].indexOf(res.code) !== -1){
         this.tokenExpired()
      }
    }

    Common.prototype.tokenExpired = function() {
      layui.sessionData('user',null);
      var list = window.top.location.pathname.split('/')
      list[list.length -1] = 'Login/login.html';
      window.top.location.replace(list.join('/'))
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

    /**
     * [getUpdateJSON description]
     * @param  {[object]} before [修改之前的json]
     * @param  {[object]} after  [修改之后的json]
     * @param  {[object]} desc   [对应的中文名]
     * @param  {[array]} del    [不需要处理的参数名]
     * @return {[object]}
              modifyBeforeJson:[{"name":"driverType","value":"2","desc":"司机类型"}]
              modifyAfterJson:[{"name":"driverType","value":"9","desc":"司机类型"}]
       @example
         getUpdateJSON(
         {a:1,b:[1,2,3],b2:[1,2,3],c:{a:1,b:1},c2:{a:1,b:1},d:2,e:3},
         {a:1,b:[2,2,3],b2:[1,2,3],c:{a:2,b:1},c2:{a:1,b:1},d:3,e:4},
         {a:'参数a',b:'参数b',b:'参数b2',c:'参数c',c2:'参数c2',d:'参数d',e:'参数d'},
         ['e'])
     */
    Common.prototype.getUpdateJSON = function(before,after,desc,del) {
      if(!del) del = [];
      var modifyBeforeJson = [], modifyAfterJson = [];
      layui.each(after,function(key,value){
        if(JSON.stringify(value) != JSON.stringify(before[key]) && del.indexOf(key) == -1){
          modifyBeforeJson.push({name:key, value: before[key],desc: desc[key] || key })
          modifyAfterJson.push({name:key, value: value,desc: desc[key] || key })
        }
      })
      return {
        modifyBeforeJson: JSON.stringify(modifyBeforeJson),
        modifyAfterJson: JSON.stringify(modifyAfterJson)
      };
    }

    Common.prototype.getDataPermission = function () {
        var user = layui.sessionData('user');
        var dataPermission = {};
        if(user&&user.dataPermissionDTO){
            dataPermission = user.dataPermissionDTO;
        }
        return dataPermission;
    }

    Common.prototype.getMyPermission = function() {
      var pid = this.urlGet().perssionId,
          user = layui.sessionData('user'),
          permissionList = [];
      if (user) {
        layui.each(user.funcPermissionDTOList ,function(key,value){
          if(value.pid == pid){
            permissionList.push(value.name)
          }
        })
      }
      return permissionList
    }
    Common.prototype.getPermissionIdList = function() {
			var pid = this.urlGet().perssionId,
				user = layui.sessionData('user'),
				permissionList = [];
			if (user) {
				layui.each(user.funcPermissionDTOList ,function(key,value){
					if(value.pid == pid){
						permissionList.push(value.resourceId)
					}
				})
			}
			return permissionList;
    }

    Common.prototype.resetSearch = function (elemId, cb) {
        var initData;
		try {
			initData = JSON.parse(sessionStorage.getItem("tableFilterData")) || {};
		} catch (error) {
			initData = {};
		}
        initData[elemId] = {};
        sessionStorage.setItem("tableFilterData", JSON.stringify(initData));
        cb && cb()
    }
    
    Common.prototype.formatDate = function(date, format) {
        format = format || "yyyy-MM-dd hh:mm:ss";
        var list = {
            "y+": String(date.getFullYear()), //年
            "M+": String(date.getMonth() + 1), //月份 
            "d+": String(date.getDate()), //日 
            "h+": String(date.getHours()), //小时 
            "m+": String(date.getMinutes()), //分 
            "s+": String(date.getSeconds()), //秒 
            "q+": String(Math.floor((date.getMonth() + 3) / 3)), //季度 
            "S": String(date.getMilliseconds()) //毫秒 
    
        };
        Object.keys(list).map(function (key) {
            var reg = new RegExp("(" + key + ")", 'g');
            format = format.replace(reg, function (fmt) {
                if (/y+/.test(fmt)) return list[key].substr(4 - fmt.length);
                return fmt.length == 1 ? list[key] : ("00" + list[key]).substr(list[key].length);
            });
        })
        return format;
    };
    Common.prototype.kcodeToGb = function(kcode){
        var codes = "0123456789abcdefghijkmnpqrstuvwxyz"; 

        function __decode(pch){  
            var v = 0;  
            for (var i = 3; i >= 0; --i)  
                v = v * 34 + (codes.indexOf(pch.charAt(i)));  
            v = v * 250 / 9;  
            return v;  
        }  
        
        function __encode(v) {  
            var pch = "";  
            v = v * 9 / 250;  
            for (var i = 0; i < 4; ++i)  
            {  
                pch += codes.charAt(v % 34);  
                v /= 34;  
            }  
            return pch;  
        }  
        
        function DecodeLon(k) {  
            var lon = __decode(k.substring(1, 5));  
            if (k.charAt(0) == '5' || k.charAt(0) == '8')  
                lon += 35000000;  
            lon += 70000000;  
            return lon/1000000.0;  
        }  
        
        function DecodeLat(k)  {  
            var lat = __decode(k.substring(5, 9));  
            if (k.charAt(0) <= '6')  
                lat += 35000000;  
            lat += 5000000;  
            return lat/1000000.0;  
        }  
        
        function Encode(lat, lon) {  
            lat = parseInt(lat*1000000);  
            lon = parseInt(lon*1000000);  
            var k;  
            lon -= 70000000;  
            lat -= 5000000;  
            if (lat > 35000000)  
                if (lon <= 35000000)  
                    k = "6";  
                else  
                    k = "5";  
            else  
                if (lon <= 35000000)  
                    k = "7";  
                else  
                    k = "8";  
            if (lon > 35000000)  
                lon -= 35000000;  
            if (lat > 35000000)  
                lat -= 35000000;  
            k += __encode(lon);  
            k += __encode(lat);  
            return k;  
        }

        return {
            lat: DecodeLat(kcode).toFixed(5),
            lng: DecodeLon(kcode).toFixed(5)
        }
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
        var current = this.get_current_tab();
        var tab_list = this.get_data();
        for (var i in tab_list) {
            this.add_lay_tab(tab_list[i].title, tab_list[i].url, i);
        }
        if(current) element.tabChange('xbs_tab', current || i);
    };
    /**
     * [end 执行结束要做的]
     * @return {[type]} [description]
     */

    Xadmin.prototype.add_tab = function(title, url, is_refresh, is_force) {
        var id = encodeURIComponent(title).replace(/%/g,'a');
        if(is_force) id = id + new Date().getTime();
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

    Xadmin.prototype.set_current_tab = function(id){
      localStorage.setItem('current_tab',id)
    }

    Xadmin.prototype.get_current_tab = function(){
      return localStorage.getItem('current_tab');
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

    Xadmin.prototype.clear_tab_data = function(id) {
        layui.data('tab_list', null);
        layui.data('cate', null);
        localStorage.setItem('current_tab',null)
    };
    var xadmin = new Xadmin()
    window.xadmin = xadmin

    exports('xadmin', xadmin);
})
