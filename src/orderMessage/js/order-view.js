layui.use(['form', 'jquery', 'laytpl'], function () {

  var laytpl = layui.laytpl;
  var $ = layui.jquery;
  var edipao= layui.edipao;
  var form= layui.form;

  function View() {
    var qs = edipao.urlGet();
    this.orderNo = qs.orderNo;
    this.orderId = qs.orderId;
    this.action = qs.action || "";
    this.user = JSON.parse(sessionStorage.user);
    this.prePay = [];
    this.arrivePay = [];
    this.tailPay = [];
    this.orderData = null;
    this.carFormList = [];
    this.updateData = {};
  }
  $.extend(View.prototype, {
    init: function () {
      var _this = this;
      if(_this.action != "verify"){
        $("#verify_container").remove();
        laytpl($("#forms_tpl").html()).render(_this.updateData, function (html) {
          $("#form_income_container").after(html);
          _this.getOrder().done(function (res) {
            if(res.code == "0"){
              _this.orderData = res.data;
              _this.setData(res.data);
              _this.bindEvents();
              if(_this.action == "verify"){
                _this.getUpdate();
              }
            }else{
              layer.msg(res.message, {icon: 5,anim: 6});
            }
          });
        });
      }else{
        $(".page_title_text").text("订单审核");
        _this.getUpdate(function () {
          _this.getOrder().done(function (res) {
            if(res.code == "0"){
              _this.orderData = res.data;
              _this.setData(res.data);
              _this.bindEvents();
            }else{
              layer.msg(res.message, {icon: 5,anim: 6});
            }
          });
        });
      }
    },
    getUpdate: function (cb) {
      var _this = this;
      edipao.request({
        url: "/admin/log/last-modify/get",
        method: "GET",
        data:{
          loginStaffId: _this.user.staffId,
          operationModule: 4,
          dataPk: _this.orderId
        }
      }).done(function (res) {
        if(res.code == "0"){
          var updateData;
          if(!res.data || !res.data.modifyAfterJson){
            updateData = {};
          }else{
            updateData = JSON.parse(res.data.modifyAfterJson);
            updateData.forEach(function (item) {
              _this.updateData[item.name] = item.value;
            });
            if(_this.updateData.prePayFeeItems)_this.updateData.prePayFeeItems = JSON.parse(_this.updateData.prePayFeeItems);
            if(_this.updateData.tailPayFeeItems)_this.updateData.tailPayFeeItems = JSON.parse(_this.updateData.tailPayFeeItems);
            if(_this.updateData.arrivePayFeeItems)_this.updateData.arrivePayFeeItems = JSON.parse(_this.updateData.arrivePayFeeItems);
          }
          laytpl($("#forms_tpl").html()).render(_this.updateData, function (html) {
            $("#form_income_container").after(html);
            cb && cb();
          });
        }
      });
    },
    bindEvents: function () {
      var _this = this;
      $("#verify_submit").unbind().on("click", function (e) {
        var data = form.val("verify_form");
        console.log(data)
        edipao.request({
          url: "/admin/order/approval/order",
          method: "POST",
          data: {
            loginStaffId: _this.user.staffId,
            orderId: _this.orderId,
            approvalRemark: data.approvalRemark,
            approvalResult: data.approvalResult * 1
          }
        }).done(function (res) {
          if(res.code == "0"){
            layer.alert("提交成功", { icon: 6 }, function () { 
              xadmin.close();
              xadmin.father_reload();
            });
          }
        });
      });
      $("#btn_cancel").unbind().on("click", function (e) {
        xadmin.close();
      });
    },
    setFeeList: function () {
      //保存费用项
      var _this = this;
      laytpl($("#fee_list_tpl").html()).render({
        prePay: _this.prePay,
        tailPay: _this.tailPay,
        arrivePay: _this.arrivePay,
        updateData: _this.updateData,
        orderData: _this.orderData
      }, function (html) {
        $("#fee_list_container").html(html);
      });
    },
    setData: function (data) {
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
      console.log(data)
      form.val("form_ascription", data);
      if(data.driverId) form.val("form_dispatch", data);
      var carFormStr = "";
      var carFormHtml = $("#car_info_tpl").html();
      var imageStr = $("#image_tpl").html();
      data.truckDTOList.forEach(function (item, index) {
        if(!item.fetchImages) item.fetchImages = "";
        item.fetchImages = item.fetchImages.split(",");
        if(!item.startBillImage) item.startBillImage = "";
        item.startBillImage = item.startBillImage.split(",");
        laytpl(imageStr).render(item, function (imageHtml) {
          var filterStr = "form_car_" + index;
          _this.carFormList.push(filterStr);
          carFormHtml = carFormHtml.replace(/CARFORM/g, filterStr);
          carFormHtml = carFormHtml.replace("IMAGESTR", imageHtml);
          carFormStr += carFormHtml;
          if(index == data.truckDTOList.length -1){
            $("#car_form_container").html(carFormStr);
          }
        });
      });
      form.render();
      _this.carFormList.forEach(function (item, index) {
        form.val(item, data.truckDTOList[index]);
      });
    },
    getOrder: function () {
      //获取订单详情
      var _this = this;
      return edipao.request({
        url: "/admin/order/detail",
        method: "GET",
        data: {
          loginStaffId: _this.user.staffId,
          id: _this.orderId
        }
      });
    }
  });
  var view = new View();
  view.init();
  top.window.view = view;
});