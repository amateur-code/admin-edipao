layui.use(['layer'], function (layer) {
  var edipao = layui.edipao;
  function Rm() {
    this.id = "";
    this.currentLine = null;
    this.lineDetail = null;
    this.lineId = "";
    this.orderNo = "";
    var qs = edipao.urlGet();
    this.source = qs.source * 1;
    this.map = null;
    this.line = [];
    this.topLoadIndex = null;
    this.isHighway = 0;
    this.selectedOrderNo = null;
    this.updatedLine = null;
    this.vias = [];
    this.trackHandler = null;
  }
  Rm.prototype.init = function () {
    var _this = this;
    // this.topLoadIndex = layer.load(1);
    try{
      var baseStyle = {
        width: 23,
        height: 29,
        offsetX: -13,
        offsetY: -34,
        textOffsetX: -5,
        textOffsetY: -30,
        fontColor: "#FFF",
      }
      var viaStyle = new Careland.PointStyle(Object.assign({}, baseStyle, {
        src: location.origin + "/images/map_sign_pass.png",
      }));
      var startStyle = new Careland.PointStyle(Object.assign({}, baseStyle, {
        src: location.origin + "/images/map_sign_start.png",
      }));
      var endStyle = new Careland.PointStyle(Object.assign({}, baseStyle, {
        src: location.origin + "/images/map_sign_end.png",
      }));
      //凯立德地图API功能
      var point = new Careland.Point(419364916, 143908009);    //创建坐标点
      this.map = new Careland.Map('map', point, 12);             //实例化地图对象
      this.map.enableAutoResize();                               //启用自动适应容器尺寸变化
      this.map.load();
      this.trackHandler = new Careland.Track();
      this.Driving = new Careland.DrivingRoute(this.map, {
        "map": this.map,
        "multi": 1,
        "policy": CLDMAP_DRIVING_POLICY_NO_HIGHWAYS,
        "viaStyle": viaStyle,
        "startStyle": startStyle,
        "endStyle": endStyle,
        "autoDragging": true,
        "onSearchComplete": function (obj) {
          layer.close(_this.topLoadIndex);
          _this.lineSelectCallback(obj);
        },
        "onMarkersSet": function (data) {  },
      });
      this.layer = new Careland.Layer('point', 'layer');        //创建点图层
      this.map.addLayer(this.layer);
      this.postMessage("loaded");
    } catch (err){
        console.log(err)
    }
    this.bindEvents();
  }
  Rm.prototype.bindEvents = function () {
    var _this = this;
    $(window).on("message", function (e) {
      var message = e.originalEvent.data;
      console.log(`message: ${JSON.stringify(message)}`)
      switch(_this.source * 1){
        case 1:
          _this.handleEvent1(message);
          break;
        case 2:
          _this.handleEvent2(message);
          break;
        case 3:
          _this.handleEvent3(message);
          break;
      }
    });
  }
  Rm.prototype.handleEvent1 = function (message) {
    var _this = this;
    switch(message.type){
      case "getDefaultOrderRoute":
        // _this.lineId = message.lineId;
        // _this.getlineOrderData()
        break;
      case "orderLine":
        _this.getOrderLineData(message);
        break;
    }
  }
  Rm.prototype.handleEvent2 = function (message) {  }
  Rm.prototype.handleEvent3 = function (message) {
    var _this = this;
    switch(message.type){
      case "getData":  //获取路线
        _this.lineId = message.lineId;
        _this.getlineOrderData();
        break;
      case "policy":  //更改高速配置
        _this.changePolicy(message.isHighway);
        break;
      case "rebuild":  //重新规划
        if(_this.lineDetail.isHighway * 1 == 0){
          _this.Driving.setPolicy(CLDMAP_DRIVING_POLICY_NO_HIGHWAYS);
        }else{
          _this.Driving.setPolicy(CLDMAP_DRIVING_POLICY_PRIORITY_HIGHWAYS);
        }
        _this.isHighway = _this.lineDetail.isHighway;
        _this.line = _this.lineDetail.trackContent;
        _this.renderDrivingRoute();
        break;
      case "save":
        _this.saveRoute();
        break;
      case "choose":  //点击使用
        _this.lineDetail.trackContent = _this.line;
        _this.lineDetail.isHighway = _this.isHighway;
        _this.lineDetail.source = _this.source;
        _this.chooseRoute();
        break;
      case "reports":
        _this.renderReportPoints(message.reports);
        break;
      case "playLine":  //播放轨迹
        _this.playLine();
        break;
      
    }
  }
  Rm.prototype.changePolicy = function (isHighway) {
    var _this = this;
    _this.isHighway = isHighway;
    if(isHighway){
      console.log("走高速")
      _this.Driving.setPolicy(CLDMAP_DRIVING_POLICY_PRIORITY_HIGHWAYS);
      _this.renderDrivingRoute(true);
      return;
    }else{
      console.log("不走高速")
      _this.Driving.setPolicy(CLDMAP_DRIVING_POLICY_NO_HIGHWAYS);
      _this.renderDrivingRoute(true);
      return;
    }
  }
  Rm.prototype.saveRoute = function () {
    var _this = this;
    var pointData = this.updatedLine;
    _this.Driving.getDrivingRouteData(function(res){
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
                      lineId:  _this.lineId,
                      lineSource:  _this.lineDetail.lineSource,
                      trackUrl: res.data.url,
                      trackContent: JSON.stringify(pointData),
                      isHighway: _this.isHighway,
                  }
              }).then(function(res){
                  if(res.code == 0){
                    _this.line = pointData;
                    _this.showMsg({
                      type: "alert",
                      content: "保存成功"
                    });
                  }
              });
          }
      });
    });
  }
  Rm.prototype.chooseRoute = function () {
    var _this = this;
    var pointData = this.updatedLine;
    _this.Driving.getDrivingRouteData(function(res){
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
                      lineId: _this.lineId,
                      lineSource: _this.lineDetail.lineSource,
                      trackUrl: res.data.url,
                      trackContent: JSON.stringify(pointData),
                      isHighway: _this.isHighway,
                  }
              }).then(function(res){
                  if(res.code == 0){
                      _this.line = pointData;
                      _this.showMsg({
                        type: "alert",
                        content: "保存成功"
                      });
                  }
              });
          }
      })
    });
  }
  Rm.prototype.getlineOrderData = function () {
    var _this = this;
    edipao.request({
      type: 'GET',
      url: '/admin/line/detail',
      timeout: 60000,
      data: $.extend({}, {
          lineId: _this.lineId
      }),
    }).done(function(res) {
      layer.close(_this.topLoadIndex);
      if (res.code == 0) {
        _this.lineDetail = res.data
        try {
          if(_this.lineDetail.wayPointJson) _this.vias = JSON.parse(_this.lineDetail.wayPointJson);
          _this.lineDetail.trackContent = JSON.parse(_this.lineDetail.trackContent);
          _this.isHighway = _this.lineDetail.isHighway;
          _this.line = _this.lineDetail.trackContent;
        } catch (error) {}
        _this.renderDrivingRoute();
      }
    }).fail(function () { 
      layer.close(_this.topLoadIndex);
     });
  }
  Rm.prototype.getOrderLineData = function (message) {
    var _this = this;
    edipao.request({
      type: 'GET',
      url: '/admin/lineTrack/getOrderTrack',
      data: {
        orderNo: message.orderNo,
      }
    }).then(function(res){
      if(res.code == 0 && res.data && res.data.length > 0){
        _this.selectedOrderNo = message.orderNo;
        _this.line = res.data;
        _this.renderDrivingRoute();
      }else{
        layer.msg("获取订单轨迹失败");
        layer.close(_this.topLoadIndex);
      }
    });
  }
  Rm.prototype.renderDrivingRoute = function (policy) {
    this.topLoadIndex = layer.load(1);
    var _this = this;         
    var trackInfo = [];
    if(Array.isArray(_this.line)){
      for(var point of _this.line){
        // trackInfo.push(Object.assign({}, Careland.DrawTool.GbPointToKldPoint(point.lng,point.lat), {utctime: 1586144485}));
        trackInfo.push(Careland.DrawTool.GbPointToKldPoint(point.lng, point.lat));
      }
    }
    var start = trackInfo[0];
    var end = trackInfo[trackInfo.length - 1];
    var options = {
      trackInfo: trackInfo,
    }
    if(policy){
      var vias = _this.vias.map(function (item) {
        return (new Careland.GbPoint(item.lat, item.lng));
      });
      options.trackInfo = [];
      if(vias.length > 0) options.via = vias;
      _this.Driving.search(start, end, options);
    }else if(trackInfo.length > 1){
      var vias = _this.vias.map(function (item) {
        return (new Careland.GbPoint(item.lat, item.lng));
      });
      if(vias.length > 0) options.via = vias;
      console.log(JSON.stringify(options))
      _this.Driving.search(start, end, options);
      _this.map.setCenter(start);
    }else{
      var vias = _this.vias.map(function (item) {
        return (new Careland.GbPoint(item.lat, item.lng));
      });
      options.trackInfo = [];
      if(vias.length > 0) options.via = vias;
      _this.Driving.search(_this.lineDetail.startAddress, _this.lineDetail.endAddress, options);
      layer.close(_this.topLoadIndex);
    }
  }
  Rm.prototype.lineSelectCallback = function (obj){
    var _this = this, pointData =[];
    var status = _this.Driving.getStatus();
    console.log(status)
    console.log(obj)
    var plan = obj.getPlan(0);
    if(plan){
      for(var i in plan.uidinfo){
        for(var j in plan.uidinfo[i].shapepoint){
          let gbPoint = Careland.DrawTool.KldPointToGbPoint(plan.uidinfo[i].shapepoint[j].x,plan.uidinfo[i].shapepoint[j].y);
          pointData.push({lng:gbPoint.lng,lat:gbPoint.lat});
        }
      }
      _this.updatedLine = pointData;
    }
  }
  Rm.prototype.renderReportPoints = function (reports) {
    //将标注点添加到图层上
    var _this = this;
    _this.layer.clear();
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
    for(var report of reports){
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
        _this.layer.add(marker); 
        (function(marker,text,report,point){
            marker.addEventListener("click", function(){  
                var opts = {
                    point: point,
                    content: text + '<br/>' + report.address,
                    enableAutoPan: true
                };
                var mapInfoWin = new Careland.InfoWindow(opts);        
                _this.map.openInfoWindow(mapInfoWin, point);//通过核心类接口打开窗口
            });
        })(marker,text,report,point)
        
    }
  }
  Rm.prototype.postMessage = function (message) {
    var data = {
      source: this.source,
      type: message,
    }
    window.parent.postMessage(data);
  }
  Rm.prototype.showMsg = function (options) {
    var data = {
      source: this.source,
      type: "msg",
      options: options
    }
    window.parent.postMessage(data);
  }
  Rm.prototype.playLine = function () {
    var _this = this;
    if(!_this.line) return;
    //启用地图平移缩放控件(骨架)
    var control = new Careland.Navigation();
    control.anchor = CLDMAP_ANCHOR_TOP_RIGHT;					//设置位置为右上角
    control.offset = new Careland.Size(10, 30);					//设置位置偏移
    _this.map.addMapControl(control);

    //启用比例尺
    var scale = new Careland.Scale();
    scale.anchor = CLDMAP_ANCHOR_BOTTOM_LEFT;					//设置位置为左下角
    scale.offset = new Careland.Size(10, 5);					//设置位置偏移
    _this.map.addMapControl(scale);
    
    var data = []; //整理之后的轨迹点
    var speed = 30; //速度
    let d = -1; //每100个切割一段轨迹 
    var linestyles = [];
    for(var i in _this.line){
      if(i%100 == 0){//每100个切割一段轨迹，
        d++;
        data[d] = [];
        linestyles[linestyles.length] = new Careland.LineStyle({color:"rgb(17, 140, 255)",selectedColor:getColor(), size:6,selectedSize:6,opacity:100});
      }
      var l = data[d].length;
      data[d][l] = {};
      data[d][l].Point = new Careland.GbPoint( _this.line[i].lat,_this.line[i].lng);
      data[d][l].Icon = {
        src: location.origin + "/images/truck.png",
      offsetY: -22,
        offsetX: -10
      };
    }
    this.trackHandler.isShowPoint = false; 
    this.trackHandler.setDefaultStyles({trackLineStyles: linestyles});
    this.trackHandler.init(data);
    this.trackHandler.setSpeed(speed);
    this.trackHandler.play();//开始
    
    function getColor(){
      var c = ['#FF0000','#FAFAD2','#F08080','#EECFA1','#CD6090','#BDBDBD','#999999','#8B2252','#551A8B','#242424','#00FFFF','#EEEE00'];
      rand = random(0, 12)
      return c[rand]
    }

    function random(lower, upper) {
      return Math.floor(Math.random() * (upper - lower)) + lower;
    }
  }
  var rm = new Rm();
  rm.init();
});