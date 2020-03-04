layui.use(['form', 'jquery', 'layer', 'laytpl'], function () {
  console.log(location.href)
  var $ = layui.jquery;
  var form = layui.form;
  var layer = layui.layer;
  var laytpl = layui.laytpl;
  var edipao = layui.edipao;
  function Edit(){
    var qs = edipao.urlGet();
    this.orderId = qs.orderId;
    this.action = qs.action;
    this.user = JSON.parse(sessionStorage.user);
    this.carFormList = [];
    this.orderData = null;
    this.formList = [
      "form_ascription",
      "form_dispatch",
    ];
  }
  Edit.prototype.init = function(){
    var _this = this;
    if(this.action == "see"){
      $("#btn_container").remove();
    }
    this.getOrder().done(function (res) {
      if(res.code == "0"){
        _this.orderData = res.data;
        _this.setData(res.data);
        _this.bindEvents();
      }else{
        layer.msg(data.message, {icon: 5,anim: 6});
      }
    });
  }
  Edit.prototype.setData = function(data){
    var _this =this;
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
      form.val(item, data.truckDTOList[index]);
    });
  }
  Edit.prototype.getOrder = function () {
    var _this = this;
    return edipao.request({
      url: "/admin/order/detail",
      method: "GET",
      data: {
        loginStaffId: _this.user.staffId,
        orderNo: _this.orderId
      }
    });
  }
  Edit.prototype.bindEvents = function(){
    var _this = this;
    $("#btn_confirm").unbind().on("click", function (e){
      var carDataList = [];
      var orderData = _this.orderData;
      var data = {};
      delete orderData.truckDTOList;
      var ascriptionData = form.val("form_ascription");
      var dispatchData = form.val("form_dispatch");
      _this.carFormList.forEach(function (item) {
        var itemData = form.val(item);
        carDataList.push({
          truckId: itemData.truckId,
          masterFlag: itemData.masterFlag,
          vinCode: itemData.vinCode,
          productCode: itemData.productCode,
          gpsDeviceCode: itemData.gpsDeviceCode,
          customerFullName: itemData.customerFullName,
          startWarehouse: itemData.startWarehouse,
          warehouseNo: itemData.warehouseNo,
          startPark: itemData.startPark,
          startProvince: itemData.startProvince,
          startCity: itemData.startCity,
          startAddress: itemData.startAddress,
          settleWay: itemData.settleWay,
          endPark: itemData.endPark,
          endProvince: itemData.endProvince,
          endCity: itemData.endCity,
          endAddress: itemData.endAddress,
          latestArriveTime: itemData.latestArriveTime,
          customerMileage: itemData.customerMileage,
          pricePerMeliage: itemData.pricePerMeliage,
          income: itemData.income,
          manageFee: itemData.manageFee,
          tempLicense: itemData.tempLicense,
          tempLicenseBackImage: itemData.tempLicenseBackImage,
          saleRemark: itemData.saleRemark,
          storageAndDeliverRemark: itemData.storageAndDeliverRemark,
          dealerRemark: itemData.dealerRemark,
          deliverResourceRemark: itemData.deliverResourceRemark,
          transportRemark: itemData.transportRemark,
        });
      });
      data.loginStaffId = _this.user.staffId;
      data.orderNo = orderData.orderNo;
      data.orderType = orderData.orderType;
      data.totalIncome = orderData.totalIncome;
      data.totalManageFee = orderData.totalManageFee;
      data.fetchOperator = orderData.fetchOperator;
      data.fetchOperatorPhone = orderData.fetchOperatorPhone;
      data.dispatchOperator = orderData.dispatchOperator;
      data.dispatchOperatorPhone = orderData.dispatchOperatorPhone;
      data.deliveryOperator = orderData.deliveryOperator;
      data.deliveryOperatorPhone = orderData.deliveryOperatorPhone;
      data.followOperator = orderData.followOperator;
      data.followOperatorPhone = orderData.followOperatorPhone;
      data.driverName = orderData.driverName;
      data.driverPhone = orderData.driverPhone;
      data.driverIdCard = orderData.driverIdCard;
      data.driverCertificate = orderData.driverCertificate;
      data.driverMileage = orderData.driverMileage;
      data.prePay = orderData.prePay;
      data.arrivePay = orderData.arrivePay;
      data.tailPay = orderData.tailPay;
      data.truckUpdateReqList = carDataList;
      edipao.request({
        url: "/admin/order/updateOrder",
        method: "POST",
        data: data,

      });
    });
    $(".del_car_btn").unbind().on("click", function(e){
      var filter = e.target.dataset.filter;
      $("." + filter).remove();
    });
    $("#add_car").unbind().on("click", function(e){
      var carFormHtml = $("#car_info_tpl").html();
      var filterStr = "form_car_" + _this.carFormList.length;
      _this.carFormList.push(filterStr);
      var html = carFormHtml.replace(/CARFORM/g, filterStr);
      $("#car_form_container").append(html);
      form.render();
      $(".del_car_btn").unbind().on("click", function(e){
        var filter = e.target.dataset.filter;
        $("." + filter).remove();
      });
    });
    $(".add_fee").unbind().on("click", function (e) {
      laytpl($("#fee_tpl").html()).render({}, function(html){
        var type = e.target.type;
        layer.open({
          title: "增加费用",
          type: 1,
          area: '400px',
          content: html,
          btn:["取消", "确认"],
          success:function () {
            form.render("checkbox");
            $("#add_fee_item").unbind().on("click", function(e){
              laytpl($("#fee_item_tpl").html()).render({}, function(html){
                layer.open({
                  title: "增加费用项",
                  type: 1,
                  area: '400px',
                  content: html,
                  btn:["取消", "确认"],
                  success:function () {
                    
                  }
                });
              })
            });
          }
        });
      });
    });
  }
  var edit = new Edit();
  edit.init();
});