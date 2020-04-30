layui.use(['form', 'jquery', 'laytpl'], function () {

  var laytpl = layui.laytpl;
  var $ = layui.jquery;
  var edipao= layui.edipao;
  var form= layui.form;
  var feeKeys = [
    "amount", "arrivePayAmount","arrivePayRatio","closestOilPrice","freightUnitPrice","oil","oilAmount","totalAmount",
    "oilCapacity","oilUnitPrice","prePayAmount","prePayRatio","prePayOil","tailPayAmount","tailPayRatio",
    
  ]
  var truckKeys = [
    "startCity", "endCity", "startProvince", "endProvince", "connectorName", "connectorPhone"
  ]
  var orderKeys = [
    "followOperator", "followOperatorPhone", "deliveryOperator", "deliveryOperatorPhone"
  ]
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
		this.feeUpdateData = {};
		this.truckUpdateData = {};
    this.dataPermission = edipao.getDataPermission();
    this.truckList = [];
    window.dataPermission = this.dataPermission;
    console.log(this.dataPermission)
  }
  $.extend(View.prototype, {
    init: function () {
      var _this = this;
      if(_this.action != "verify" && _this.action != "feeVerify"){
        $("#verify_container").remove();
        _this.getOrder().done(function (res) {
          if(res.code == "0"){
            _this.parseData(res.data);
            _this.orderData = res.data;
            if(_this.dataPermission.canViewOrderCost != "Y"){
              _this.orderData.oil = "****";
              _this.orderData.prePayOil = "****";
              _this.orderData.oilAmount = "****";
              _this.orderData.amount = "****";
              _this.orderData.totalAmount = "****";
              _this.orderData.prePayAmount = "****";
              _this.orderData.arrivePayAmount = "****";
              _this.orderData.tailPayAmount = "****";
            }
            laytpl($("#forms_tpl").html()).render({orderData: _this.orderData, feeUpdateData: {}}, function (html) {
              $("#form_income_container").after(html);
              _this.setData(_this.orderData);
              _this.bindEvents();
            });
          }else{
            layer.msg(res.message, {icon: 5,anim: 6});
          }
        });
      }else{
        $(".page_title_text").text("订单审核");
        $.when(_this.getUpdate(), _this.getOrder(), _this.getTruckUpdate()).done(function (res1, res2, res3) {
          res1 = res1[0];
          res2 = res2[0];
          res3 = res3[0];
          res3.data = res3.data || {};
          if(res1.code == "0" && (res2.code == "0" || res3.code == "0")){
            if(!res1.data){
              _this.updateData = {};
              _this.feeUpdateData = {};
            }else if(_this.action != "feeVerify"){
              try {
                var updateData;
                updateData = JSON.parse(res1.data.modifyAfterJson);
                updateData.forEach(function (item) {
                  _this.updateData[item.name] = item.value;
                });
                if(_this.dataPermission.canViewOrderIncome != "Y"){
                  if(_this.updateData.totalIncome) _this.updateData.totalIncome = "****";
                  if(_this.updateData.totalManageFee) _this.updateData.totalManageFee = "****";
                }
              } catch (error) {
                _this.updateData = {};
              }
            }else{
              _this.updateData = {};
              try {
                var updateData;
                updateData = JSON.parse(res1.data.modifyAfterJson);
                updateData.forEach(function (item) {
                  if(_this.dataPermission.canViewOrderCost != "Y"){
                    if(item.name != "driverMileage") _this.feeUpdateData[item.name] = "****";
                  }else{
                    _this.feeUpdateData[item.name] = item.value;
                  }
                });
              } catch (error) {
                _this.feeUpdateData = {};
              }
            }
            res2.data.truckDTOList = res2.data.truckDTOList || [];
						_this.parseTruckData(res3.data);
            _this.parseData(res2.data);
            _this.parseData(_this.updateData, true);
            _this.orderData = res2.data;
            _this.truckUpdateData = res3.data || {add:[],update:{},delete:[]};

            if(_this.action == "verify"){
              _this.truckUpdateData.add && _this.truckUpdateData.add.forEach(function (item) {
                item.isNew = true;
                _this.orderData.truckDTOList.push(item);
              });
            }

            _this.updateData.orderData = _this.orderData;
            _this.updateData.feeUpdateData = _this.feeUpdateData || {};
            if(_this.dataPermission.canViewOrderCost != "Y"){
              Object.keys(_this.feeUpdateData).forEach(function (key) {
                if(key != "driverMileage") _this.feeUpdateData[key] = "****";
              });
              _this.updateData.orderData.oil = "****";
              _this.updateData.orderData.prePayOil = "****";
              _this.updateData.orderData.oilAmount = "****";
              _this.updateData.orderData.amount = "****";
              _this.updateData.orderData.totalAmount = "****";
              _this.updateData.orderData.prePayAmount = "****";
              _this.updateData.orderData.arrivePayAmount = "****";
              _this.updateData.orderData.tailPayAmount = "****";
            }
            laytpl($("#forms_tpl").html()).render(_this.updateData, function (html) {
              $("#form_income_container").after(html);
            });
            _this.setData(_this.orderData);
            _this.bindEvents();
          }
        });
      }
		},
		parseTruckData: function (data) {
			Object.keys(data).forEach(function (key) {
        var item = data[key];
				Object.keys(item).forEach(function (key2) {
					if(truckKeys.indexOf(key2) < 0){
            if(!item[key2] || item[key2] == "undefined"){
              item[key2] = "- -";
            }
          }
        });
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
      });
		},
    parseData: function (data, update) {
      Object.keys(data).forEach(function (key) {
        if(feeKeys.indexOf(key) < 0 && orderKeys.indexOf(key) < 0){
          if(!data[key] || data[key] == "undefined"){
            data[key] = "- -";
          }
        }
      });
      if(!update){
        if(!data.deliveryOperator && !data.deliveryOperatorPhone){
          data.deliveryOperator = "- -";
          data.deliveryOperatorPhone = "";
        }
        if(!data.followOperator && !data.followOperatorPhone){
          data.followOperator = "- -";
          data.followOperatorPhone = "";
        }
      }
      switch(data.tailPayBillType * 1){
        case 1:
          data.tailPayBillType = "现结";
          break;
        case 2:
          data.tailPayBillType = "月结";
          break;
        case 3:
          data.tailPayBillType = "账期";
          break;
      }
    },
    getTruckUpdate: function () {
      var _this = this;
      return edipao.request({
        url: "/admin/log/order/waybill/last-modify/get",
        method: "GET",
        data:{
          loginStaffId: _this.user.staffId,
          operationModule: 12,
          orderId: _this.orderId,
        }
      });
    },
    getUpdate: function (cb) {
      var _this = this;
      var operationModule = 4;
      if(_this.action == "feeVerify"){
        operationModule = 11;
      }
      return edipao.request({
        url: "/admin/log/last-modify/get",
        method: "GET",
        data:{
          loginStaffId: _this.user.staffId,
          operationModule: operationModule,
          dataPk: _this.orderId
        }
      });
    },
    bindEvents: function () {
      var _this = this;
      $("#verify_submit").unbind().on("click", function (e) {
        var data = form.val("verify_form");
        var url = "/admin/order/approval/order";
        if(_this.action == "feeVerify"){
          url = "/admin/order/approval/orderFee";
        }
        if(data.approvalResult * 1 == 1 && !data.approvalRemark){
          layer.msg("请填写审核备注！", {icon: 2});
          return;
        }
        edipao.request({
          url: url,
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
    setData: function (data) {
      var _this = this;
       //渲染订单数据
       if(!data.feeId){
        data.oilAmount = 0;
        data.amount = data.prePayAmount * 1 + data.arrivePayAmount * 1 + data.tailPayAmount * 1;
        data.totalAmount = data.prePayAmount * 1 + data.arrivePayAmount * 1 + data.tailPayAmount * 1;
        _this.oil = data.prePayOil;
        _this.oilAmount = 0;
      }
      if(_this.dataPermission.canViewOrderIncome != "Y"){
        data.totalIncome = "****";
        data.totalManageFee = "****";
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
				var truck = item;
        if(_this.dataPermission.canViewOrderIncome != "Y"){
          item.pricePerMeliage = "****";
          item.manageFee = "****";
          item.income = "****";
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
        if(!item.returnImages) item.returnImages = [];
        else item.returnImages = item.returnImages.split(",");
        if(!item.fetchImages) item.fetchImages = [];
        else item.fetchImages = item.fetchImages.split(",");
        if(!item.startImages) item.startImages = [];
        else item.startImages = item.startImages.split(",");
        if(!item.startBillImage) item.startBillImage = [];
				else item.startBillImage = item.startBillImage.split(",");
        if(!item.tempLicenseBackImage) item.tempLicenseBackImage = [];
				else item.tempLicenseBackImage = item.tempLicenseBackImage.split(",");
        
				if(_this.action == "verify"){
          var updateData = _this.truckUpdateData.update || {};
				  updateData = updateData[truck.id] || {};
          if(!updateData.returnImages) updateData.returnImages = [];
          else updateData.returnImages = updateData.returnImages.split(",");
          if(!updateData.fetchImages) updateData.fetchImages = [];
          else updateData.fetchImages = updateData.fetchImages.split(",");
          if(!updateData.startImages) updateData.startImages = [];
          else updateData.startImages = updateData.startImages.split(",");
          if(!updateData.startBillImage) updateData.startBillImage = [];
          else updateData.startBillImage = updateData.startBillImage.split(",");
          if(!updateData.tempLicenseBackImage) updateData.tempLicenseBackImage = [];
          else updateData.tempLicenseBackImage = updateData.tempLicenseBackImage.split(",");
          Object.keys(updateData).forEach(function (key) {
            if(!updateData[key] || updateData[key] == "undefined") updateData[key] = "- -";
          });
          truck.updateData = updateData;
          _this.truckUpdateData.delete && _this.truckUpdateData.delete.some(function (item) {
            if(item == truck.id){
              truck.isDeleted = true;
            }
          });
        }else{
          truck.updateData = {};
        }
        Object.keys(truck).forEach(function (key) {
          if(truckKeys.indexOf(key) < 0){
            if(!truck[key] || truck[key] == "undefined"){
              truck[key] = "- -";
            }
          }
        });
        if(!truck.startCity && !truck.startProvince){
          truck.startCity = '- -';
          truck.startProvince = "";
        }
        if(!truck.endCity && !truck.endProvince){
          truck.endCity = '- -';
          truck.endProvince = "";
        }
        if(!truck.connectorName && !truck.connectorPhone){
          truck.connectorName = "- -";
          truck.connectorPhone = "";
        }
        laytpl(imageStr).render(item, function (imageHtml) {
          laytpl(carFormHtml).render(truck, function (html) {
            var filterStr = "form_car_" + index;
            _this.carFormList.push(filterStr);
            html = html.replace(/CARFORM/g, filterStr);
            html = html.replace("IMAGESTR", imageHtml);
            carFormStr += html;
            if(index == data.truckDTOList.length -1){
              $("#car_form_container").html(carFormStr);
						}
						zoomImg();
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