layui.use(['form', 'table', 'jquery','layer', 'upload', 'laytpl', 'laydate'], function () {
  var table = layui.table;
  var $ = layui.jquery;
  var form = layui.form;
  var layer = layui.layer;
  var upload = layui.upload;
  var laytpl = layui.laytpl;
  var laypage = layui.laypage
  var laydate = layui.laydate

  //分页
  laypage.render({
    elem: 'footer-laypage',
    count: 100,
    layout: ['count', 'prev', 'page', 'next'],
    jump: function(obj){
      console.log(obj)
    }
  });

  // 地图
  mapInit();
  function mapInit(){
    //凯立德地图API功能
    var point = new Careland.Point(419364916, 143908009);	//创建坐标点
    var map = new Careland.Map('map', point, 15); 			//实例化地图对象
    map.enableAutoResize();                                 //启用自动适应容器尺寸变化
    map.load(); 											//加载地图
  }

  return;
  layer.open({
    type: 1,
    title: "司机上报",
    area: ['450px', '550px'],
    content: $("#driver-report-dialog"),
    btn: ['取消', '确定'],
    btnAlign: 'c',
    zIndex:9990, //层优先级
    cancel: function () {
      
    },
    success: function () {
      $('#btn-break-car-location').on('click', function(){
        console.log(1)
        layer.open({
          type: 1,
          title: "选择位置",
          area: ['1000px', '600px'],
          content: $("#select-map-dialog"),
          btn: ['取消', '确定'],
          btnAlign: 'c',
          zIndex:9991, //层优先级
          cancel: function () {
            
          },
          success: function () {
            //凯立德地图API功能
            var point = new Careland.Point(419364916, 143908009);	//创建坐标点
            var map = new Careland.Map('select-map', point, 15); 			//实例化地图对象
            map.enableAutoResize();                                 //启用自动适应容器尺寸变化
            map.load(); 
            
            //创建一个自动完成的实例
            var ac = new Careland.Autocomplete({
              input : "seachLocation",
              location : map
            });
            ac.setLocation(map);
            ac.setInputForm('seachLocation');
            ac.addEventListener("onConfirm",function(e){
              ac.hide();
            });
          }
        })
      })
    }
  })

  //时间范围
  laydate.render({
    elem: '#startTime',
    type: 'time',
    range: true,
    trigger: 'click'
  });


});