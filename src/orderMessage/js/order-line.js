layui.use(['jquery','layer'], function () {
    var $ = layui.jquery;
    var layer = layui.layer;
    var edipao = layui.edipao;

    function OrderLine(){
        this.orderNo =  edipao.urlGet().orderNo;
        this.orderId = edipao.urlGet().orderId;
        this.line = [];
        this.map = null;
        this.guideLine = null;//规划的路径
        this.line = null;//实际的路线
    }

    OrderLine.prototype = {
        // 初始化
        init: function(){
            var _t = this;
            try{
                //凯立德地图API功能
                var point = new Careland.Point(419364916, 143908009);    //创建坐标点
                var map = new Careland.Map('map', point, 12);             //实例化地图对象
                map.enableAutoResize();                                 //启用自动适应容器尺寸变化
                map.load();
                this.map = map;
                this.Driving = new Careland.DrivingRoute(map, {
                    "map": map,
                    "policy": CLDMAP_DRIVING_POLICY_NO_HIGHWAYS,
                    "multi": 1,
                    viaStyle: true
                }); 
                this.trackHandler = new Careland.Track();
                this.layer = new Careland.Layer('point', 'layer');        //创建点图层
                this.map.addLayer(_t.layer);
            } catch (err){
                console.log(err)
            }

            this.getOrderDetail().then(res=>{
                if(res.code == 0){
                    if(res.data.orderStatus == 3){
                        this.getCarCurrent();
                    }
                }
            });
            this.getOrderLineTrack();
            this.getOrderGuideTrack();
            this.bindEvents();
        },
        getOrderDetail(){
            return edipao.request({
                url: "/admin/order/detail",
                method: "GET",
                data: {
                  id: this.orderId
                }
            })
        },
        getOrderGuideTrack(){
            var _t = this;
            edipao.request({
                type: 'GET',
                url: '/admin/lineTrack/getLineRouteByOrderNo',
                data: {
                    orderNo: this.orderNo,
                }
            }).then(res=>{
                if(res.code == 0){
                    if(!res.data.lineId) return layer.msg('订单暂无导航');
                    _t.getLineTrack(res.data.lineId);
                }
            })
                
        },
        getLineTrack(lineId){
            var _t = this;
            edipao.request({
                type: 'GET',
                url: '/admin/line/detail',
                timeout: 60000,
                data: {
                    lineId: lineId
                }
            }).done(function(res) {
                if (res.code == 0) {
                    _t.guideLine = JSON.parse(res.data.trackContent);
                    _t.guideDetail = res.data;
                    _t.addGuideLine = new Careland.Layer('polyline', 'addGuideLine');
                    _t.map.addLayer(_t.addGuideLine);
                    _t.showGuideLine();
                    _t.getDriverReportList(lineId, res.data.lineSource);
                }
            })
        },
        getDriverReportList(lineId, lineSource){
            var _t = this;
            edipao.request({
                type: 'GET',
                url: '/admin/order/report/getReportByLine',
                data: {
                    page: 1,
                    pageSize: 5,
                    lineId: lineId,
                    lineSource: lineSource,
                }
            }).done(function(res) {
                if (res.code == 0) {
                    if(_t.pageNumber == 1){
                        _t.setLayPage(res.data.count);
                    }
                    _t.layer.clear();
                    var vias = [];
                    var trimPoints = [];
                    var baseStyle = {
                      width: 23,
                      height: 29,
                      offsetX: -13,
                      offsetY: -34,
                      textOffsetX: -5,
                      textOffsetY: -30,
                      fontColor: "#FFF",
                    }
                    var style = new Careland.PointStyle(Object.assign({}, baseStyle, {
                        src: location.origin + "/images/map_sign_event.png",
                    }));
                    var startStyle = new Careland.PointStyle(Object.assign({}, baseStyle, {
                        src: location.origin + "/images/map_sign_start.png",
                    }));
                    var endStyle = new Careland.PointStyle(Object.assign({}, baseStyle, {
                        src: location.origin + "/images/map_sign_end.png",
                    }));
                    var viaStyle = new Careland.PointStyle(Object.assign({}, baseStyle, {
                        src: location.origin + "/images/map_sign_pass.png",
                    }));
                    //创建文本标注点
                    try {
                        vias = JSON.parse(_t.guideDetail.wayPointJson);
                    } catch (error) {}
                    try {
                        trimPoints = JSON.parse(_t.guideDetail.trimPoints);
                    } catch (error) {}
                    vias.forEach(function (item) {
                        res.data.reports.push({
                            lat: item.lat,
                            lng: item.lng,
                            type: "via",
                        });
                    });
                    trimPoints.forEach(function (item) {
                        res.data.reports.push({
                            lat: item.lat,
                            lng: item.lng,
                            type: "via",
                        });
                    });
                    res.data.reports.push({
                        lat: _t.guideLine[0].lat,
                        lng: _t.guideLine[0].lng,
                        address: _t.guideDetail.startAddress,
                        type: "start",
                    });
                    res.data.reports.push({
                        lat: _t.guideLine[_t.guideLine.length - 1].lat,
                        lng: _t.guideLine[_t.guideLine.length - 1].lng,
                        address: _t.guideDetail.endAddress,
                        type: "end",
                    });
                    for(var report of res.data.reports){
                        var marker = new Careland.Marker('image');
                        if(report.type == "start"){
                            marker.setStyle(startStyle);
                        }else if(report.type == "end"){
                            marker.setStyle(endStyle);
                        }else if(report.type == "via"){
                            marker.setStyle(viaStyle);
                        }else{
                            marker.setStyle(style);
                        }
                        var point = new Careland.GbPoint(report.lat, report.lng);
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
                        }else if(report.type == 5){
                            text= '加油站：'+report.price+ '元';
                        }
                        _t.layer.add(marker);
                        (function(marker, text, report, point){
                            if(report.type == "via") return;
                            marker.addEventListener("click", function(){  
                                var opts = {
                                    point: point,
                                    content: (text ? text + '</br>' : text) + report.address,
                                    enableAutoPan: true
                                };
                                var mapInfoWin = new Careland.InfoWindow(opts);
                                _t.map.openInfoWindow(mapInfoWin, point);//通过核心类接口打开窗口
                            });
                        })(marker, text, report, point);
                    }
                }
            })
        },

        showGuideLine(){
            var _t = this;
            if(!Array.isArray(_t.guideLine)) return;
            var trackInfo = []
            for(var point of _t.guideLine){
                trackInfo.push(Careland.DrawTool.GbPointToKldPoint(point.lng,point.lat))
            }
            _t.map.setCenter(trackInfo[0])
            var polyline = new Careland.Polyline();
            polyline.setPoints(trackInfo);  
            polyline.setStyle(new Careland.LineStyle({color:'rgb(105, 170, 0)',size:5,opacity:100}));      
            _t.addGuideLine.add(polyline); 
        },

        getOrderLineTrack(){
            var _t = this;
            edipao.request({
                type: 'GET',
                url: '/admin/lineTrack/getOrderTrack',
                data: {
                    orderNo: this.orderNo,
                }
            }).then(res=>{
                if(res.code == 0){
                    if(res.data.length == 0) return layer.msg('订单暂无轨迹');
                   _t.line = res.data;
                   _t.addOrderLine = new Careland.Layer('polyline', 'addOrderLine');  
                    _t.map.addLayer(_t.addOrderLine );
                   _t.renderDrivingRoute();
                   _t.addTrackPoints()
                }
            })
        },

        getCarCurrent(){
            var _t = this;
            edipao.request({
                type: 'POST',
                url: '/admin/order/getCurLoc',
                data: {
                    orderNo: this.orderNo,
                }
            }).then(res=>{
                if(res.code == 0 && res.data){
                   
                }
            })
        },
        bindEvents(){
            var _t = this;
            $('#speed').on('click','.speed',function(e){
                var speed = $(e.target).data('speed')
                _t.trackHandler.setSpeed(speed);
                $('#speed').find('.speed').addClass('layui-btn-primary');
                $(e.target).removeClass('layui-btn-primary');
            })

            $('.play').on('click',function(){
                _t.trackHandler.play()
            })

            $('.pause').on('click',function(){
                _t.trackHandler.pause()
            })

            $('.go').on('click',function(){
                _t.trackHandler.go()
            })

            $('.stop').on('click',function(){
                _t.trackHandler.stop()
            })

            $('.hideLine').on('click',function(e){
                let text = $(e.target).text();
                if(text == '隐藏订单路线'){
                    $(e.target).text('展示订单路线');
                    _t.addOrderLine.clear();
                    _t.trackHandler.hide();
                }else{
                    _t.renderDrivingRoute();
                    _t.trackHandler.show();
                    $(e.target).text('隐藏订单路线');
                }
            })

            $('.hideGuid').on('click',function(e){
                let text = $(e.target).text();
                if(text == '隐藏指引路线'){
                    $(e.target).text('展示指引路线');
                    _t.addGuideLine.clear();
                }else{
                    _t.showGuideLine();
                    $(e.target).text('隐藏指引路线');
                }
            })
        },

        // 真实路径
        renderDrivingRoute(){
            var _t = this;
            var trackInfo = []
            for(var point of _t.line){
                trackInfo.push(Careland.DrawTool.GbPointToKldPoint(point.lng,point.lat))
            }
            _t.map.setCenter(trackInfo[0])
            var polyline = new Careland.Polyline();
            polyline.setPoints(trackInfo);  
            polyline.setStyle(new Careland.LineStyle({color:'rgb(17, 140, 255)',size:5,opacity:100}));      
            _t.addOrderLine.add(polyline); 
        },

        addTrackPoints: function(){
            var _t = this;
            //启用地图平移缩放控件(骨架)
            var control = new Careland.Navigation();
            control.anchor = CLDMAP_ANCHOR_TOP_RIGHT;                    //设置位置为右上角
            control.offset = new Careland.Size(10, 30);                    //设置位置偏移
            _t.map.addMapControl(control);

            //启用比例尺
            var scale = new Careland.Scale();
            scale.anchor = CLDMAP_ANCHOR_BOTTOM_LEFT;                    //设置位置为左下角
            scale.offset = new Careland.Size(10, 5);                    //设置位置偏移
            _t.map.addMapControl(scale);
            
            var data = []; //整理之后的轨迹点
            var speed = 30; //速度
            let d = -1; //每100个切割一段轨迹 
            var linestyles = [];
            for(var i in _t.line){
                if(i%100 == 0){//每100个切割一段轨迹，
                    d++;
                    data[d] = [];
                    linestyles[linestyles.length] = new Careland.LineStyle({color:"rgb(17, 140, 255)",selectedColor:getColor(),size:6,selectedSize:6,opacity:100});
                }
                var l = data[d].length;
                data[d][l] = {};
                data[d][l].Text = {value:_t.line[i].locTime,textOffsetX:-100,textOffsetY:-40,fontSize:15,fontColor:'#e91e63',fontBold:true,textWidth:200,textAlign:'center'};
                data[d][l].Point = new Careland.GbPoint( _t.line[i].lat,_t.line[i].lng);
                data[d][l].Icon = {
                    src: location.origin + "/images/truck.png",
                    offsetY: -22,
                    offsetX: -10
                };
            }

            function getColor(){
                var c = ['#FF0000','#FAFAD2','#F08080','#EECFA1','#CD6090','#BDBDBD','#999999','#8B2252','#551A8B','#242424','#00FFFF','#EEEE00'];
                rand = random(0, 12)
                return c[rand]
            }

            function random(lower, upper) {
                return Math.floor(Math.random() * (upper - lower)) + lower;
            }
            this.trackHandler.isShowPoint = false; 
            // this.trackHandler.setIconType(CLDMAP_TRACK_ICON_TRUCK);
            this.trackHandler.clear();
            this.trackHandler.setDefaultStyles({trackLineStyles:linestyles});
            this.trackHandler.init(data);
            this.trackHandler.setSpeed(speed);
        },
    }
    
    var orderLine = new OrderLine();
    orderLine.init();

});




