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
        _this.getOrder().done(function (res) {
          if(res.code == "0"){
            Object.keys(res.data).forEach(function (key) {
              res.data[key] = res.data[key] || "- -";
            });
            _this.updateData.orderData = res.data;
            laytpl($("#forms_tpl").html()).render(_this.updateData, function (html) {
              $("#form_income_container").after(html);
              _this.orderData = res.data;
              _this.setData(res.data);
              _this.bindEvents();
              if(_this.action == "verify"){
                _this.getUpdate();
              }
            });
          }else{
            layer.msg(res.message, {icon: 5,anim: 6});
          }
        });
      }else{
        $(".page_title_text").text("订单审核");
        $.when(_this.getUpdate(), _this.getOrder()).done(function (res1, res2) {
          res1 = res1[0];
          res2 = res2[0];
          if(res1.code == "0" && res2.code == "0"){
            var updateData;
            if(!res1.data || !res1.data.modifyAfterJson){
              updateData = {};
            }else{
              try {
                updateData = JSON.parse(res1.data.modifyAfterJson);
                updateData.forEach(function (item) {
                  _this.updateData[item.name] = item.value;
                });
                if(_this. dataPermission.canViewOrderIncome != "Y"){
                  if(_this.updateData.totalIncome) _this.updateData.totalIncome = "*";
                  if(_this.updateData.totalManageFee) _this.updateData.totalManageFee = "*";
                }
              } catch (error) {
                _this.updateData = {};
              }
            }
            if(res2.code == "0"){
              Object.keys(res2.data).forEach(function (key) {
                res2.data[key] = res2.data[key] || "- -";
              });
              _this.updateData.orderData = res2.data;
              laytpl($("#forms_tpl").html()).render(_this.updateData, function (html) {
                $("#form_income_container").after(html);
              });
              _this.orderData = res2.data;
              _this.setData(res2.data);
              _this.bindEvents();
            }else{
              layer.msg(res2.message, {icon: 5,anim: 6});
            }
          }
        });
      }
    },
    getUpdate: function (cb) {
      var _this = this;
      return edipao.request({
        url: "/admin/log/last-modify/get",
        method: "GET",
        data:{
          loginStaffId: _this.user.staffId,
          operationModule: 4,
          dataPk: _this.orderId
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
      return;
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
      console.log(data)
       //渲染订单数据
      var _this =this;
      data.prePayFeeItems = data.prePayFeeItems || "[]";
      data.tailPayFeeItems = data.tailPayFeeItems || "[]";
      data.arrivePayFeeItems = data.arrivePayFeeItems || "[]";
      try {
        _this.prePay = JSON.parse(data.prePayFeeItems) || [];
        _this.updateData.prePayFeeItems = _this.updateData.prePayFeeItems || [];
        if(_this.action == "verify" && _this.updateData.prePayFeeItems.length){
          _this.prePay.forEach(function(before, index){
            var delItem = before; //false标识被删除了
            var flag = false;
            flag = _this.updateData.prePayFeeItems.some(function (after) {
              return before.key == after.key;
            });
            if(!flag){
              _this.updateData.prePayFeeItems.splice(index, 0, {
                key: delItem.key,
                val: "移除",
                unit: delItem.unit,
                del: true,
              });
            }
          });
        }
      } catch (error) {
        _this.prePay = [];
      }
      try {
        _this.tailPay = JSON.parse(data.tailPayFeeItems) || [];
        _this.updateData.tailPayFeeItems = _this.updateData.tailPayFeeItems || [];
        if(_this.action == "verify" && _this.updateData.tailPayFeeItems.length){
          _this.tailPay.forEach(function(before, index){
            var flag = false;
            var delItem = before; //false标识被删除了
            flag = _this.updateData.tailPayFeeItems.some(function (after) {
              return before.key == after.key;
            });
            if(!flag){
              _this.updateData.tailPayFeeItems.splice(index, 0, {
                key: delItem.key,
                val: "移除",
                unit: delItem.unit,
                del: true,
              });
            }
          });
        }
      } catch (error) {
        _this.tailPay = [];
      }
      try {
        _this.arrivePay = JSON.parse(data.arrivePayFeeItems) || [];
        _this.updateData.arrivePayFeeItems = _this.updateData.arrivePayFeeItems || [];
        if(_this.action == "verify" && _this.updateData.arrivePayFeeItems.length){
          _this.arrivePay.forEach(function(before, index){
            var flag = false;
            var delItem = before; //false标识被删除了
            flag = _this.updateData.arrivePayFeeItems.some(function (after) {
              return before.key == after.key;
            });
            if(!flag){
              _this.updateData.arrivePayFeeItems.splice(index, 0, {
                key: delItem.key,
                val: "移除",
                unit: delItem.unit,
                del: true,
              });
            }
          });
        }
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
          var truck = data.truckDTOList[index];
          Object.keys(truck).forEach(function (key) {
            truck[key] = truck[key] || "- -";
          });
          laytpl(carFormHtml).render(truck, function (html) {
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