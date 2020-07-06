var firstLoaded = false;
layui.use(['layer'], function (layer) {
  var edipao = layui.edipao;
  function Rm() {
    this.id = "";
    this.currentLine = null;
    this.lineDetail = null;
    this.chooseOrderNo = "";
    var qs = edipao.urlGet();
    this.source = qs.source * 1;
    this.map = null;
    this.lineId = qs.lineId || "";
    this.line = [];
    this.topLoadIndex = null;
    this.isHighway = 0;
    this.selectedOrderNo = null;
    this.updatedLine = [];
    this.vias = [];
    this.trackHandler = null;
    this.trimPoints = [];
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
        map: this.map,
        multi: 1,
        policy: CLDMAP_DRIVING_POLICY_NO_HIGHWAYS,
        viaStyle: viaStyle,
        startStyle: startStyle,
        endStyle: endStyle,
        autoDragging: true,
        onSearchComplete: function (obj) {
          if(!firstLoaded){
            firstLoaded = true;
            if(_this.trimPoints.length > 0 || _this.vias.length > 0){
              _this.renderDrivingRoute("via");
            }
          }else{
            layer.close(_this.topLoadIndex);
            _this.lineSelectCallback(obj);
          }
        },
      });
      this.layer = new Careland.Layer('point', 'layer');        //创建点图层
      this.map.addLayer(this.layer);
      this.postMessage("loaded");
    } catch (err){
        console.log(err);
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
        _this.getlineOrderData(1);
        break;
      case "orderLine":
        _this.getOrderLineData(message);
        _this.chosenOrderNo = message.orderNo;
        break;
      case "save":
        _this.saveRoute();
        break;
      case "choose":  //点击使用
        _this.lineDetail.trackContent = _this.updatedLine;
        _this.lineDetail.source = _this.source;
        _this.chooseRoute();
        break;
      case "playLine":  //播放轨迹
        _this.playLine();
        break;
      case "rebuild":  //重新规划
        _this.updatedLine = _this.lineDetail.trackContent;
        firstLoaded = false;
        _this.trimPoints = [];
        _this.renderDrivingRoute();
        break;
      case "loadDefaultRoute":
        layer.close(_this.topLoadIndex);
        _this.lineDetail = message.data;
        try {
          if(_this.lineDetail.wayPointJson) _this.vias = JSON.parse(_this.lineDetail.wayPointJson);
          _this.lineDetail.trackContent = JSON.parse(_this.lineDetail.trackContent);
          _this.updatedLine = _this.lineDetail.trackContent;
        } catch (error) {}
        _this.initTrimPoints();
        _this.renderDrivingRoute();
        break;
    }
  }
  Rm.prototype.handleEvent2 = function (message) {
    var _this = this;
    switch(message.type){
      case "loadImportData":
        _this.getlineOrderData(2);
        break;
      case "getDefaultImportRoute":
        _this.getlineOrderData(2);
        break;
      case "choose":  //点击使用
        _this.lineDetail.trackContent = _this.updatedLine;
        _this.lineDetail.isHighway = _this.isHighway;
        _this.lineDetail.source = _this.source;
        _this.chooseRoute();
        break;
      case "save":
        _this.saveRoute();
        break;
      case "playLine":  //播放轨迹
        _this.playLine();
        break;
      case "rebuild":  //重新规划
        _this.updatedLine = _this.lineDetail.trackContent;
        firstLoaded = false;
        _this.trimPoints = [];
        _this.renderDrivingRoute();
        break;
      case "loadDefaultRoute":
        layer.close(_this.topLoadIndex);
        _this.lineDetail = message.data;
        try {
          if(_this.lineDetail.wayPointJson) _this.vias = JSON.parse(_this.lineDetail.wayPointJson);
          _this.lineDetail.trackContent = JSON.parse(_this.lineDetail.trackContent);
          _this.updatedLine = _this.lineDetail.trackContent;
        } catch (error) {}
        _this.initTrimPoints();
        _this.renderDrivingRoute();
    }
  }
  Rm.prototype.handleEvent3 = function (message) {
    var _this = this;
    switch(message.type){
      case "getData":  //获取路线
        _this.getlineOrderData(3);
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
        _this.trimPoints = [];
        _this.isHighway = _this.lineDetail.isHighway;
        _this.updatedLine = _this.lineDetail.trackContent;
        firstLoaded = false;
        _this.renderDrivingRoute();
        break;
      case "save":
        _this.saveRoute();
        break;
      case "choose":  //点击使用
        _this.lineDetail.trackContent = _this.updatedLine;
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
      case "loadDefaultRoute":
        layer.close(_this.topLoadIndex);
        _this.lineDetail = message.data;
        try {
          if(_this.lineDetail.wayPointJson) _this.vias = JSON.parse(_this.lineDetail.wayPointJson);
          _this.lineDetail.trackContent = JSON.parse(_this.lineDetail.trackContent);
          _this.isHighway = _this.lineDetail.isHighway;
          _this.postMessage("isHighway", {isHighway: _this.isHighway});
          _this.updatedLine = _this.lineDetail.trackContent;
        } catch (error) {}
        _this.initTrimPoints();
        _this.renderDrivingRoute();
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
    _this.postMessage("showLoading");
    var pointData = this.updatedLine;
    if(!pointData || pointData.length == 0){
      layer.msg("当前轨迹无效");
      return;
    }
    _this.Driving.getDrivingRouteData(function(res){
      var blob = new Blob([res], {
          type: "application/octet-stream"
      });
      let formData = new FormData()
      formData.append('file', blob)
      formData.append('loginStaffId',edipao.getLoginStaffId())
      $.ajax({
          type: 'POST',
          url: edipao.API_HOST + '/admin/lineTrack/upload/routeFile', 
          data: formData,
          processData : false,
          contentType : false,
      }).done(function(res){
          if(res.code == 0){
            var params = {
              lineId:  _this.lineId,
              lineSource:  _this.lineDetail.lineSource,
              trackUrl: res.data.url,
              trackContent: JSON.stringify(pointData),
              trimPoints: JSON.stringify(_this.trimPoints),
            }
            if(_this.source == 3) params.isHighway = _this.isHighway;
            if(_this.source == 1 && _this.chosenOrderNo) params.orderNo = _this.chosenOrderNo;
            edipao.request({
                type: 'POST',
                url: '/admin/lineTrack/updateLineTrack',
                data: params
            }).then(function(res){
                _this.postMessage("hideLoading");
                if(res.code == 0){
                  _this.updatedLine = pointData;
                  _this.chooseOrderNo = "";
                  _this.showMsg({
                    type: "alert",
                    content: "保存成功"
                  });
                }else{
                  _this.showMsg({
                    type: "alert",
                    content: res.message,
                    icon: 2
                  });
                  _this.postMessage("hideLoading");
                }
            }).fail(function () {
              _this.postMessage("hideLoading");
            });
          }else{
            _this.showMsg({
              type: "alert",
              content: res.message,
              icon: 2
            });
            _this.postMessage("hideLoading");
          }
      }).fail(function () { 
        _this.postMessage("hideLoading");
      });
    });
  }

  //点击使用该方式
  Rm.prototype.chooseRoute = function () {
    var _this = this;
    edipao.request({
      url: "/admin/lineTrack/lineUse",
      method: "POST",
      data: {
        lineId: _this.lineId,
        lineSource: _this.source,
      }
    }).done(function (res) {
      if(res.code == 0){
        _this.postMessage("chosenSuccess");
        _this.showMsg({
          type: "alert",
          content: "提交成功",
        });
      }else{
        _this.showMsg({
          type: "alert",
          content: res.message,
          icon: 2
        });
      }
    });
  }

  //获取
  Rm.prototype.getlineOrderData = function (source) {
    var _this = this;
    edipao.request({
      type: 'GET',
      url: '/admin/line/detail',
      timeout: 60000,
      data: $.extend({}, {
        lineId: _this.lineId,
        lineSource: source
      }),
    }).done(function(res) {
      layer.close(_this.topLoadIndex);
      if (res.code == 0) {
        _this.lineDetail = res.data;
        try {
          if(_this.lineDetail.wayPointJson) _this.vias = JSON.parse(_this.lineDetail.wayPointJson || "[]");
          _this.lineDetail.trackContent = JSON.parse(_this.lineDetail.trackContent || "[]");
          if(source == 3){
            _this.isHighway = _this.lineDetail.isHighway;
            _this.postMessage("isHighway", {isHighway: _this.isHighway});
          }
          _this.updatedLine = _this.lineDetail.trackContent;
        } catch (error) {
          _this.vias = [];
        }
        _this.initTrimPoints();
        _this.renderDrivingRoute();
      }
    }).fail(function () { 
      layer.close(_this.topLoadIndex);
     });
  }
  Rm.prototype.initTrimPoints = function () {
    var _this = this;
    try {
      if(_this.lineDetail.trimPoints){
        _this.lineDetail.trimPoints = JSON.parse(_this.lineDetail.trimPoints);
      }else{
        _this.lineDetail.trimPoints = [];
      }
    } catch (error) {
      _this.lineDetail.trimPoints = [];
    }
    _this.trimPoints = _this.lineDetail.trimPoints;
  }
  //获取订单轨迹
  Rm.prototype.getOrderLineData = function (message) {
    var _this = this;
    edipao.request({
      type: 'GET',
      url: '/admin/lineTrack/getOrderTrack',
      data: {
        orderNo: message.orderNo,
        lineId: _this.lineId,
      }
    }).then(function(res){
      if(res.code == 0 && res.data && res.data.length > 0){
        _this.selectedOrderNo = message.orderNo;
        _this.updatedLine = res.data;
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
    if(Array.isArray(_this.updatedLine)){
      for(var point of _this.updatedLine){
        trackInfo.push(Careland.DrawTool.GbPointToKldPoint(point.lng, point.lat));
      }
    }
    var start = trackInfo[0];
    var end = trackInfo[trackInfo.length - 1];
    var options = {
      trackInfo: trackInfo,
    }
    if(policy == "via"){
      var vias = [];
      vias = vias.concat(_this.vias);
      vias = vias.concat(_this.lineDetail.trimPoints.map(function (item) {
        return Careland.DrawTool.KldPointToGbPoint(item.x, item.y);
      }));
      vias = vias.map(function (item) {
        return (new Careland.GbPoint(item.lat, item.lng));
      });
      _this.Driving.search(start, end, {via: vias});
    }else if(policy){
      options.trackInfo = [];
      _this.Driving.search(start, end, options);
    }else if(trackInfo.length > 1){
      _this.Driving.search(start, end, options);
      _this.map.setCenter(start);
    }else{
      options.trackInfo = [];
      _this.Driving.search(_this.lineDetail.startAddress, _this.lineDetail.endAddress, options);
      layer.close(_this.topLoadIndex);
    }
  }
  Rm.prototype.lineSelectCallback = function (obj){
    var _this = this, pointData =[];
    var status = _this.Driving.getStatus();
    if(status.errcode * 1 != 0){
      layer.alert(status.errmsg, {icon: 2});
      return;
    }
    _this.trimPoints = obj.vias;
    var plan = obj.getPlan(0);
    if(plan){
      for(var i in plan.uidinfo){
        for(var j in plan.uidinfo[i].shapepoint){
          let gbPoint = Careland.DrawTool.KldPointToGbPoint(plan.uidinfo[i].shapepoint[j].x,plan.uidinfo[i].shapepoint[j].y);
          pointData.push({lng:gbPoint.lng,lat:gbPoint.lat});
        }
      }
      _this.updatedLine = pointData;
      _this.postMessage("orderLineSuccess");
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
  Rm.prototype.postMessage = function (message, options) {
    var data = {
      source: this.source,
      type: message,
    }
    if(options) data.data = options;
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
    if(!_this.updatedLine) return;
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
    for(var i in _this.updatedLine){
      if(i%100 == 0){//每100个切割一段轨迹，
        d++;
        data[d] = [];
        linestyles[linestyles.length] = new Careland.LineStyle({color:"rgb(17, 140, 255)",selectedColor:getColor(), size:6,selectedSize:6,opacity:100});
      }
      var l = data[d].length;
      data[d][l] = {};
      data[d][l].Point = new Careland.GbPoint( _this.updatedLine[i].lat,_this.updatedLine[i].lng);
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