window.firstUpload = true;
layui.use(['layer', 'form', 'laytpl', 'laypage', 'laydate', 'element'], function () {
    var $ = layui.jquery;
    var form = layui.form;
    var layer = layui.layer;
    var laytpl = layui.laytpl;
    var edipao = layui.edipao;
    var laypage = layui.laypage
    var laydate = layui.laydate
    var element = layui.element

    function _routePlan(){
        this.user = JSON.parse(sessionStorage.user);
        this.request = { loginStaffId: this.user.staffId };
        this.lineId =  edipao.urlGet().lineId;
        this.driverReportPoint = [];
        this.pageNumber = 1;
        this.pageSize = 5;
        this.address = '';
        this.loc = {};
        this.line = '';
        this.map = null;
        this.reportMap = null;
        this.trackHandler = null;
        this.topLoadIndex = null;
        this.vias = [];
        this.isHighway = 0;
        this.iframe1 = null;
        this.iframe2 = null;
        this.iframe3 = null;
        this.sourceList = {
            "1": {
                source: 1,
                tab: false,
                chosen: false,
            },
            "2": {
                source: 2,
                tab: false,
                chosen: false,
            },
            "3": {
                source: 3,
                tab: true,
                chosen: false,
            }
        }
    }

    _routePlan.prototype = {
        // 初始化
        init: function(){
            var _t = this;
            _t.renderTabContent();
            _t.bindLineEvents();
            _t.bindFrameEvents();
        },
        bindFrameEvents(){
            var _t = this;
            this.iframe1 = $("#map1").attr("src", "./route-map.html?source=1");
            this.iframe2 = $("#map2").attr("src", "./route-map.html?source=2");;
            this.iframe3 = $("#map3").attr("src", "./route-map.html?source=3");;
            $(window).on("message", function (e) {
                var message = e.originalEvent.data;
                switch(message.type){
                    case "loaded":
                        _t.iframeLoadData(message.source);
                        break;
                }
            });
        },
        iframeLoadData(source){
            var _t = this;
            switch(source * 1){
                case 1:
                    _t.postMessage(_t.iframe1[0].contentWindow, {
                        type: "getDefaultOrderRoute",
                        lineId: _t.lineId,
                    });
                    break;
                case 2:
                    break;
                case 3:
                    _t.postMessage(_t.iframe3[0].contentWindow, {
                        type: "getData",
                        lineId: _t.lineId,
                    });
                    break;
            }
        },
        postMessage(target, message){
            target.postMessage(message);
        },
        renderTabContent(){
            var _t = this;
            var getTabConentTpl = $("#tabConentTpl").html();
            laytpl(getTabConentTpl).render(Object.assign({}, {
                sourceList: _t.sourceList
            }), function(html){
                $("#tabConent").html(html);
                setTimeout(function(){
                    form.render('checkbox'); 
                }, 1000);
            });
        },
        // 获取司机上报数据
        // status 1上报待审2已采纳3取消采纳4已删除
        getDriverReportList: function(){
            var _t = this;
            edipao.request({
                type: 'GET',
                url: '/admin/order/report/getReportByLine',
                data: $.extend({}, _t.request, {
                    page: _t.pageNumber,
                    pageSize: _t.pageSize,
                    lineId: this.lineId
                })
            }).done(function(res) {
                if (res.code == 0) {
                    if(_t.pageNumber == 1){
                        _t.setLayPage(res.data.count);
                    }
                    var getDriverReportTpl = driverReportTpl.innerHTML,
                    reportList = document.getElementById('report-list');
                    laytpl(getDriverReportTpl).render(res.data, function(html){
                        reportList.innerHTML = html;
                    });

                    _t.bindEvents();
                    
                    _t.layer.clear();
                    var style = new Careland.PointStyle({
                      width: 23,
                      height: 29,
                      offsetX: -13,
                      offsetY: -34,
                      textOffsetX: -5,
                      textOffsetY: -30,
                      fontColor: "#FFF",
                      src: location.origin + "/images/map_sign_event.png",
                    });
                    //创建文本标注点
                    for(var report of res.data.reports){
                        var marker = new Careland.Marker('image');
                        marker.setStyle(style); 
                        var point = new Careland.GbPoint(report.lat,report.lng);
                        marker.setPoint(point); 
                        var text = '';
                        if(report.type == 1){
                            text = '限高：'+report.height+ '米';
                        }else if(report.type == 2){
                            text= '限行：'+report.startTime+' - '+report.endTime;
                        }else if(report.type == 3){
                            text= '收费：'+ report.price + '元';
                        }else if(report.type == 4){
                            text= '拆车：'+report.price+ '元';
                        }                                         
                        _t.layer.add(marker); 
                        (function(marker,text,report,point){
                            marker.addEventListener("click", function(){  
                                var opts = {
                                    point: point,
                                    content: text + '<br/>' + report.address,
                                    enableAutoPan: true
                                };
                                var mapInfoWin = new Careland.InfoWindow(opts);        
                                _t.map.openInfoWindow(mapInfoWin, point);//通过核心类接口打开窗口
                            });
                        })(marker,text,report,point)
                        
                    }
                                                               //将标注点添加到图层上
                }
            })
        },
        // 设置分页
        setLayPage: function(total){
            let _t = this;
            laypage.render({
                elem: 'footer-laypage',
                count: total,
                layout: ['count', 'prev', 'page', 'next'],
                limit: _t.pageSize,
                jump: function(obj, first){
                    _t.pageNumber = obj.curr;
                    if(first) return;
                    _t.getDriverReportList();
                }
            });
        },
        
        // 监听司机上报类型的选择 和表单提交
        bindDriverReportType(){
            var _t = this;
            form.on('select(driverReportType)', function(data) {
                _t.driverReportType =  data.value;
                var getAddReportTpl = $("#addReportTpl").html(),
                    addReportDetail = $("#add-report-detail");
                laytpl(getAddReportTpl).render({
                    type: data.value
                }, function(html){
                    addReportDetail.html(html);
                    form.render('select');

                    _t.selectReportAddress();
                    // 时间组件格式化
                    laydate.render({
                        elem: '#startTime',
                        type: 'time',
                        range: true,
                        trigger: 'click'
                    });

                    var ac = new Careland.Autocomplete({
                        input : "seach-location-input",
                        location : _t.map
                    });
                    ac.setLocation(_t.map);
                    ac.setInputForm('seach-location-input');
                    ac.addEventListener("onConfirm",function(e){
                        _t.loc = {
                            name: e.item.poi.name,
                            address: e.item.poi.address,
                            lat: e.item.poi.pointGb.lat,
                            lng: e.item.poi.pointGb.lng,
                            GbPoint: e.item.poi.pointGb
                        }
                        ac.hide();
                    });
                });
            })
        },
        // 清空司机上报弹窗数据和内容
        clearDriverReportDetail(){
        },
        // 提交司机上报数据
        submitDriverReport: function(data){
            var _t = this;
            edipao.request({
                type: 'GET',
                url: '/admin/order/report/report',
                data: $.extend({}, _t.request, {
                    lineId: _t.lineId,
                    'report.lineId': _t.lineId,
                    'report.reporterType': 1,
                    'report.reporterId': this.user.staffId,
                    'report.type': _t.driverReportType,
                    'report.height': !data.height ? '' : data.height,
                    'report.startTime': !data.time ? '' : data.time.split('-')[0],
                    'report.endTime': !data.time ? '' : data.time.split('-')[1],
                    'report.lng': _t.loc.lng,
                    'report.lat': _t.loc.lat,
                    'report.status': 1,
                    'report.address': _t.loc.name,
                    'report.price': !data.price ? '' : data.price,
                    'report.contactName': !data.contactName ? '' : data.contactName,
                    'report.contactPhone': !data.contactPhone ? '' : data.contactPhone
                })
            }).done(function(res) {
                if(res.code == 0){
                    _t.getDriverReportList();
                }
            })
        },
        // 修改数据状态
        updateDriverReportStatus: function(id, status){
            var _t = this;
            edipao.request({
                type: 'GET',
                url: '/admin/order/report/updateStatus',
                data: $.extend({}, _t.request, {
                    id: id,
                    status: status
                })
            }).done(function(res) {
                if(res.code == 0){
                    var txt = '已删除';
                    switch(status){
                        case 4:
                            txt = '已删除';
                            break;
                        case 2:
                            txt = '已采纳';
                            break; 
                        case 1:
                            txt = '取消采纳';
                            break;  
                    }
                    layer.msg(txt, {
                        time: 1500,
                    });
                    _t.getDriverReportList();
                }
            })
        },
        getOrderListByLineId(){
            var _t = this,layerIndex;
            edipao.request({
                type: 'GET',
                url: '/admin/line/getOrderListByLineId',
                data: {
                    lineId: _t.lineId,
                }
            }).then(function(res){
                if(res.code == 0){
                    var orderListTplStr = orderListTpl.innerHTML;
                    laytpl(orderListTplStr).render(res.data, function(html){
                        $("#select-order-dialog").html(html);
                        $('.order-select').off('click').on('click', function(e){
                            _t.getOrderLineTrack($(this).data('no'))
                            layer.close(layerIndex)
                        })
                    });
                    layerIndex = layer.open({
                        type: 1,
                        title: "选择订单",
                        area: ['450px', '530px'],
                        content:$("#select-order-dialog"),
                        btn: ['关闭'],
                        btnAlign: 'c',
                        zIndex:9990, //层优先级
                        shadeClose: true,
                    })
                }
            })
            
        },
        getOrderLineTrack(orderNo){
            var _t = this, source = 1;
            _t.postMessage(_t["iframe" + source][0].contentWindow, {
                type: "orderLine",
                orderNo: orderNo
            });
        },
        getTab(){
            var tab = 0, _t = this;
            Object.keys(this.sourceList).some(function (item) {
                item = _t.sourceList[item];
                tab = item.source;
                return item.tab;
            });
            return tab;
        },
        getChosen(){
            var chosen = 0, _t = this;
            Object.keys(this.sourceList).some(function (item) {
                item = _t.sourceList[item];
                chosen = item.source;
                return item.chosen;
            });
            return chosen;
        },
        // 绑定tab事件
        bindLineEvents: function(){
            var _t = this;
            element.on('tab(docDemoTabBrief)', function(){
                let source = this.getAttribute('lay-id') + "";
                _t.setTabSource(source);
                changeMap(source);
                function changeMap(source) {
                    $("#map" + source).removeClass("map-hide").addClass("map-show").siblings(".map-content").removeClass("map-show").addClass("map-hide");
                }
            });
            element.on('tab(reportTabFilter)', function (e) {
                if(e.index == 1){
                    $("#add-report").removeClass("hide");
                }else{
                    $("#add-report").addClass("hide");
                }
            });
            form.on('switch(policy)', function(data){
                if(data.elem.checked){
                    _t.postMessage(_t.iframe3[0].contentWindow, {
                        type: "policy",
                        isHighway: 1,
                    });
                }else{
                    _t.postMessage(_t.iframe3[0].contentWindow, {
                        type: "policy",
                        isHighway: 0,
                    });
                }
            });
            
            $('#tabConent').on('click','.rebuild-btn',function() {
                var tab = _t.getTab();
                _t.postMessage(_t["iframe" + tab][0].contentWindow, {
                    type: "rebuild"
                });
            });
            $('#tabConent').on('click','.order-choose',function() {
                _t.getOrderListByLineId();
            });
            $("#tabConent").on("click", ".choose-btn",function (e) {
                var source = e.target.dataset.source + "";
                switch(source * 1){
                    case 1:
                        if(_t.lineDetail.lineSource != 1){
                            layer.msg("请先选择订单");
                            return;
                        }
                        break;
                        case 2:
                            break;
                    case 3:
                        _t.postMessage(_t["iframe" + source][0].contentWindow, {
                            type: "choose",
                        });
                        _t.setChosenSource(source);
                        _t.renderTabContent();
                        break;
                }
            });
            $('#tabConent').on('click','.playLine',function(e){
                var source = _t.getTab();
                _t.postMessage(_t["iframe" + source][0].contentWindow, {
                    type: "playLine"
                });
            })
        },
        setChosenSource: function (source) {
            var _t = this;
            source = source + "";
            _t.sourceList["1"]["chosen"] = false;
            _t.sourceList["2"]["chosen"] = false;
            _t.sourceList["3"]["chosen"] = false;
            _t.sourceList[source]["chosen"] = true;
        },
        setTabSource: function (source) {
            var _t = this;
            source = source + "";
            _t.sourceList["1"]["tab"] = false;
            _t.sourceList["2"]["tab"] = false;
            _t.sourceList["3"]["tab"] = false;
            _t.sourceList[source]["tab"] = true;
        },
        // 绑定司机上报页面事件
        bindEvents: function(){
            var _t = this;
            $('#add-report').off('click').on('click', function(){
                layer.open({
                    type: 1,
                    title: "司机上报",
                    area: ['450px', '530px'],
                    content: $("#driver-report-dialog"),
                    btn: ['取消', '确定'],
                    btnAlign: 'c',
                    zIndex:9990, //层优先级
                    end: function () {
                        $("#add-report-detail").html("");
                        $("#select-map").html();
                        form.val("report-form", { //formTest 即 class="layui-form" 所在元素属性 lay-filter="" 对应的值
                            "driverReportType": ""
                        });
                    },
                    shadeClose: true,
                    btn2: function(){
                        var formData = form.val('report-form');
                        _t.submitDriverReport(formData);
                    },
                    success: function () {
                        _t.bindDriverReportType();
                    }
                })
            })

            $('.it-del').off('click').on('click', function(e){
                _t.updateDriverReportStatus($(this).data('id'), 4);
            })

            $('.take-report').off('click').on('click', function(e){
                _t.updateDriverReportStatus($(this).data('id'), 2);
            })

            $('.cancel-take-report').off('click').on('click', function(e){
                _t.updateDriverReportStatus($(this).data('id'), 3);
            })

            // $('#seach-location-input').

        },
        // 选择上报点地址
        selectReportAddress: function(){
            var _t = this;
            $('#selectMapLocation').off('click').on('click', function(){
                layer.open({
                    type: 1,
                    title: "选择位置",
                    area: ['900px', '600px'],
                    content: $("#map"),
                    btn: ['取消', '确定'],
                    btnAlign: 'c',
                    zIndex:9991, //层优先级
                    cancel: function () {
                        _t.loc = {};
                        _t.map.closeInfoWindow();
                        _t.map.removeEventListener("click");
                    },
                    end: function () {
                        _t.map.closeInfoWindow();
                        _t.map.removeEventListener("click");
                    },
                    btn2: function(){
                        if(!$('#seachLocation').val()){
                            layer.msg("请选择地址");
                            return false;
                        }
                        if(_t.loc){
                            _t.map.closeInfoWindow();
                            _t.map.removeEventListener("click");
                            $('#seach-location-input').val(_t.loc.name);
                        }
                    },
                    success: function () {
                        _t.regionMapView();
                    }
                })
            })
        },
        // 获取点击点的坐标数据
        regionMapView(){
            var _t = this;
            var map = _t.map;

            var myGeo = new Careland.Geocoder();

            var layer = new Careland.Layer('point', 'layer');
            var style = new Careland.PointStyle({offsetX:-11,offsetY:-30,textOffsetX:-5,textOffsetY:-30,src:location.origin+'/images/center.png',fontColor:'#000'});
            layer.setStyle(style);
            map.addLayer(layer);

            var mapInfoWin = new Careland.InfoWindow();
            mapInfoWin.setOffset(new Careland.Size(0, -22));

            var ac = new Careland.Autocomplete({
                input : "seachLocation",
                location : map
            });
            ac.setLocation(map);
            ac.setInputForm('seachLocation');
            ac.addEventListener("onConfirm",function(e){
                mapInfoWin.close();
                $('#select-address').text(e.item.poi.name);
                mapInfoWin.setContent('当前地址：' + e.item.poi.name);
                mapInfoWin.redraw();
                layer.clear();
                //创建文本标注点
                var marker = new Careland.Marker('image');
                marker.setPoint(e.item.poi.point);
                layer.add(marker);
                marker.openInfoWindow(mapInfoWin);
                _t.loc = {
                    name: e.item.poi.name,
                    address: e.item.poi.address,
                    lat: e.item.poi.pointGb.lat,
                    lng: e.item.poi.pointGb.lng,
                }
                map.centerAndZoom(e.item.poi.point, 15);
            });

            $('#regionMapPoint').off('click').on('click', function(){
                var searchTxt = $('#seachLocation').val();
                var poiSearch = new Careland.LocalSearch(map,{
                    map: map,
                    selectFirstResult:false,
                    autoViewport:true,
                    onMarkersSet: function(pois){
                        layui.each(pois, function(v, k){
                            var marker = k.marker;
                            marker.addEventListener('click', function(e){
                                e.event.defaultPrevented = true;
                                layer.clear();
                                myGeo.getLocation(e.point,function(data){
                                    
                                    _t.setViewData(mapInfoWin, marker, data)
                                });
                            })
                        })
                    },
                });
                poiSearch.search(searchTxt);
            })

            	
            map.addEventListener('click', function(point){
                var point = point;
                if(!point || typeof (point) != "object"){
                    return;
                }
                myGeo.getLocation(point,function(data){
                    layer.clear();
                    //创建文本标注点
                    var marker = new Careland.Marker('image');
                    marker.setPoint(point);
                    layer.add(marker);

                    _t.setViewData(mapInfoWin, marker, data);
                });
                
            });

        },
        // 设置视图显示和数据
        setViewData: function(mapInfoWin, marker, data){
            $('#seachLocation').val(data.address);
            $('#select-address').text(data.address);
            mapInfoWin.setContent('当前地址：' + data.address);
            mapInfoWin.redraw();
            marker.openInfoWindow(mapInfoWin);
            this.loc = {
                name: data.address,
                address: data.address,
                lat: edipao.kcodeToGb(data.kcode).lat,
                lng: edipao.kcodeToGb(data.kcode).lng,
                GbPoint: {
                    lat: edipao.kcodeToGb(data.kcode).lat,
                    lng: edipao.kcodeToGb(data.kcode).lng,
                }
            }
        }

    }
    
    var routePlan = new _routePlan();
    routePlan.init();
});




