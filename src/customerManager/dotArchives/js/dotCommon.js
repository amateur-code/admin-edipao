layui.use(["jquery", "form", "laydate", "layer", "laytpl"], function () {
  var $ = layui.jquery,
    form = layui.form,
    layer = layui.layer,
    laytpl = layui.laytpl,
    laydate = layui.laydate,
    edipao = layui.edipao,
    detailAddress;

  window.form = form;
  form.verify({
    nameVerify: function (value) {
      if (value == "") {
        return "请输入网点名称";
      } else {
        if (value.length > 50) {
          return "网点名称格式无效";
        }
      }
    },
    addressVerify: function (value) {
      if (value == "") {
        return "请输入详细地址";
      }
    },
    codeVerify: function (value) {
      if (value == "") {
        return "请输入地址代码";
      } else {
        if (value.length > 15) {
          return "地址代码格式无效";
        }
      }
    },
  });
  $("#accountCity").xcity();
  var myGeo = new Careland.Geocoder();
  var point = new Careland.Point(411067452, 81446126); //创建坐标点
  var map = new Careland.Map("map", point, 12); //实例化地图对象
  map.enableAutoResize(); //启用自动适应容器尺寸变化
  map.load();

  var ac = new Careland.Autocomplete({ input: "detailAddress", location: map });
  ac.setLocation(map);
  ac.setInputForm("detailAddress");
  ac.addEventListener("onConfirm", function (e) {
    myGeo.getLocation(e.item.poi.point, function (data) {
      console.log(data)
      detailAddress = {
        address: data.address,
        lat: edipao.kcodeToGb(data.kcode).lat,
        lng: edipao.kcodeToGb(data.kcode).lng,
        area: data.addressComponent.district
      };
      $("#detailAddress").val(detailAddress.address);
      $("#endLat").val(detailAddress.lat);
      $("#endLng").val(detailAddress.lng);
      $("#endDistrict").val(detailAddress.area);
      ac.hide();
    });

  });

  $("#openMap").on("click", function () {
    layer.open({
      type: 1,
      title: "选择地址",
      area: ['900px', '500px'],
      content: selectMapDialog.innerHTML,
      btn: ["取消", "确定"],
      btnAlign: "c",
      zIndex: 9991, //层优先级
      cancel: function () {},
      btn2: function () {
        if (detailAddress) {
          $("#detailAddress").val(detailAddress.address);
          $("#endLat").val(detailAddress.lat);
          $("#endLng").val(detailAddress.lng);
          $("#endDistrict").val(detailAddress.area);
        }
        $('#select-address').text('');
      },
      success: function () {
        //凯立德地图API功能
        var point = new Careland.Point(419364916, 143908009);
        var map = new Careland.Map("select-map", point, 15);
        map.enableAutoResize();
        map.load();

        var layer = new Careland.Layer("point", "layer");
        var style = new Careland.PointStyle({
          offsetX: -11,
          offsetY: -30,
          textOffsetX: -5,
          textOffsetY: -30,
          src: location.origin + "/images/center.png",
          fontColor: "#000",
        });
        layer.setStyle(style);
        map.addLayer(layer);

        var mapInfoWin = new Careland.InfoWindow();
        mapInfoWin.setOffset(new Careland.Size(0, -22));

        var ac = new Careland.Autocomplete({ input: "seachLocation", location: map });
        ac.setLocation(map);
        ac.setInputForm("seachLocation");
        ac.addEventListener("onConfirm", function (e) {
          myGeo.getLocation(e.item.poi.point, function (data) {
            mapInfoWin.setContent("当前地址：" + e.item.poi.name);
            mapInfoWin.redraw();
            layer.clear();
            var marker = new Careland.Marker("image");
            marker.setPoint(e.item.poi.point);
            layer.add(marker);
            marker.openInfoWindow(mapInfoWin);
            console.log(data)
            detailAddress = {
              address: data.address,
              lat: edipao.kcodeToGb(data.kcode).lat,
              lng: edipao.kcodeToGb(data.kcode).lng,
              area: data.addressComponent.district
            };
            $("#seachLocation").val(detailAddress.address);
            $("#select-address").text(detailAddress.address);
            map.centerAndZoom(e.item.poi.point, 15);
          });
        });

        $("#regionMapPoint")
          .off("click")
          .on("click", function () {
            var searchTxt = $("#seachLocation").val();
            var poiSearch = new Careland.LocalSearch(map, {
              map: map,
              selectFirstResult: false,
              autoViewport: true,
              onMarkersSet: function (pois) {
                layui.each(pois, function (v, k) {
                  var marker = k.marker;
                  marker.addEventListener("click", function (e) {
                    e.event.defaultPrevented = true;
                    layer.clear();
                    myGeo.getLocation(e.point, function (data) {
                      console.log(data);
                      mapInfoWin.setContent("当前地址：" + data.address);
                      mapInfoWin.redraw();
                      marker.openInfoWindow(mapInfoWin);
                      detailAddress = {
                        address: data.address,
                        lat: edipao.kcodeToGb(data.kcode).lat,
                        lng: edipao.kcodeToGb(data.kcode).lng,
                        area: data.addressComponent.district
                      };
                      $("#seachLocation").val(detailAddress.address);
                      $("#select-address").text(detailAddress.address);
                    });
                  });
                });
              },
            });
            poiSearch.search(searchTxt);
          });

        map.addEventListener("click", function (point) {
          var point = point;
          if (!point || typeof point != "object") {
            return;
          }
          myGeo.getLocation(point, function (data) {
            layer.clear();
            //创建文本标注点
            var marker = new Careland.Marker("image");
            marker.setPoint(point);
            layer.add(marker);

            mapInfoWin.setContent("当前地址：" + data.address);
            mapInfoWin.redraw();
            marker.openInfoWindow(mapInfoWin);
            detailAddress = {
              address: data.address,
              lat: edipao.kcodeToGb(data.kcode).lat,
              lng: edipao.kcodeToGb(data.kcode).lng,
              area: data.addressComponent.district
            };
            $("#seachLocation").val(detailAddress.address);
            $("#select-address").text(detailAddress.address);
          });
        });
      },
    });
  });
});
