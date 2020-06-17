window.firstUpload = true;
layui.use(['jquery', 'layer', 'form', 'laytpl', 'laypage', 'laydate', 'element'], function () {
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
        this.topLoadIndex = null;
        this.vias = [];
    }


    _routePlan.prototype = {
        // 初始化
        init: function(){
            var _t = this;
            this.topLoadIndex = layer.load(1);
            try{
                //凯立德地图API功能
                var point = new Careland.Point(419364916, 143908009);    //创建坐标点
                var map = new Careland.Map('map', point, 12);             //实例化地图对象
                map.enableAutoResize();                                 //启用自动适应容器尺寸变化
                map.load();
                this.map = map;
                this.Driving = new Careland.DrivingRoute(map, {
                    "map" : map,
                    "policy" : CLDMAP_DRIVING_POLICY_PRIORITY_HIGHWAYS,
                    "multi":1,
                    viaStyle:true,
                    "autoDragging" : true,
                    onSearchComplete : function(obj){
                        if(firstUpload) return firstUpload = false;
                        _t.lineSelectCallback(obj);
                    }
                }); 
                _t.layer = new Careland.Layer('point', 'layer');        //创建点图层
                _t.map.addLayer(_t.layer);
            } catch (err){
                console.log(err)
            }

            this.getDriverReportList();
            this.getlineOrderData();
        },
        // 获取线路数据
        getlineOrderData(){
            var _t = this;
            edipao.request({
                type: 'GET',
                url: '/admin/line/detail',
                data: $.extend({}, _t.request, {
                    lineId: this.lineId
                })
            }).done(function(res) {
                layer.close(_t.topLoadIndex);
                if (res.code == 0) {
                    _t.lineDetail = res.data
                    try {
                        if(_t.lineDetail.wayPointJson) _t.vias = JSON.parse(_t.lineDetail.wayPointJson);
                        _t.lineDetail.trackContent = JSON.parse(_t.lineDetail.trackContent);
                        _t.line = _t.lineDetail.trackContent;
                    } catch (error) {}
                    _t.renderTabContent();
                    _t.renderDrivingRoute();

                    _t.bindLineEvents();
                }
            }).fail(function () { 
                layer.close(_t.topLoadIndex);
             });
        },
        renderTabContent(){
            var _t = this;
            var getTabConentTpl = tabConentTpl.innerHTML,
                tabConent = document.getElementById('tabConent');
            laytpl(getTabConentTpl).render(_t.lineDetail, function(html){
                tabConent.innerHTML = html;

                setTimeout(function(){
                    form.render('checkbox'); 
                },1000)
                
            });
        },
        // 设置地图导航
        renderDrivingRoute(policy){
            var _t = this;         
            var trackInfo = [];
            if(Array.isArray(_t.line)){
                for(var point of _t.line){
                    trackInfo.push(Careland.DrawTool.GbPointToKldPoint(point.lng,point.lat))
                }
            }
            var start = trackInfo[0];
            var end = trackInfo[trackInfo.length - 1];
            if(policy){
                var vias = [start, end].concat(_t.vias);
                vias = vias.map(function (item) {
                    return (Careland.DrawTool.GbPointToKldPoint(item.lat, item.lng));
                });
                _t.Driving.search(start, end, {trackInfo:[], via: vias})
            }else if(trackInfo.length > 0){
                var vias = _t.vias;
                vias = vias.map(function (item) {
                    return (Careland.DrawTool.GbPointToKldPoint(item.lat, item.lng));
                });
                _t.map.setCenter(start)
                _t.Driving.search(start, end,{trackInfo: trackInfo, via: vias})
            }else{
                var vias = _t.vias;
                vias = vias.map(function (item) {
                    return (Careland.DrawTool.GbPointToKldPoint(item.lat, item.lng));
                });
                _t.Driving.search(_t.lineDetail.startAddress,_t.lineDetail.endAddress, {trackInfo:[], via: vias});
            }
        },
        // 路线选择回掉
        lineSelectCallback(obj){
            var _t = this, pointData =[];
            var plan = obj.getPlan(0);
            for(var i in plan.uidinfo){
                for(var j in plan.uidinfo[i].shapepoint){
                    let gbPoint = Careland.DrawTool.KldPointToGbPoint(plan.uidinfo[i].shapepoint[j].x,plan.uidinfo[i].shapepoint[j].y);
                    pointData.push({lng:gbPoint.lng,lat:gbPoint.lat});
                }
            }
            _t.line = pointData;
            _t.Driving.getDrivingRouteData(function(res){
                var blob = new Blob([res], {
                    type: "application/octet-stream"
                });
                let formData = new FormData()
                formData.append('file', blob)
                formData.append('loginStaffId',edipao.getLoginStaffId())
                $.ajax({
                    type: 'POST',
                    url: edipao.API_HOST +  '/admin/lineTrack/upload/routeFile', 
                    data: formData,
                    processData : false,
                    contentType : false,
                }).done(function(res){
                    if(res.code == 0){
                        edipao.request({
                            type: 'POST',
                            url: '/admin/lineTrack/updateLineTrack',
                            data: {
                                lineId:  _t.lineId,
                                lineSource:  _t.lineDetail.lineSource,
                                trackUrl: res.data.url,
                                trackContent: JSON.stringify(pointData)
                            }
                        }).then(function(res){
                            if(res.code == 0){
                                _t.line = pointData
                            }
                        })
                    }
                })
            });
        },
        // 根据轨迹回放
        paintLine: function(){
            var _t = this;
            //启用地图平移缩放控件(骨架)
            var control = new Careland.Navigation();
            control.anchor = CLDMAP_ANCHOR_TOP_RIGHT;					//设置位置为右上角
            control.offset = new Careland.Size(10, 30);					//设置位置偏移
            _t.map.addMapControl(control);

            //启用比例尺
            var scale = new Careland.Scale();
            scale.anchor = CLDMAP_ANCHOR_BOTTOM_LEFT;					//设置位置为左下角
            scale.offset = new Careland.Size(10, 5);					//设置位置偏移
            _t.map.addMapControl(scale);
            
            var data = []; //整理之后的轨迹点
            var speed = 30; //速度
            let d = -1; //每100个切割一段轨迹 
            var linestyles = [];
            for(var i in _t.line){
                if(i%100 == 0){//每100个切割一段轨迹，
                    d++;
                    data[d] = [];
                    linestyles[linestyles.length] = new Careland.LineStyle({color:getColor(),selectedColor:getColor(),size:6,selectedSize:6,opacity:50});
                }
                var l = data[d].length;
                data[d][l] = {};
                data[d][l].Point = new Careland.GbPoint( _t.line[i].lat,_t.line[i].lng);
                data[d][l].IconType = CLDMAP_TRACK_ICON_TRUCK;
            }
            var trackHandler = new Careland.Track();
            trackHandler.clear();
            trackHandler.setLoop(false); //是否播放结束继续播放
            trackHandler.isShowPoint = false; 
            trackHandler.isShowline = true;
            trackHandler.isShowPointTip = true;
            trackHandler.isShowPointText = false;
            trackHandler.setDefaultStyles({trackLineStyles:linestyles})
            trackHandler.setSpeed(speed);
            trackHandler.addEventListener('onPlay', function (index) {
                var count = trackHandler.getCount();
            });
            trackHandler.start();//开始
            
            function getColor(){    
                var c = ['#FF0000','#FAFAD2','#F08080','#EECFA1','#CD6090','#BDBDBD','#999999','#8B2252','#551A8B','#242424','#00FFFF','#EEEE00'];
                rand = random(0, 12)
                return c[rand]
            }

            function random(lower, upper) {
                return Math.floor(Math.random() * (upper - lower)) + lower;
            }
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
                      src: location.origin + "/images/map_sign_pass.png",
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
            form.on('select(driverReportType)', function(data){
                _t.driverReportType =  data.value;
                var getAddReportTpl = addReportTpl.innerHTML,
                    addReportDetail = document.getElementById('add-report-detail');
                laytpl(getAddReportTpl).render({
                    type: data.value
                }, function(html){
                    addReportDetail.innerHTML = html;
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
            var _t = this;
            edipao.request({
                type: 'GET',
                url: '/admin/lineTrack/getOrderTrack',
                data: {
                    orderNo: orderNo,
                }
            }).then(function(res){
                if(res.code == 0){
                    _t.lineDetail.orderNo = orderNo;
                    _t.lineDetail.lineSource = 1;
                    _t.line = res.data;
                    _t.renderTabContent();
                    _t.renderDrivingRoute();
                }
            })
        },
        // 绑定tab事件
        bindLineEvents: function(){
            var _t = this;
            element.on('tab(docDemoTabBrief)', function(data){
                let source = this.getAttribute('lay-id');
                if(source == 1){
                     // _t.lineDetail.lineSource = 1;
                    // _t.getOrderListByLineId()
                    // _t.getOrderLineTrack('OR00001414')
                }else if(source == 2){

                }else if(source == 3){
                    // _t.lineDetail.lineSource = 3;
                }
            });

            form.on('switch(policy)', function(data){
                if(data.elem.checked){
                    console.log("走高速")
                    _t.Driving.setPolicy(CLDMAP_DRIVING_POLICY_PRIORITY_HIGHWAYS)
                }else{
                    console.log("不走高速")
                    _t.Driving.setPolicy(CLDMAP_DRIVING_POLICY_NO_HIGHWAYS)
                }
                _t.renderDrivingRoute(true)
            });  

            $('#tabConent').on('click','.order-choose',function(e){
                _t.getOrderListByLineId()
            })
            $("#tabConent").on("click", ".choose-btn",function (e) {
                var source = e.target.dataset.source * 1;
                switch(source){
                    case 1:
                        if(_t.lineDetail.lineSource != 1){
                            layer.msg("请先选择订单");
                            return;
                        }
                        break;
                        case 2:
                            break;
                    case 3:
                        _t.lineDetail.lineSource = source;
                        _t.line = _t.lineDetail.trackContent;
                        _t.renderDrivingRoute();
                        _t.renderTabContent();
                        break;
                }
            });
            $('#tabConent').on('click','.playLine',function(e){
                if(!_t.line) return;
                _t.paintLine();
            })
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
                        document.getElementById('add-report-detail').innerHTML = '';
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
                    content: $("#select-map-dialog"),
                    btn: ['取消', '确定'],
                    btnAlign: 'c',
                    zIndex:9991, //层优先级
                    cancel: function () {
                        _t.loc = {};
                    },
                    btn2: function(){
                        if(!$('#seachLocation').val()){
                            layer.msg("请选择地址");
                            return false;
                        }
                        if(_t.loc){
                            $('#seach-location-input').val(_t.loc.name);
                        }
                    },
                    success: function () {
                        //凯立德地图API功能
                        var point = new Careland.Point(419364916, 143908009);
                        var map = new Careland.Map('select-map', point, 15); 
                        map.enableAutoResize();      
                        map.load(); 

                        _t.regionMapView(map);
                    }
                })
            })
        },
        // 获取点击点的坐标数据
        regionMapView(map){
            var _t = this;

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




