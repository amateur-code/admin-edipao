layui.config({
base: '../lib/'
}).extend({
excel: 'layui_exts/excel.min',
tableFilter: 'TableFilter/tableFilter'
}).use(['jquery', 'table','layer','excel','tableFilter','form', 'upload', 'laytpl', 'laypage', 'laydate', 'element'], function () {
    var table = layui.table;
    var $ = layui.jquery;
    var form = layui.form;
    var layer = layui.layer;
    var upload = layui.upload;
    var laytpl = layui.laytpl;
    var edipao = layui.edipao;
    var excel = layui.excel;
    var laypage = layui.laypage
    var laydate = layui.laydate
    var element = layui.element

    function OrderLine(){
        this.user = JSON.parse(sessionStorage.user);
        this.orderNo =  edipao.urlGet().orderNo;
        this.orderId = edipao.urlGet().orderId;
        this.line = [];
        this.map = null;
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
                    "map" : map,
                    "policy" : CLDMAP_DRIVING_POLICY_NO_HIGHWAYS,
                    "multi":1,
                    viaStyle:true
                }); 
                this.trackHandler = new Careland.Track()
               
            } catch (err){
                console.log(err)
            }

            edipao.request({
                url: "/admin/order/detail",
                method: "GET",
                data: {
                  id: this.orderId
                }
            }).then(res=>{
                if(res.code == 0){
                    if(res.data.orderStatus == 3){
                        this.getCarCurrent();
                    }
                }
            })

            this.getOrderLineTrack();
            this.getOrderGuideTrack();
            this.bindEvents();
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
                data:{
                    lineId: lineId
                }
            }).done(function(res) {
                if (res.code == 0) {
                    _t.guideLine = JSON.parse(res.data.trackContent);
                    _t.addGuideLine = new Careland.Layer('polyline', 'addGuideLine');  
                    _t.map.addLayer(_t.addGuideLine);
                    _t.showGuideLine();
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
            polyline.setStyle(new Careland.LineStyle({color:'red',size:5,opacity:100}));      
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
                }else{
                    _t.renderDrivingRoute();
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

        // 设置地图导航
        renderDrivingRoute(){   
            var _t = this;
            var trackInfo = []
            for(var point of _t.line){
                trackInfo.push(Careland.DrawTool.GbPointToKldPoint(point.lng,point.lat))
            }
            _t.map.setCenter(trackInfo[0])
            var polyline = new Careland.Polyline();
            polyline.setPoints(trackInfo);  
            polyline.setStyle(new Careland.LineStyle({color:'blue',size:5,opacity:100}));      
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
                    linestyles[linestyles.length] = new Careland.LineStyle({color:getColor(),selectedColor:getColor(),size:6,selectedSize:6,opacity:50});
                }
                var l = data[d].length;
                data[d][l] = {};
                data[d][l].Text = {value:_t.line[i].locTime,textOffsetX:-100,textOffsetY:-40,fontSize:15,fontColor:'#e91e63',fontBold:true,textWidth:200,textAlign:'center'};
                data[d][l].Point = new Careland.GbPoint( _t.line[i].lat,_t.line[i].lng);
                data[d][l].IconType = CLDMAP_TRACK_ICON_TRUCK;
            }

            function getColor(){    
                var c = ['#FF0000','#FAFAD2','#F08080','#EECFA1','#CD6090','#BDBDBD','#999999','#8B2252','#551A8B','#242424','#00FFFF','#EEEE00'];
                rand = random(0, 12)
                return c[rand]
            }

            function random(lower, upper) {
                return Math.floor(Math.random() * (upper - lower)) + lower;
            }

            this.trackHandler.clear();
            this.trackHandler.setDefaultStyles({trackLineStyles:linestyles})
            this.trackHandler.init(data);
            this.trackHandler.setSpeed(speed);
        },
        // 根据轨迹回放
        paintLine: function(){
            var trackHandler = new Careland.Track();
            trackHandler.clear();
            trackHandler.setLoop(false); //是否播放结束继续播放
            trackHandler.isShowPoint = false; 
            trackHandler.isShowline = true;
            trackHandler.isShowPointTip = true;
            trackHandler.isShowPointText = false;
            trackHandler.setDefaultStyles({trackLineStyles:linestyles})
            var trackOrderCache = trackHandler.init(data);
            trackHandler.setSpeed(speed);
            trackHandler.addEventListener('onPlay', function (index) {
                var count = trackHandler.getCount();
            });
            trackHandler.start();//开始
        }

    }
    
    var orderLine = new OrderLine();
    orderLine.init();

});




