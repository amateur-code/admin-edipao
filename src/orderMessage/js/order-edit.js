layui.use(['form', 'jquery', 'layer', 'laytpl', 'table'], function () {
  console.log(location.href)
  var $ = layui.jquery;
  var form = layui.form;
  var layer = layui.layer;
  var laytpl = layui.laytpl;
  var edipao = layui.edipao;
  var table = layui.table;
  function Edit(){
    var qs = edipao.urlGet();
    this.orderNo = qs.orderNo;
    this.action = qs.action;
    this.user = JSON.parse(sessionStorage.user);
    this.carFormList = [];
    this.feeItemList = [];
    this.prePay = [];
    this.arrivePay = [];
    this.tailPay = [];
    this.orderData = null;
    this.carsToAdd = [];
    this.carsToDel = [];
    this.cars = [];
    this.driverInfoListDto = [];
    this.formList = [
      "form_ascription",
      "form_dispatch",
    ];
  }
  Edit.prototype.getOrderJson = function(){
    return $.ajax({
      url: "js/order.json",
      dataType: "json"
    });
  }
  Edit.prototype.init = function(){
    var _this = this;
    this.getFeeItemList();
    this.getFeeItemUnitList();
    this.getOrder().done(function (res) {
      if(res.code == "0"){
        _this.orderData = res.data;
        _this.setData(res.data);
        _this.bindEvents();
      }else{
        layer.msg(res.message, {icon: 5,anim: 6});
      }
    });
  }
  Edit.prototype.addFeeItem = function (feeName) {
    //后台增加费用项
    var _this = this;
    return edipao.request({
      url: "/admin/feeItem/add",
      data: {
        loginStaffId: _this.user.staffId,
        name: feeName
      }
    })
  }
  Edit.prototype.getFeeItemUnitList = function () {
    //获取费用单位
    return edipao.request({
      url: "/admin/feeItem/unit/list",
      method: "GET",
      data: {}
    })
  }
  Edit.prototype.getFeeItemList = function () {
    //费用项列表
    var _this = this;
    return edipao.request({
      url: "/admin/feeItem/list",
      method: "GET",
      data: {}
    }).done(function (res) {
      if(res.code == "0"){
        _this.feeItemList = res.data;
      }else{
        layer.msg(res.message, {icon: 5,anim: 6});
      }
    });
  }
  Edit.prototype.setFeeList = function(){
    //保存费用项
    var _this = this;
    laytpl($("#fee_list_tpl").html()).render({
      prePay: _this.prePay,
      tailPay: _this.tailPay,
      arrivePay: _this.arrivePay,
    }, function (html) {
      $("#fee_list_container").html(html);
    });
  }
  Edit.prototype.setData = function(data){
    //渲染订单数据
    var _this =this;
    _this.prePay = JSON.parse(data.prePayFeeItems) || [];
    _this.tailPay = JSON.parse(data.tailPayFeeItems) || [];
    _this.arrivePay = JSON.parse(data.arrivePayFeeItems) || [];
    _this.setFeeList();
    laytpl($("#base_info_tpl").html()).render(data, function(html){
      $("#base_info").html(html);
    });
    laytpl($("#income_info_tpl").html()).render(data, function(html){
      $("#income_info").html(html);
    });
    form.val("form_ascription", data);
    form.val("form_dispatch", data);
    var carFormStr = "";
    var carFormHtml = $("#car_info_tpl").html();
    data.truckDTOList.forEach(function (item, index) {
      var filterStr = "form_car_" + index;
      _this.carFormList.push(filterStr);
      carFormStr += carFormHtml.replace(/CARFORM/g,filterStr);
    });
    $("#car_form_container").html(carFormStr);
    form.render();
    _this.carFormList.forEach(function (item, index) {
      _this.cars.push({
        id: data.truckDTOList[index].id,
        filter: item
      });
      form.val(item, data.truckDTOList[index]);
      $("[lay-filter=" + item + "] .select_vin").remove();
    });
  }
  Edit.prototype.getOrder = function () {
    //获取订单详情
    var _this = this;
    return edipao.request({
      url: "/admin/order/detail",
      method: "GET",
      data: {
        loginStaffId: _this.user.staffId,
        orderNo: _this.orderNo
      }
    });
  }
  Edit.prototype.renderCarsTable = function (filter) {
    //选择车辆弹窗表格
    var _this = this;
    table.render({
      elem: '#cars_table'
      , url: layui.edipao.API_HOST+'/admin/truck/getUnDealTrucks'
      // , url: "js/cars.json"
      , title: '车辆列表'
      , method: "get" // 请求方式  默认get
      , page: true //开启分页
      , limit: 20  //每页显示条数
      , limits: [20, 40] //每页显示条数可选择
      , request: {
          pageName: 'pageNo' //页码的参数名称，默认：page
          , limitName: 'pageSize' //每页数据量的参数名，默认：limit
      }
      , parseData: function (res) {
        return {
            "code": res.code, //解析接口状态
            "msg": res.message, //解析提示文本
            "count": res.data.totalSize, //解析数据长度
            "data": res.data.dataList //解析数据列表
        }
    }
    , done: function () {
      table.on('row(cars_table)', function(obj){
        _this.handleAddCar(obj.data, filter);
      });
    }
      , height: 'full'
      , autoSort: true
      , id: 'cars_table'
      , text: {
          none: "暂无数据"
      }
      , cols: [[
          {field: 'createTime', title: '接收时间', sort: false,width:150,},
          {field: 'customerFullName', title: '来源', sort: false,width:150,},
          {field: 'warehouseNo', title: '仓库单号', sort: false,width:150,},
          {field: 'vinCode', title: '车辆vin码', sort: false,width:150,},
      ]]
    });
  }
  Edit.prototype.openSelectVin = function(e){
    //选择车辆
    var _this = this;
    var filter = e.target.dataset.filter;
    layer.open({
      type: 1,
      title: "选择车辆",
      area: '650px',
      content: $("#cars_table"),
      cancel: function () {
        $(".layui-table-view[lay-id=cars_table]").remove();
      },
      success: function () {
        _this.renderCarsTable(filter);
      }
    })
  }
  Edit.prototype.openAddFee = function (e) {
    //打开增加费用项弹窗
    var _this = this;
    var type = e.target.dataset.type;
    var list = _this[type].map(function (item) {
      return item.key;
    });
    var feeList = [];
    _this.feeItemList.forEach(function(item){
      if(list.includes(item)){
        feeList.push({
          key: item,
          checked: true
        });
      }else{
        feeList.push({
          key: item,
          checked: false
        })
      }
    });
    laytpl($("#fee_tpl").html()).render({feeList: feeList}, function(html){
      var layerIndex1 = layer.open({
        title: "增加费用",
        type: 1,
        area: '400px',
        content: html,
        btn:["确认", "取消"],
        yes: function (e) {
          var data = form.val("add_fee_form");
          var oldList = _this[type].map(function (item) {
            return item.key;
          });
          var newList = Object.keys(data);
          newList.forEach(function(item){
            if(!oldList.includes(item)){
              _this[type].push({
                key: item,
                val: 0,
                unit: "元"
              });
            }
            _this.setFeeList();
            layer.closeAll();
            $(".add_fee").unbind().on("click", function (e) {
              _this.openAddFee(e);
            });
          });
        },
        success:function () {
          form.render("checkbox");
          $("#add_fee_item").unbind().on("click", function(e){
            laytpl($("#fee_item_tpl").html()).render({}, function(html){
              var layerIndex2 = layer.open({
                title: "增加费用项",
                type: 1,
                area: '400px',
                content: html,
                btn:["确认", "取消"],
                yes: function (e) {
                  var $addFeeName = $("#addFeeName");
                  if(!$addFeeName.val()){
                    layer.msg("请输入费用名称", {icon: 5,anim: 6});
                    return;
                  }
                  _this.addFeeItem($addFeeName.val()).done(function (res) {
                    if(res.code == "0"){
                      $addFeeName.val("");
                      layer.closeAll();
                      _this.getFeeItemList().done(function (res) {
                        if(res.code == "0"){
                          _this.feeItemList = res.data;
                          _this.openAddFee();
                        }else{
                          layer.msg(res.message, {icon: 5,anim: 6});
                        }
                      });
                    }else{
                      layer.msg(res.message, {icon: 5,anim: 6});
                    }
                  });
                },
              });
            })
          });
        }
      });
    });
  }
  Edit.prototype.handleAddCar = function (data, filter) {
    //添加车辆时
    var _this= this;
    var idTodel = "";
    var idToAdd = data.id;
    //待删除的车辆中已包含
    var indexTodel;
    var delCarsFlag = _this.carsToDel.some(function (item, index) {
      if(item.id == data.id) {idTodel = item.id; indexTodel = index;}
      return item.id == data.id;
    });
    var carsFlag = _this.cars.some(function (item) {
      return item.id == data.id;
    });
    var addCarsFlag = _this.carsToAdd.some(function (item) {
      return item.id == data.id;
    });
    if(delCarsFlag){
      _this.carsToDel.splice(indexTodel, 1);
    }else if(carsFlag){
      $(".layui-table-view[lay-id=cars_table]").remove();
      layer.msg("车辆已存在", {icon: 5,anim: 6});
      setTimeout(function () {
        layer.closeAll();
        $(".layui-table-view[lay-id=cars_table]").remove();
      },1500);
      return;
    }else if(addCarsFlag){
      layer.msg("车辆已存在", {icon: 5,anim: 6});
      setTimeout(function () { 
        layer.closeAll();
        $(".layui-table-view[lay-id=cars_table]").remove();
      },1500);
      return;
    }else{
      edipao.request({
        url: "/admin/truck/addTruck",
        method: "post",
        data: {
          loginStaffId: _this.user.staffId,
          truckId: data.id,
          orderNo: _this.orderNo
        }
      }).done(function (res) {
        if(res.code == '0'){
          _this.carsToAdd.push({
            id: data.id,
            filter: filter
          });
          $(".layui-table-view[lay-id=cars_table]").remove();
          layer.closeAll();
          form.val(filter, data);
        }else{
          layer.msg(res.message, {icon: 5,anim: 6});
        }
      });
      return;
    }
    $(".layui-table-view[lay-id=cars_table]").remove();
    layer.closeAll();
    form.val(filter, data);
  }
  Edit.prototype.handleDeleteCar = function (e) {
    var _this= this;
    var filter = e.target.dataset.filter;
    var idTodel = "";
    var carFormListIndex;
    var id;
    var carData = form.val(filter);
    _this.cars.forEach(function (item) {
      if(item.filter == filter) id = item.id;
    });
    if(carData.id){
      id = carData.id;
    }
    _this.carFormList.forEach(function (item, index) {
      if(item == filter) carFormListIndex = index;
    });
    _this.carFormList.splice(carFormListIndex, 1);
    var carsFlag = _this.cars.some(function (item, index) {
      if(item.filter == filter) {idTodel = item.id; indexTodel = index;}
      return item.filter == filter;
    });
    if(carsFlag){
      _this.carsToDel.push({
        id: idTodel,
        filter: filter
      });
      _this.cars.splice(indexTodel, 1);
    }else{
      //待添加的车辆中已包含
      var addCarsFlag = _this.carsToAdd.some(function (item, index) {
        if(item.filter == filter) {idTodel = item.id; indexTodel = index;}
        return item.filter == filter;
      });
      if(addCarsFlag){
        _this.carsToAdd.splice(indexTodel, 1);
      }
    }
    if(id != undefined){
      edipao.request({
        url: "/admin/truck/delTruck",
        method: "post",
        data: {
          loginStaffId: _this.user.staffId,
          truckId: id,
          orderNo: _this.orderNo
        }
      }).done(function (res) {
        if(res.code == 0){
          $("." + filter).remove();
        }else{
          layer.msg(res.message, {icon: 5,anim: 6});
        }
      });
      return;
    }
    $("." + filter).remove();
  }
  Edit.prototype.preSubmit = function () {
    var _this = this;
    var truckUpdateReqList = [];
    var orderData = JSON.parse(JSON.stringify(_this.orderData));
    var data = {};
    var truckDTOList = orderData.truckDTOList
    delete orderData.truckDTOList;
    var ascriptionData = form.val("form_ascription");
    var dispatchData = form.val("form_dispatch");
    this.prePay.forEach(function (item, index) {
      item.val = dispatchData["prePay_" + index];
    });
    this.arrivePay.forEach(function (item, index) {
      item.val = dispatchData["arrivePay_" + index];
    });
    this.tailPay.forEach(function (item, index) {
      item.val = dispatchData["tailPay_" + index];
    });
    var carsLength = _this.cars.length + _this.carsToAdd.length - _this.carsToDel.length;
    _this.carFormList.forEach(function (item, index) {
      if(index > (truckDTOList.length - 1)) return;
      var itemData = form.val(item);
      truckUpdateReqList.push({
        truckId: itemData.id||"",
        masterFlag: itemData.masterFlag == "on" ? "否" : "是",
        vinCode: itemData.vinCode||"",
        productCode: itemData.productCode||"",
        gpsDeviceCode: itemData.gpsDeviceCode||"",
        customerFullName: itemData.customerFullName||"",
        startWarehouse: itemData.startWarehouse||"",
        warehouseNo: itemData.warehouseNo||"",
        startPark: itemData.startPark||"",
        startProvince: itemData.startProvince||"",
        startCity: itemData.startCity||"",
        startAddress: itemData.startAddress||"",
        settleWay: itemData.settleWay||"",
        endPark: itemData.endPark||"",
        endProvince: itemData.endProvince||"",
        endCity: itemData.endCity||"",
        endAddress: itemData.endAddress||"",
        latestArriveTime: itemData.latestArriveTime||"",
        customerMileage: itemData.customerMileage||"",
        pricePerMeliage: itemData.pricePerMeliage||"",
        income: itemData.income||"",
        manageFee: itemData.manageFee||"",
        tempLicense: itemData.tempLicense,
        tempLicenseBackImage: itemData.tempLicenseBackImage||"",
        saleRemark: itemData.saleRemark||"",
        storageAndDeliverRemark: itemData.storageAndDeliverRemark||"",
        dealerRemark: itemData.dealerRemark||"",
        deliverResourceRemark: itemData.deliverResourceRemarkv,
        transportRemark: itemData.transportRemark||"",
      });
    });
    data.loginStaffId = _this.user.staffId||"";
    data.orderNo = orderData.orderNo||"";
    data.orderType = carsLength > 1 ? 2 : 1;
    data.totalIncome = orderData.totalIncome||"";
    data.totalManageFee = orderData.totalManageFee||"";
    data.fetchOperator = ascriptionData.fetchOperator||"";
    data.fetchOperatorPhone = ascriptionData.fetchOperatorPhone||"";
    data.dispatchOperator = ascriptionData.dispatchOperator||"";
    data.dispatchOperatorPhone = ascriptionData.dispatchOperatorPhone||"";
    data.deliveryOperator = ascriptionData.deliveryOperator||"";
    data.deliveryOperatorPhone = ascriptionData.deliveryOperatorPhone||"";
    data.followOperator = ascriptionData.followOperator||"";
    data.followOperatorPhone = ascriptionData.followOperatorPhone||"";
    data.department = ascriptionData.department||"";
    data.driverId = dispatchData.driverId||"";
    data.driverName = dispatchData.driverName||"";
    data.driverPhone = dispatchData.driverPhone||"";
    data.driverIdCard = dispatchData.driverIdCard||"";
    data.driverCertificate = dispatchData.driverCertificate||"";
    data.driverMileage = dispatchData.driverMileage||"";
    data.prePay = JSON.stringify(_this.prePay);
    data.arrivePay = JSON.stringify(_this.arrivePay);
    data.tailPay = JSON.stringify(_this.tailPay);
    data.truckUpdateReqList = truckUpdateReqList||"";
    _this.submitAll(edipao.request({
      url: "/admin/order/updateOrder",
      method: "POST",
      data: getParams(data),
    }));
    function getParams(data){
      var arr = [];
      Object.keys(data).forEach(function(item){
        if(data[item] instanceof Array){
          data[item].forEach(function (item2, index) {
            Object.keys(item2).forEach(function (item3) {
              arr.push(item+"["+index+"]"+"."+item3 + "=" + item2[item3]);
            });
          })
        }else{
          arr.push(item + "=" + data[item]);
        }
      });
      return encodeURI(arr.join("&"));
    }
  }
  Edit.prototype.submitAll = function(req1){
    var _this = this;
    req1.done(function (res) {
      if(res.code == "0"){
        layer.msg("修改成功");
        setTimeout(function () {
          location.reload();
        }, 1000);
      }else{
        layer.msg(res.message, {icon: 5,anim: 6});
      }
    });
  }
  Edit.prototype.openSelectDriver = function () {
    //选择司机
    var _this= this;
    var id = "driver_name_select";
    edipao.request({
      url: "/admin/order/matchDriver/list",
      method: "GET",
      data: {
        loginStaffId: _this.user.staffId,
        orderNo: _this.orderNo,
      }
    }).done(function (res) {
      if(res.code == "0"){
        if(!res.data) return;
        if(res.data.lenght < 1) return;
        _this.driverInfoListDto = res.data;
        laytpl($("#driver_list_tpl").html()).render({list: res.data}, function (html) {
          $("#driver_name_select").append(html);
          $(".driver_item").unbind().on("click", function (e) {
            var index = e.target.dataset.index;
            var data = _this.driverInfoListDto[index*1];
            var driverData = {
              driverId: data.id,
              driverName: data.name,
              driverPhone: data.phone,
              driverIdCard: data.idNum,
              driverCertificate: data.driveLicenceType,
            }
            form.val("form_dispatch", driverData);
            $('#match_driver_list').remove();
          });
        });
      }
    });
  }
  Edit.prototype.bindEvents = function(){
    var _this = this;
    $("#driver_name").unbind().on("click", function(){
      _this.openSelectDriver();
    });
    $("#btn_confirm").unbind().on("click", function (e){
      _this.preSubmit();
    });
    $(".del_car_btn").unbind().on("click", function(e){
      _this.handleDeleteCar(e);
    });
    $("#btn_cancel").unbind().on("click", function (e) {
      top.xadmin.del_tab(localStorage.current_tab);
    });
    $("#add_car").unbind().on("click", function(e){
      var carFormHtml = $("#car_info_tpl").html();
      var filterStr = "form_car_" + _this.carFormList.length;
      _this.carFormList.push(filterStr);
      var html = carFormHtml.replace(/CARFORM/g, filterStr);
      $("#car_form_container").append(html);
      form.render();
      $(".del_car_btn").unbind().on("click", function(e){
        $(".del_car_btn").unbind().on("click", function(e){
          _this.handleDeleteCar(e);
        });
      });
      $(".select_vin").unbind().on("click", function (e) {
        _this.openSelectVin(e);
      });
    });
    $(".add_fee").unbind().on("click", function (e) {
      _this.openAddFee(e);
    });
    $(".select_vin").unbind().on("click", function (e) {
      _this.openSelectVin(e);
    });
  }
  var edit = new Edit();
  top.edit = edit;
  edit.init();
});