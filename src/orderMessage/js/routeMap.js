layui.use(['layer'], function (layer) {
  function Rm() {
    this.source = "";
    this.id = "";
    this.currentLine = null;
    this.lineDetail = null;
  }
  Rm.prototype.init = function () {
    var _t = this;
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
      this.map.enableAutoResize();                                 //启用自动适应容器尺寸变化
      this.map.load();
      this.trackHandler = new Careland.Track();
      this.Driving = new Careland.DrivingRoute(this.map, {
        map: this.map,
        policy: CLDMAP_DRIVING_POLICY_PRIORITY_HIGHWAYS,
        multi: 1,
        viaStyle: viaStyle,
        startStyle: startStyle,
        endStyle: endStyle,
        autoDragging: true,
        onSearchComplete: function (obj) {
          layer.close(_t.topLoadIndex);
          _t.lineSelectCallback(obj);
        },
        onMarkersSet: function (data) {
          console.log(data);
        },
      }); 
      _t.layer = new Careland.Layer('point', 'layer');        //创建点图层
      this.map.addLayer(_t.layer);
    } catch (err){
        console.log(err)
    }
    this.bindEvents();
  }
  Rm.prototype.bindEvents = function () {
    window.addEventListener("message", function (e) {
      
    });
  }
  Rm.prototype.lineSelectCallback = function (obj){
    var _t = this, pointData =[];
    var plan = obj.getPlan(0);
    for(var i in plan.uidinfo){
        for(var j in plan.uidinfo[i].shapepoint){
            let gbPoint = Careland.DrawTool.KldPointToGbPoint(plan.uidinfo[i].shapepoint[j].x,plan.uidinfo[i].shapepoint[j].y);
            pointData.push({lng:gbPoint.lng,lat:gbPoint.lat});
        }
    }
    _t.line = pointData;
  }
  var rm = new Rm();
  rm.init();
  console.log(window)
});