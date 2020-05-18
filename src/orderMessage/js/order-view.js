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
    "startCity", "endCity", "startProvince", "endProvince", "connectorName", "connectorPhone", "handlingStatus"
  ]
  var orderKeys = [
    "followOperator", "followOperatorPhone", "deliveryOperator", "deliveryOperatorPhone"
  ]
  function View() {
    var qs = edipao.urlGet();
    this.orderNo = qs.orderNo;
    this.orderId = qs.orderId;
    this.feeId = qs.feeId;
    this.action = qs.action || "view";
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
    this.permissionList = edipao.getMyPermission();
    window.feeId = this.feeId;
    window.permissionList = this.permissionList;
    window.dataPermission = this.dataPermission;
  }
  $.extend(View.prototype, {
    init: function () {
      var _this = this;
      if(_this.action != "verify" && _this.action != "feeVerify"){
        $("#verify_container").remove();
        _this.getOrder().done(function (res) {
          if(res.code == "0"){
            _this.feeId = res.data.feeId;
            _this.getOrderFee().done(function (res1) {
              if(res.code == "0"){
                _this.parseData(res.data);
                _this.orderData = res.data;
                if(!_this.feeId){
                  _this.orderData.oil = _this.orderData.prePayOil || 0;
                  _this.orderData.amount =
                    (_this.orderData.prePayAmount ? (_this.orderData.prePayAmount * 1) : 0) +
                    (_this.orderData.arrivePayAmount ? (_this.orderData.arrivePayAmount * 1) : 0) +
                    (_this.orderData.tailPayAmount ? (_this.orderData.tailPayAmount * 1) : 0);
                  _this.orderData.totalAmount = _this.orderData.amount;
                }
                if(res1.code == "0"){
                  _this.orderData.originFee = res1.data || {};
                  _this.orderData.subsidy = res1.data.subsidy || 0;
                }else{
                  _this.orderData.originFee = {};
                  _this.orderData.subsidy = 0;
                }
                if(_this.dataPermission.canViewOrderCost != "Y"){
                  _this.orderData.oil = "****";
                  _this.orderData.prePayOil = "****";
                  _this.orderData.oilAmount = "****";
                  _this.orderData.amount = "****";
                  _this.orderData.totalAmount = "****";
                  _this.orderData.prePayAmount = "****";
                  _this.orderData.arrivePayAmount = "****";
                  _this.orderData.tailPayAmount = "****";
                  _this.orderData.subsidy = "****";
                  Object.keys(_this.orderData.originFee).forEach(function (key) {
                    _this.orderData.originFee[key] = "****";
                  });
                }
                laytpl($("#forms_tpl").html()).render({orderData: _this.orderData, feeUpdateData: {}}, function (html) {
                  $("#form_income_container").after(html);
                  if(!_this.feeId){
                    $(".origin_fee").addClass("hide");
                  }
                  _this.setData(_this.orderData);
                  _this.bindEvents();
                });
              }else{
                layer.msg(res.message, {icon: 5,anim: 6});
              }
            });
          }
        });
      }else{
        $(".page_title_text").text("订单审核");
        $.when(_this.getUpdate(), _this.getOrder(), _this.getTruckUpdate()).done(function (res1, res2, res3, res4) {
          res1 = res1[0];
          res2 = res2[0];
          res3 = res3[0];
          if(res1.code == "0"){
            _this.feeId = res2.data.feeId;
            _this.getOrderFee().done(function (res4) {
              res2.data = res2.data || {};
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
                if(!_this.feeId){
                  res2.data.oil = res2.data.prePayOil || 0;
                  res2.data.amount =
                    (res2.data.prePayAmount ? (res2.data.prePayAmount * 1) : 0) +
                    (res2.data.arrivePayAmount ? (res2.data.arrivePayAmount * 1) : 0) +
                    (res2.data.tailPayAmount ? (res2.data.tailPayAmount * 1) : 0);
                  res2.data.totalAmount = res2.data.amount;
                }
                _this.parseTruckData(res3.data);
                _this.parseData(res2.data);
                _this.parseData(_this.updateData, true);
                _this.orderData = res2.data;
                if(res4.code == "0"){
                  _this.orderData.originFee = res4.data || {};
                  _this.orderData.subsidy = res4.data.subsidy || 0;
                }else{
                  _this.orderData.originFee = {};
                  _this.orderData.subsidy = 0;
                }
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
                  Object.keys(_this.orderData.originFee).forEach(function (key) {
                    _this.orderData.originFee[key] = "****";
                  });
                  _this.updateData.orderData.oilUnitPrice = "****";
                  _this.updateData.orderData.closestOilPrice = "****";
                  _this.updateData.orderData.freightUnitPrice = "****";
                  _this.updateData.orderData.prePayRatio = "****";
                  _this.updateData.orderData.arrivePayRatio = "****";
                  _this.updateData.orderData.tailPayRatio = "****";
                  _this.updateData.orderData.oil = "****";
                  _this.updateData.orderData.prePayOil = "****";
                  _this.updateData.orderData.oilAmount = "****";
                  _this.updateData.orderData.amount = "****";
                  _this.updateData.orderData.totalAmount = "****";
                  _this.updateData.orderData.prePayAmount = "****";
                  _this.updateData.orderData.arrivePayAmount = "****";
                  _this.updateData.orderData.tailPayAmount = "****";
                  _this.updateData.orderData.subsidy = "****";
                }
                _this.updateData.action = _this.action;
                laytpl($("#forms_tpl").html()).render(_this.updateData, function (html) {
                  $("#form_income_container").after(html);
                  if(!_this.feeId){
                    $(".origin_fee").addClass("hide");
                  }
                });
                _this.setData(_this.orderData);
                _this.bindEvents();
              }
            });
          }
        });
      }
    },
    getOrderFee: function(){
      var _this = this;
      if(!_this.feeId) return  { done: function (cb) {
        cb({code: 0, data: {}});
      } };
      return edipao.request({
        url: "/admin/order/getOrderFee",
        method: "POST",
        data: {
          orderNo: _this.orderNo,
          feeId: _this.feeId,
        }
      });
    },
		parseTruckData: function (data) {
			Object.keys(data).forEach(function (key) {
        var item = data[key];
				Object.keys(item).forEach(function (key2) {
					if(truckKeys.indexOf(key2) < 0){
            if(!item[key2] || item[key2] == "undefined"){
              item[key2] = "- -";
            }
            switch(item[key2].settleWay * 1){
              case 0:
                item[key2].settleWay = "- -";
                break;
              case 1:
                item[key2].settleWay = "现结";
                break;
              case 2:
                item[key2].settleWay = "月结";
                break;
              case 3:
                item[key2].settleWay = "账期";
                break;
            }
          }
        });
				switch(item.settleWay * 1){
          case 0:
            item.settleWay = "- -";
            break;
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
            if(key != "driverMileage") data[key] = "- -";
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
      data.updateData = _this.updateData;
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
        console.log(item)
        switch(item.settleWay * 1){
          case 0:
            item.settleWay = "- -";
            break;
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
          truck.action = _this.action;
          truck.orderStatus = _this.orderData.orderStatus;
          laytpl(carFormHtml).render(truck, function (html) {
            var filterStr = "form_car_" + index;
            _this.carFormList.push(filterStr);
            html = html.replace(/CARFORM/g, filterStr);
            html = html.replace("IMAGESTR", imageHtml);
            carFormStr += html;
            if(index == data.truckDTOList.length -1){
              $("#car_form_container").html(carFormStr);
              _this.renderEnd();
						}
						zoomImg();
          });
        });
      });
      form.render();
    },
    renderEnd: function () {
      $(".linpai_btn").unbind().on("click", function(e){
        var loadIndex = layer.load(1)
        var vinCode = e.target.dataset.vin;
        edipao.request({
          url: "/admin/product/handleTempLicense",
          method: "POST",
          data: {
            vinCode: vinCode
          }
        }).done(function (res) {
          layer.close(loadIndex);
          if(res.code == "0"){
            layer.msg("提交成功");
            setTimeout(function () {
              location.reload();
            }, 1000);
          }
        });

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