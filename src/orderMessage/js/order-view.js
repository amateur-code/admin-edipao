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
    this.dataPermission = edipao.getDataPermission();
    window.dataPermission = this.dataPermission;
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
              Object.keys(res.data).forEach(function (key) {
                res.data[key] = res.data[key] || "- -";
              });
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
              Object.keys(res.data).forEach(function (key) {
                res.data[key] = res.data[key] || "- -";
              });
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
            try {
              updateData = JSON.parse(res.data.modifyAfterJson);
              updateData.forEach(function (item) {
                _this.updateData[item.name] = item.value;
              });
              if(_this.updateData.prePayFeeItems)_this.updateData.prePayFeeItems = JSON.parse(_this.updateData.prePayFeeItems);
              if(_this.updateData.tailPayFeeItems)_this.updateData.tailPayFeeItems = JSON.parse(_this.updateData.tailPayFeeItems);
              if(_this.updateData.arrivePayFeeItems)_this.updateData.arrivePayFeeItems = JSON.parse(_this.updateData.arrivePayFeeItems);
              if(_this. dataPermission.canViewOrderIncome != "Y"){
                if(_this.updateData.totalIncome) _this.updateData.totalIncome = "*";
                if(_this.updateData.totalManageFee) _this.updateData.totalManageFee = "*";
              }
            } catch (error) {
              _this.updateData = {};
            }
            
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
      if(_this.dataPermission.canViewOrderCost != "Y"){
        _this.orderData.prePayAmount = "*";
        if(_this.updateData.prePayAmount) _this.updateData.prePayAmount = "*";
        _this.orderData.arrivePayAmount = "*";
        if(_this.updateData.arrivePayAmount) _this.updateData.arrivePayAmount = "*";
        _this.orderData.tailPayAmount = "*";
        if(_this.updateData.tailPayAmount) _this.updateData.tailPayAmount = "*";

        _this.prePay.forEach(function (item) {
          item.val = "*";
        });
        _this.updateData.prePayFeeItems && _this.updateData.prePayFeeItems.forEach(function (item) {
          item.val = "*";
        });

        _this.arrivePay.forEach(function (item) {
          item.val = "*";
        });
        _this.updateData.arrivePayFeeItems && _this.updateData.arrivePayFeeItems.forEach(function (item) {
          item.val = "*";
        });

        _this.tailPay.forEach(function (item) {
          item.val = "*";
        });
        _this.updateData.tailPayFeeItems && _this.updateData.tailPayFeeItems.forEach(function (item) {
          item.val = "*";
        });
      }
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
      data.prePayFeeItems = data.prePayFeeItems || "[]";
      data.tailPayFeeItems = data.tailPayFeeItems || "[]";
      data.arrivePayFeeItems = data.arrivePayFeeItems || "[]";
      try {
        _this.prePay = JSON.parse(data.prePayFeeItems) || [];
      } catch (error) {
        _this.prePay = [];
      }
      try {
        _this.tailPay = JSON.parse(data.tailPayFeeItems) || [];
      } catch (error) {
        _this.tailPay = [];
      }
      try {
        _this.arrivePay = JSON.parse(data.arrivePayFeeItems) || [];
      } catch (error) {
        _this.arrivePay = [];
      }
      _this.setFeeList();

      if(_this. dataPermission.canViewOrderIncome != "Y"){
        data.totalIncome = "*";
        data.totalManageFee = "*";
      }

      laytpl($("#base_info_tpl").html()).render(data, function(html){
        $("#base_info").html(html);
      });
      laytpl($("#income_info_tpl").html()).render(data, function(html){
        $("#income_info").html(html);
      });
      form.val("form_ascription", data);
      if(data.driverId) form.val("form_dispatch", data);
      var carFormStr = "";
      var carFormHtml = $("#car_info_tpl").html();
      var imageStr = $("#image_tpl").html();
      data.truckDTOList.forEach(function (item, index) {
        if(_this. dataPermission.canViewOrderIncome != "Y"){
          item.pricePerMeliage = "*";
          item.manageFee = "*";
          item.income = "*";
        }
        switch(item.settleWay * 1){
          case 1:
            item.settleWay = "现结";
            break;
          case 2:
            item.settleWay = "月结";
            break;
          case 3:
            item.settleWay = "账期";
            break;
        }
        
        item.connector = item.connectorName + item.connectorPhone;
        if(!item.returnImages) item.returnImages = "";
        item.returnImages = item.returnImages.split(",");
        if(!item.fetchImages) item.fetchImages = "";
        item.fetchImages = item.fetchImages.split(",");
        if(!item.startImages) item.startImages = "";
        item.startImages = item.startImages.split(",");
        if(!item.startBillImage) item.startBillImage = "";
        item.startBillImage = item.startBillImage.split(",");
        Object.keys(item).forEach(function (key) {
          if(!item[key])item[key] = "- -";
        });
        laytpl(imageStr).render(item, function (imageHtml) {
          laytpl(carFormHtml).render(data.truckDTOList[index], function (html) {
            var filterStr = "form_car_" + index;
            _this.carFormList.push(filterStr);
            html = html.replace(/CARFORM/g, filterStr);
            html = html.replace("IMAGESTR", imageHtml);
            carFormStr += html;
            if(index == data.truckDTOList.length -1){
              $("#car_form_container").html(carFormStr);
            }
          });
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