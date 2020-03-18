layui.use(['form', 'jquery', 'layer', 'laytpl', 'table', 'laydate', 'upload'], function () {
  console.log(location.href)
  var $ = layui.jquery;
  var form = layui.form;
  var layer = layui.layer;
  var laydate = layui.laydate;
  var upload = layui.upload;
  var laytpl = layui.laytpl;
  var edipao = layui.edipao;
  var table = layui.table;
  function Edit(){
    var qs = edipao.urlGet();
    this.orderNo = qs.orderNo;
    this.orderId = qs.orderId;
    this.action = qs.action;
    this.user = JSON.parse(sessionStorage.user);
    this.carFormList = [];
    this.feeItemList = [];
    this.feeUnitItemList = ["%", "元", "升"];
    this.prePay = [];
    this.arrivePay = [];
    this.tailPay = [];
    this.orderData = null;
    this.carsToAdd = [];
    this.carsToDel = [];
    this.cars = [];
    this.tempLicenseBackImage = [];
    this.tempLicense = [];
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
  Edit.prototype.addFeeItem = function (data) {
    //后台增加费用项
    var _this = this;
    return edipao.request({
      url: "/admin/feeItem/add",
      data: {
        loginStaffId: _this.user.staffId,
        name: data.addFeeName,
        unit: data.addFeeUnit
      }
    })
  }
  Edit.prototype.getFeeItemUnitList = function () {
    var _this = this;
    //获取费用单位
    return edipao.request({
      url: "/admin/feeItem/unit/list",
      method: "GET",
      data: { loginStaffId: _this.user.staffId }
    }).done(function (res) {
      if(res.code == 0){
        _this.feeUnitItemList = res.data;
      }
    });
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
      prePayDisabled: _this.orderData.prePayAmount == "*",
      prePay: _this.prePay,
      tailPayDisabled: _this.orderData.tailPayAmount == "*",
      tailPay: _this.tailPay,
      arrivePayDisabled: _this.orderData.arrivePayAmount == "*",
      arrivePay: _this.arrivePay,
      unitList: _this.feeUnitItemList
    }, function (html) {
      $("#fee_list_container").html(html);
      form.render("select");
      _this.bindFeeUnitSelect();
    });
  }
  Edit.prototype.bindFeeUnitSelect = function () {
    var _this = this;
    form.on("select", function (obj) {
      console.log(obj)
      var elem = obj.elem;
      if(elem.name == "unit"){
        var type = elem.dataset.type;
        var index = elem.dataset.index * 1;
        var value = elem.value;
        _this[type][index].unit = value;
      }
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
    if(data.driverId) form.val("form_dispatch", data);
    form.val("form_ascription", data);
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
      var truckData;
      try {
        data.truckDTOList[index] = data.truckDTOList[index] || "{}";
        truckData = JSON.parse(JSON.stringify(data.truckDTOList[index]))
      } catch (error) {}
      _this.tempLicenseBackImage.push({
        image: truckData.tempLicenseBackImage,
        id: truckData.id
      });
      _this.tempLicense.push({
        image: truckData.tempLicense,
        id: truckData.id
      });
      laydate.render({
        elem: $(".latestArriveTime")[index], //指定元素
        type: "datetime",
        trigger: "click"
      });
      _this.renderUpload(index);
      _this.cars.push({
        id: truckData.id,
        filter: item
      });
      truckData.masterFlag = truckData.masterFlag == "是"? '' : 'on';
      form.val(item, truckData);
      $("[lay-filter=" + item + "] .select_vin").remove();
    });
  }
  Edit.prototype.renderUpload = function(index){
    var _this = this;
    var data = _this.orderData;
    // upload.render({
    //   elem: $('.tempLicense')[index],
    //   url: edipao.API_HOST + '/admin/truck/upload/image',
    //   data: {
    //     loginStaffId: _this.user.staffId,
    //     truckId: data.truckDTOList[index].id,
    //     type: 1,
    //     index: 1
    //   },
    //   done: function (res) {
    //     if(res.code == 0){
    //       _this.tempLicense[index] = {
    //         image: res.data,
    //         id: data.truckDTOList[index].id
    //       };
    //       layer.msg("上传成功");
    //     }else{
    //       layer.msg(res.message, {icon: 5,anim: 6});
    //     }
    //   }
    // });
    upload.render({
      elem: $('.tempLicenseBackImage')[index],
      url: edipao.API_HOST + '/admin/truck/upload/image',
      data: {
        loginStaffId: _this.user.staffId,
        truckId: data.truckDTOList[index].id,
        type: 1,
        index: 1
      },
      done: function (res) {
        if(res.code == 0){
          _this.tempLicenseBackImage[index] = {
            image: res.data,
            id: data.truckDTOList[index].id
          };
          layer.msg("上传成功");
        }else{
          layer.msg(res.message, {icon: 5,anim: 6});
        }
      }
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
        id: _this.orderId
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
      , where: { loginStaffId: _this.user.staffId }
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
  Edit.prototype.openUpdateFee = function (e) {
    var _this = this;
    var index = e.target.dataset.index*1;
    laytpl($("#update_fee_tpl").html()).render({oldName: _this.feeItemList[index]}, function (html) {
      var index = layer.open({
        title: "修改费用项",
        type: 1,
        area: "400px",
        content: html,
        btn: ['确定', '取消'],
        yes: function () {
          var data = form.val("update_fee_item_form");
          if(!data.newName){
            layer.msg("请输入新名称");
            return;
          }
          data.loginStaffId = _this.user.staffId;
          edipao.request({
            url: "/admin/feeItem/edit",
            method: "post",
            data: data
          }).done(function (res) {
            if(res.code == "0"){
              _this.getFeeItemList().done(function (res2) {
                layer.msg("修改成功");
                layer.closeAll();
                console.log(e)
                _this.openAddFee(e);
              });
            }
          });
        }
      })
    });
  }
  Edit.prototype.openAddFee = function (e) {
    //打开增加费用项弹窗
    var _this = this;
    var type = e.target.dataset.type;
    console.log(type)
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
        area: ['600px', '400px'],
        content: html,
        btn:["确认", "取消"],
        yes: function (e) {
          var data = form.val("add_fee_form");
          var oldList = _this[type].map(function (item) {
            return item.key;
          });
          var newList = Object.keys(data);
          var newObj = [];
          newList.forEach(function(item){
            if(!oldList.includes(item)){
              newObj.push({
                key: item,
                val: 0,
                unit: _this.feeUnitItemList[0],
                new: true
              });
            }else{
              newObj.push(_this[type][oldList.indexOf(item)])
            }
          });
          _this[type] = newObj;
          _this.setFeeList();
          $(".add_fee").unbind().on("click", function (e) {
            _this.openAddFee(e);
          });
          layer.closeAll();
        },
        success:function () {
          form.render("checkbox");
          $(".edit_icon").unbind().on("click", function (e) {
            e.target.dataset.type = type;
            _this.openUpdateFee(e);
          });
          $("#add_fee_item").unbind().on("click", function(e){
            _this.openAddFeeItem(e);
          });
        }
      });
    });
  }
  Edit.prototype.openAddFeeItem = function (e) {
    var _this = this;
    laytpl($("#fee_item_tpl").html()).render({list: _this.feeUnitItemList}, function(html){
      var layerIndex2 = layer.open({
        title: "增加费用项",
        type: 1,
        area: '400px',
        content: html,
        btn:["确认", "取消"],
        success: function () { form.render("select") },
        yes: function (e) {
          var data = form.val("add_fee_item_form");
          if(!data.addFeeName){
            layer.msg("请输入费用名称", {icon: 5,anim: 6});
            return;
          }
          if(data.addFeeName.length > 16){
            layer.msg("费用项名称不能超过16个字符", {icon: 5,anim: 6});
            return;
          }
          if(_this.feeItemList.indexOf(data.addFeeName) > -1){
            layer.msg("新增费用项名称不能与系统一致", {icon: 5,anim: 6});
            return;
          }
          
          _this.addFeeItem(data).done(function (res) {
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
    });
  }
  Edit.prototype.handleAddCar = function (data, filter) {
    //添加车辆时
    var _this= this;
    var idTodel = "";
    var idToAdd = data.id;
    //待删除的车辆中已包含
    var indexTodel;
    var index = _this.carFormList.length - 1;

    // upload.render({
    //   elem: $('.tempLicense')[index],
    //   url: edipao.API_HOST + '/admin/truck/upload/image',
    //   data: {
    //     loginStaffId: _this.user.staffId,
    //     truckId: idToAdd,
    //     type: 1,
    //     index: 1
    //   },
    //   before: function () {
    //     if(!form.val(filter).id){
    //       layer.msg('请先选择车辆', {icon: 5,anim: 6});
    //       return false;
    //     }
    //   },
    //   done: function (res) {
    //     if(res.code == 0){
    //       _this.tempLicense[index] = {
    //         image: res.data,
    //         id: idToAdd
    //       };
    //       layer.msg("上传成功");
    //     }else{
    //       layer.msg(res.message, {icon: 5,anim: 6});
    //     }
    //   }
    // });
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
          orderId: _this.orderId
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
    var _this = this;
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
      if(carData.income){
        _this.orderData.totalIncome = _this.orderData.totalIncome * 1 - carData.income * 1;
      }
      if(carData.manageFee){
        _this.orderData.totalManageFee = _this.orderData.totalManageFee * 1 - carData.manageFee * 1;
      }
      laytpl($("#income_info_tpl").html()).render(_this.orderData, function(html){
        $("#income_info").html(html);
      });
    }
    _this.carFormList.forEach(function (item, index) {
      if(item == filter) carFormListIndex = index;
    });
    _this.carFormList.splice(carFormListIndex, 1);
    _this.tempLicenseBackImage.splice(carFormListIndex, 1);
    // _this.tempLicense.splice(carFormListIndex, 1);
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
          orderId: _this.orderId
        }
      }).done(function (res) {
        if(res.code == 0){
          $("." + filter).remove();
          if(_this.orderData.truckDTOList.length == 1){
            edipao.request({
              url: "/admin/order/cancelOrder",
              method: "post",
              data: {loginStaffId: _this.user.staffId, id: _this.orderId}
            }).done(function(res){
              if(res.code == 0){
                layer.alert("订单已取消", { icon: 6 }, function() {
                  xadmin.close();
                });
              }
            });
          }
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
    console.log(dispatchData)
    _this.prePay = _this.prePay.map(function (item, index) {
      delete item.new;
      item.val = dispatchData["prePay_" + index] || 0;
      return item;
    });
    _this.arrivePay = _this.arrivePay.map(function (item, index) {
      delete item.new;
      item.val = dispatchData["arrivePay_" + index] || 0;
      return item;
    });
    _this.tailPay = _this.tailPay.map(function (item, index) {
      delete item.new;
      item.val = dispatchData["tailPay_" + index] || 0;
      return item;
    });
    var totalIncome = 0;
    var totalManageFee = 0;
    var carsLength = _this.cars.length + _this.carsToAdd.length - _this.carsToDel.length;
    _this.carFormList.forEach(function (item, index) {
      var itemData = form.val(item);
      console.log(itemData.masterFlag)
      if(!itemData.id && itemData.id != 0) return;
      totalIncome += itemData.income * 1;
      totalManageFee += itemData.manageFee * 1;
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
        tempLicense: _this.tempLicense[index].image || itemData.tempLicense,
        tempLicenseBackImage: _this.tempLicenseBackImage[index].image || itemData.tempLicenseBackImage,
        saleRemark: itemData.saleRemark||"",
        storageAndDeliverRemark: itemData.storageAndDeliverRemark||"",
        dealerRemark: itemData.dealerRemark||"",
        deliverResourceRemark: itemData.deliverResourceRemark,
        transportRemark: itemData.transportRemark||"",
      });
    });
    data.id = _this.orderId;
    data.loginStaffId = _this.user.staffId || "";
    data.orderNo = _this.orderNo || "";
    data.orderType = carsLength > 1 ? 2 : 1;
    data.totalIncome = totalIncome || 0;
    data.totalManageFee = totalManageFee || "";
    data.fetchOperator = ascriptionData.fetchOperator||"";
    data.fetchOperatorPhone = ascriptionData.fetchOperatorPhone || "";
    data.dispatchOperator = ascriptionData.dispatchOperator || "";
    data.dispatchOperatorPhone = ascriptionData.dispatchOperatorPhone || "";
    data.deliveryOperator = ascriptionData.deliveryOperator || "";
    data.deliveryOperatorPhone = ascriptionData.deliveryOperatorPhone || "";
    data.followOperator = ascriptionData.followOperator||"";
    data.followOperatorPhone = ascriptionData.followOperatorPhone || "";
    data.department = ascriptionData.department || "";
    data.driverId = dispatchData.driverId || "";
    data.driverName = dispatchData.driverName || "";
    data.driverPhone = dispatchData.driverPhone || "";
    data.driverIdCard = dispatchData.driverIdCard || "";
    data.driverCertificate = dispatchData.driverCertificate || "";
    data.driverMileage = dispatchData.driverMileage || "";
    data.prePay = JSON.stringify(_this.prePay);
    data.arrivePay = JSON.stringify(_this.arrivePay);
    data.tailPay = JSON.stringify(_this.tailPay);
    data.truckUpdateReqList = truckUpdateReqList || "";
    if(data.orderType == 1){
      if(truckUpdateReqList[0].masterFlag == "否"){
        layer.msg("缺少下车标识");
        return;
      }
    }else if(data.orderType == 2){
      var masterNum = 0;
      truckUpdateReqList.forEach(function (item) {
        if(item.masterFlag == "是") masterNum++;
      });
      if(masterNum != 1){
        layer.msg("一个订单有且只能有一个下车标识");
        return;
      }
    }
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
    var reqs = [];
    req1.done(function (res) {
      if(res.code == "0"){
        layer.alert("修改成功", {icon: 6}, function(){
          xadmin.close();
          xadmin.father_reload();
        });
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
        id: _this.orderId,
      }
    }).done(function (res) {
      if(res.code == "0"){
        if(!res.data) res.data = [];
        _this.driverInfoListDto = res.data;
        laytpl($("#driver_list_tpl").html()).render({list: res.data}, function (html) {
          $("#driver_name_select").append(html);
          $(".driver_item").unbind().on("click", function (e) {
            var index = e.target.dataset.index;
            if(index == "none") {
              var data = _this.driverInfoListDto[index*1];
              var driverData = {
                driverId: data.id,
                driverName: data.name,
                driverPhone: data.phone,
                driverIdCard: data.idNum,
                driverCertificate: data.driveLicenceType,
              }
              form.val("form_dispatch", driverData);
            }
            $('#match_driver_list').remove();
          });
        });
      }
    });
  }
  Edit.prototype.openSelectDriverTable = function () {
    var _this = this;
    var index = layer.open({
      type:1,
      title: "选择司机",
      area: ["800px", "400px"],
      content: $("#drivers_table"),
      success: function () {
        table.render({
          elem: '#drivers_table'
          , url: layui.edipao.API_HOST+'/admin/driver/info/list'
          // , url: "js/cars.json"
          , title: '选择司机'
          , method: "get" // 请求方式  默认get
          , page: true //开启分页
          , limit: 10  //每页显示条数
          , limits: [10, 20] //每页显示条数可选择
          , id: "drivers_table"
          , request: {
              pageName: 'pageNumber' //页码的参数名称，默认：page
              , limitName: 'pageSize' //每页数据量的参数名，默认：limit
          }
          , where: {loginStaffId: _this.user.staffId}
          , parseData: function (res) {
            return {
                "code": res.code, //解析接口状态
                "msg": res.message, //解析提示文本
                "count": res.data.totalSize, //解析数据长度
                "data": res.data.driverInfoListDtoList //解析数据列表
            }
        }
        , done: function () {
          table.on('row(drivers_table)', function(obj){
            var data = obj.data;
            var driverData = {
              driverId: data.id,
              driverName: data.name,
              driverPhone: data.phone,
              driverIdCard: data.idNum,
              driverCertificate: data.driveLicenceType,
            }
            form.val("form_dispatch", driverData);
            layer.close(index);
            $(".layui-table-view[lay-id=drivers_table]").remove();
          });
        }
          , height: 'full'
          , autoSort: true
          , text: {
              none: "暂无数据"
          }
          , cols: [[
              {field: 'name', title: '司机姓名', sort: false,},
              {field: 'phone', title: '司机手机', sort: false,},
              {field: 'driverType', title: '司机类型', sort: false,},
              {field: 'driveLicenceType', title: '驾照类型', sort: false},
              {field: 'drivingAge', title: '驾龄', sort: false},
              {field: 'wishJourney', title: '意向路线', sort: false, templet: function (d) {
                var data = d.wishJourney;
                var arr = [];
                try {
                  data = JSON.parse(data);
                } catch (error) {return "";}
                if(data.length){
                  data.forEach(function (item) {
                    arr.push(data[0].start.province + data[0].start.city + "-" + data[0].end.province + data[0].end.city)
                  });
                  return arr.join("，");
                }else{
                  return "";
                }
              }},
              {field: 'oftenJourney', title: '熟手', sort: false},
              {field: 'status', title: '状态', sort: false,width:150,},
              {field: 'location', title: '当前位置', sort: false},
          ]]
        });
      },
      cancel: function () {
        $(".layui-table-view[lay-id=drivers_table]").remove();
      }
    });
  }
  Edit.prototype.handleIncomeInput = function (e) {
    var filter = e.target.dataset.filter;
    var total = 0;
    $(".car_income").each(function (index, item) {
      total += item.value * 1;
    });
    $("#totalIncome").text(total + "元");
  }
  Edit.prototype.handleManageFeeInput = function (e) {
    var filter = e.target.dataset.filter;
    var total = 0;
    $(".car_manageFee").each(function (index, item) {
      total += item.value * 1;
    });
    $("#totalManageFee").text(total + "元");
  }
  Edit.prototype.bindEvents = function(){
    var _this = this;
    $("#driver_name").unbind().on("click", function(){
      _this.openSelectDriver();
    });
    $("#driver_name").on("blur", function(){
      setTimeout(function(){
        $('#match_driver_list').hide();
        $('#match_driver_list').remove();
      }, 1000);
    });
    $("#select_driver_btn").unbind().on("click", function () {
      _this.openSelectDriverTable();
    });
    $("#btn_confirm").unbind().on("click", function (e){
      _this.preSubmit();
    });
    $(".del_car_btn").unbind().on("click", function(e){
      _this.handleDeleteCar(e);
    });
    $("#btn_cancel").unbind().on("click", function (e) {
      xadmin.close();
    });
    $(".car_income").unbind().on("input", function (e) {
      _this.handleIncomeInput(e);
    });
    $(".car_manageFee").unbind().on("input", function (e) {
      _this.handleManageFeeInput(e);
    });
    $("#add_car").unbind().on("click", function(e){
      var carFormHtml = $("#car_info_tpl").html();
      var filterStr = "form_car_" + _this.carFormList.length;
      _this.carFormList.push(filterStr);
      var html = carFormHtml.replace(/CARFORM/g, filterStr);
      $("#car_form_container").append(html);
      form.render();
      $(".del_car_btn").unbind().on("click", function(e){
        _this.handleDeleteCar(e);
      });
      $(".car_income").unbind().on("input", function (e) {
        _this.handleIncomeInput(e);
      });
      $(".car_manageFee").unbind().on("input", function (e) {
        _this.handleManageFeeInput(e);
      });
      $(".select_vin").unbind().on("click", function (e) {
        _this.openSelectVin(e);
      });
      var index = _this.carFormList.length - 1;
      laydate.render({
        elem: $(".latestArriveTime")[index], //指定元素
        type: "datetime",
        trigger: "click"
      });
      upload.render({
        elem: $('.tempLicenseBackImage')[index],
        url: edipao.API_HOST + '/admin/truck/upload/image',
        data: {
          loginStaffId: _this.user.staffId,
          truckId: idToAdd,
          type: 1,
          index: 1
        },
        before: function () {
          if(!idToAdd){
            layer.msg('请先选择车辆', {icon: 5,anim: 6});
            return false;
          }
        },
        done: function (res) {
          if(res.code == 0){
            _this.tempLicenseBackImage[index] = {
              image: res.data,
              id: idToAdd
            };
            layer.msg("上传成功");
          }else{
            layer.msg(res.message, {icon: 5,anim: 6});
          }
        }
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