layui.use(['form', 'layer', 'laytpl', 'table', 'laydate', 'upload'], function () {
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
    this.carFormListBackUp = [];
    this.feeItemList = [];
    this.feeUnitItemList = ["元", "升"];
    this.prePay = [];
    this.arrivePay = [];
    this.tailPay = [];
    this.orderData = null;
    this.orderDataBackUp = null;
    this.carsToAdd = [];
    this.carsToDel = [];
    this.cars = [];
    this.tempLicenseBackImage = [];
    this.tempLicense = [];
    this.driverInfoListDto = [];
    this.staffList = [];
    this.driverTimer = null;
    this.loadingIndex = "";
    this.formList = [
      "form_ascription",
      "form_dispatch",
    ];
    this.hiddenMap = null;
    this.selectData = null;
    //数据权限
    this.dataPermission = edipao.getDataPermission();
    window.dataPermission = this.dataPermission;
  }
  Edit.prototype.getOrderJson = function(){
    return $.ajax({
      url: "js/order.json",
      dataType: "json"
    });
  }
  Edit.prototype.init = function(){
    var _this = this;
    _this.loadingIndex = layer.load(1);
    $.when(this.getStaffList(), this.getFeeItemList(), this.getFeeItemUnitList(), this.getOrder()).done(function (res1, res2, res3, res4) {
      res = res4[0];
      if(res.code == "0"){
        _this.orderDataBackUp = JSON.parse(JSON.stringify(res.data));
        _this.orderData = res.data;
        _this.setData(res.data);
        _this.bindEvents();

        // 默认地图初始化
        var point = new Careland.Point(419364916, 143908009);
        var map = new Careland.Map('hiddenMap', point, 12); 
        map.enableAutoResize(); 
        map.load();
        _this.hiddenMap = map;
        try {
          _this.renderHiddenMap(map);
        } catch (error) {}
      }else{
        layer.close(_this.loadingIndex);
        layer.msg(res.message, {icon: 5,anim: 6});
      }
    }).fail(function(){
      layer.close(_this.loadingIndex);
    });
    
  }
  Edit.prototype.setConfigData = function(cb, options){
    var _this = this;
    if(!_this.selectData){
      $.when(getCustomerList(), getEndAddressList(), getStartParkList(), getStartWarehouseList()).done(function (res1, res2, res3, res4) {
        $('.customerList').append(returnOptions(res1[0].data));
        if(options.flag&&options.city&&options.province) $(options.selector).removeAttr("disabled").append(returnOptions(res2[0].data));
        $('.startParkList').append(returnOptions(res3[0].data));
        $('.startWarehouseList').append(returnOptions(res4[0].data));
        _this.selectData = [res1[0].data, res2[0].data, res3[0].data, res4[0].data];
        cb && cb();
      });
    } else {
      $('.customerList').append(returnOptions(_this.selectData[0]));
      if(options.flag&&options.city&&options.province) $(options.selector).removeAttr("disabled").append(returnOptions(_this.selectData[1]));
      $('.startParkList').append(returnOptions(_this.selectData[2]));
      $('.startWarehouseList').append(returnOptions(_this.selectData[3]));
      cb && cb();
    }
    

    function returnOptions(array){
      var html = '';
      html = '<option value="请选择">请选择</option>'
      for(var i = 0; i < array.length; i ++){
        html += '<option value="' + array[i].name + '">' + array[i].name + '</option>';
      }

      return html;
    }
    // 获取客户名称
    function getCustomerList(){
      return edipao.request({
        url: "/admin/dictionary/getCustomerList",
        method: "GET",
        data: {
          loginStaffId: _this.user.staffId,
          pageNo: 1,
          pageSize: 9999
        }
      })
    }
    // 获取收车网点
    function getEndAddressList(){
      var data = {
          loginStaffId: _this.user.staffId,
          pageNo: 1,
        pageSize: 9999,
        }
      if(options.city&&options.province){
        data.endProvince = options.province;
        data.endCity = options.city;
      }
      return edipao.request({
        url: "/admin/dictionary/getEndAddressList",
        method: "GET",
        data: data
      })
    }
    //获取发车停车场
    function getStartParkList(){
      return edipao.request({
        url: "/admin/dictionary/getStartParkList",
        method: "GET",
        data: {
          loginStaffId: _this.user.staffId,
          pageNo: 1,
          pageSize: 9999
        }
      })
    }
    // 获取发车仓库
    function getStartWarehouseList(){
      return edipao.request({
        url: "/admin/dictionary/getStartWarehouseList",
        method: "GET",
        data: {
          loginStaffId: _this.user.staffId,
          pageNo: 1,
          pageSize: 9999
        }
      })
    }
  }

  Edit.prototype.renderHiddenMap = function(map){
    $.each($('.location-end-name'), function(i, d){
      var _this = $(this);
      var ac = new Careland.Autocomplete({
          input : "seach-location-input" + i,
          location : map
      });
      ac.setLocation(map);
      ac.setInputForm('seach-location-input' + i);
      ac.addEventListener("onConfirm",function(e){
        console.log(e.item.poi.gbpoint)
        _this.next().val(e.item.poi.gbpoint.lat).next().val(e.item.poi.gbpoint.lng);
        ac.hide();
      });
    });
    $.each($('.location-start-name'), function(i, d){
      var _this = $(this);
      var ac = new Careland.Autocomplete({
          input : "seach-location-input-start" + i,
          location : map
      });
      ac.setLocation(map);
      ac.setInputForm('seach-location-input-start' + i);
      ac.addEventListener("onConfirm",function(e){
        console.log(e.item.poi.gbpoint)
        _this.next().val(e.item.poi.gbpoint.lat).next().val(e.item.poi.gbpoint.lng);
        ac.hide();
      });
    });

  }
  Edit.prototype.getStaffList = function(){
    var _this = this;
    return edipao.request({
      url: "/admin/staff/list",
      method: "GET",
      data: {
        loginStaffId: _this.user.staffId,
        pageNo: 1,
        pageSize: 9999
      }
    }).done(function (res) {
      if(res.code == "0"){
        _this.staffList = res.data.staffDtoList;
      }
    });
  }
  Edit.prototype.addFeeItem = function (data) {
    //后台增加费用项
    var _this = this;
    return edipao.request({
      url: "/admin/feeItem/add",
      method: "POST",
      data: {
        loginStaffId: _this.user.staffId,
        name: data.addFeeName,
        unit: data.addFeeUnit
      }
    });
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
  Edit.prototype.setFeeList = function(flag, type, newObj){
    //保存费用项
    var _this = this;
    if(flag){
      var dispatchData = form.val("form_dispatch");
      if(type == "prePay"){
        _this.prePay = newObj;
      }else{
        _this.prePay = _this.prePay.map(function (item, index) {
          item.val = dispatchData["prePay_" + index] || 0;
          return item;
        });
      }
      if(type == "arrivePay"){
        _this.arrivePay = newObj;
      }else{
        _this.arrivePay = _this.arrivePay.map(function (item, index) {
          item.val = dispatchData["arrivePay_" + index] || 0;
          return item;
        });
      }
      if(type == "tailPay"){
        _this.tailPay = newObj;
      }else{
        _this.tailPay = _this.tailPay.map(function (item, index) {
          item.val = dispatchData["tailPay_" + index] || 0;
          return item;
        });
      }
    }
    if(_this.dataPermission.canViewOrderCost != "Y"){
      _this.prePay.forEach(function (item) {
        item.val = "*";
      });
      _this.arrivePay.forEach(function (item) {
        item.val = "*";
      });
      _this.tailPay.forEach(function (item) {
        item.val = "*";
      });
    }
    
    laytpl($("#fee_list_tpl").html()).render({
      prePay: _this.prePay,
      tailPay: _this.tailPay,
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
      var elem = obj.elem;
      if(elem.name == "unit"){
        var type = elem.dataset.type;
        var index = elem.dataset.index * 1;
        var value = elem.value;
        _this[type][index].unit = value;
      }else if(elem.name == "followOperatorPhone"){
        var name = obj.elem.selectedOptions[0].dataset.name;
        form.val("form_ascription", {followOperator: name});
      }
    });
  }
  Edit.prototype.setData = function(data){
    //渲染订单数据
    var _this =this;
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

    try {
      _this.orderDataBackUp.prePayFeeItems = JSON.parse(data.prePayFeeItems) || [];
    } catch (error) {
      _this.orderDataBackUp.prePayFeeItems = [];
    }
    try {
      _this.orderDataBackUp.tailPayFeeItems = JSON.parse(data.tailPayFeeItems) || [];
    } catch (error) {
      _this.orderDataBackUp.tailPayFeeItems = [];
    }
    try {
      _this.orderDataBackUp.arrivePayFeeItems = JSON.parse(data.arrivePayFeeItems) || [];
    } catch (error) {
      _this.orderDataBackUp.arrivePayFeeItems = [];
    }
    _this.setFeeList();

    laytpl($("#form_ascription_tpl").html()).render({orderData: _this.orderData, staffList: _this.staffList}, function (html) {
      $("#form_ascription_container").html(html);
      data.dispatchOperator = data.dispatchOperator + "," + data.dispatchOperatorPhone;
      data.followOperator = data.followOperator + "," + data.followOperatorPhone;
      data.deliveryOperator = data.deliveryOperator + "," + data.deliveryOperatorPhone;
      data.fetchOperator = data.fetchOperator + "," + data.fetchOperatorPhone;
      form.val("form_ascription", data);
    });

    if(_this. dataPermission.canViewOrderIncome != "Y"){
      data.totalIncome = "*";
      data.totalManageFee = "*";
    }

    laytpl($("#base_info_tpl").html()).render(data, function(html){
      $("#base_info").html(html);
    });
    laytpl($("#income_info_tpl").html()).render(data, function(html){
      $("#income_info").html(html);
      form.render();
    });
    if(data.driverId){
      form.val("form_dispatch", data);
    }else{
      form.val("form_dispatch", {driverMileage: data.driverMileage});
    }
    var carFormStr = "";
    var carFormHtml = $("#car_info_tpl").html();
    data.truckDTOList.forEach(function (item, index) {
      var filterStr = "form_car_" + index;
      _this.carFormListBackUp.push(filterStr);
      _this.carFormList.push({
        filter: filterStr,
        id: item.id,
        initial: true
      });
    });

    _this.carFormList.forEach(function (item, index) {
      var itemStr = carFormHtml;
      var truckData;
      try {
        data.truckDTOList[index] = data.truckDTOList[index] || "{}";
        truckData = JSON.parse(JSON.stringify(data.truckDTOList[index]))
      } catch (error) {}
      //数据权限处理
      if(_this. dataPermission.canViewOrderIncome != "Y"){
        truckData.pricePerMeliage = "*";
        truckData.income = "*";
        truckData.manageFee = "*";
      }

      itemStr = itemStr.replace(/CARFORM/g, item.filter);
      laytpl(itemStr).render(truckData, function (html) {
        carFormStr += html;
        if(index == _this.carFormList.length - 1){
          $("#car_form_container").html(carFormStr);
          renderEnd();
        }
      });
    });

    function renderEnd(){
      $.each($('.location-end-name'), function(i,d){
        $(this).attr({
          id: 'seach-location-input' + i
        })
      })
      $.each($('.location-start-name'), function(i,d){
        $(this).attr({
          id: 'seach-location-input-start' + i
        })
      })
      $.each($('.tempLicenseBackImageBox'), function(i,d){
        $(this).attr({
          id: 'tempLicenseBackImageBox' + i
        })
      })
      
      form.render();
      _this.carFormList.forEach(function (item, index) {
        var truckData;
        try {
          data.truckDTOList[index] = data.truckDTOList[index] || "{}";
          truckData = JSON.parse(JSON.stringify(data.truckDTOList[index]))
        } catch (error) {}
        if(_this.dataPermission.canViewOrderIncome != "Y"){
          truckData.pricePerMeliage = "*";
          truckData.income = "*";
          truckData.manageFee = "*";
        }
        _this.tempLicenseBackImage.push({
          image: truckData.tempLicenseBackImage,
          id: truckData.id,
          filter: item.filter
        });
        _this.tempLicense.push({
          image: truckData.tempLicense,
          id: truckData.id,
          filter: item.filter
        });
        laydate.render({
          elem: $(".latestArriveTime")[index], //指定元素
          type: "datetime",
          trigger: "click"
        });
        _this.renderUpload(index);
        _this.cars.push({
          id: truckData.id,
          filter: item.filter
        });
        truckData.masterFlag = truckData.masterFlag == "是"? '' : 'on';
        if(truckData.startCity && truckData.startCity.indexOf('-') > -1){
          truckData.startProvince = truckData.startCity.split('-')[0]
          truckData.startCity = truckData.startCity.split('-')[1]
        }
        if(truckData.tempLicenseBackImage){
          $('#tempLicenseBackImageBox' + index).find('img').attr('src', truckData.tempLicenseBackImage + '?' + Math.floor(Math.random() * 10e6))
        }
        _this.setStartSelectCity(truckData);
        _this.setEndSelectCity(truckData);
        _this.setConfigData(function(){
          form.val(item.filter, truckData);
          form.render('select');
          layer.close(_this.loadingIndex);
          $("[lay-filter=" + item.filter + "] .select_vin").remove();
        }, {
          flag: true,
          province: truckData.endProvince,
          city: truckData.endCity,
          selector: "." + item.filter + "_endCity_select"
        });
      });
      
      _this.bindInputLimit();
      _this.getMapAddress();
    }
  }
  Edit.prototype.renderUpload = function(index){
    var _this = this;
    var data = _this.orderData;
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
        var boxIndex = index;
        var filter = "form_car_" + index;
        _this.tempLicenseBackImage.forEach(function (item, index2) {
          if(item.filter == filter) index = index2;
        });
        if(res.code == 0){
          _this.tempLicenseBackImage[index].id = data.truckDTOList[index].id;
          _this.tempLicenseBackImage[index].image = res.data;
          $('#tempLicenseBackImageBox' + boxIndex).find('img').attr('src', res.data + '?' + Math.floor(Math.random() * 10e6))
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
  Edit.prototype.openUpdateFee = function (e, event, layerIndex1) {
    var _this = this;
    var index = event.target.dataset.index*1;
    laytpl($("#update_fee_tpl").html()).render({oldName: _this.feeItemList[index].value}, function (html) {
      var index = layer.open({
        title: "修改费用项",
        type: 1,
        area: "400px",
        content: html,
        btn: ['确定', '取消'],
        yes: function () {
          var loadIndex = layer.load(1);
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
                layer.close(index);
                layer.close(layerIndex1);
                setTimeout(function(){
                  _this.openAddFee(e);
                  layer.msg("修改成功");
                  layer.close(loadIndex);
                }, 500);
              });
            }else{
              layer.close(loadIndex);
            }
          }).fail(function () {
            layer.close(loadIndex);
          });
        }
      })
    });
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
      if(list.includes(item.value)){
        item.checked = true;
        feeList.push(item);
      }else{
        item.checked = false;
        feeList.push(item);
      }
    });
    laytpl($("#fee_tpl").html()).render({feeList: feeList, type: type}, function(html){
      var layerIndex1 = layer.open({
        title: "增加费用",
        type: 1,
        area: '600px',
        content: html,
        btn:["确认", "取消"],
        yes: function (e) {
          var data = form.val("add_fee_form");
          var dispatchData = form.val("form_dispatch");
          if(type == "prePay"){
            _this.prePay = _this.prePay.map(function (item, index) {
              item.val = dispatchData["prePay_" + index] || 0;
              return item;
            });
          }
          if(type == "arrivePay"){
            _this.arrivePay = _this.arrivePay.map(function (item, index) {
              item.val = dispatchData["arrivePay_" + index] || 0;
              return item;
            });
          }
          if(type == "tailPay"){
            _this.tailPay = _this.tailPay.map(function (item, index) {
              item.val = dispatchData["tailPay_" + index] || 0;
              return item;
            });
          }
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
              });
            }else{
              newObj.push(_this[type][oldList.indexOf(item)])
            }
          });
          _this[type] = newObj;
          _this.setFeeList(true, type, newObj);
          $(".add_fee").unbind().on("click", function (e) {
            _this.openAddFee(e);
          });
          layer.closeAll();
        },
        success:function () {
          form.render("checkbox");
          $(".edit_icon").unbind().on("click", function (event) {
            event.target.dataset.type = type;
            _this.openUpdateFee(e, event, layerIndex1);
          });
          console.log($("#add_fee_item"))
          $("#add_fee_item").unbind().on("click", function(event){
            _this.openAddFeeItem(e, layerIndex1);
          });
        }
      });
    });
  }
  Edit.prototype.openAddFeeItem = function (event, layerIndex1) {
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
          var loadIndex = layer.load(1);
          _this.addFeeItem(data).done(function (res) {
            if(res.code == "0"){
              $('#addFeeName').val("");
              layer.close(layerIndex1);
              layer.close(layerIndex2);
              layer.msg("添加成功");
              // return;
              _this.getFeeItemList().done(function (res) {
                layer.close(loadIndex);
                if(res.code == "0"){
                  _this.feeItemList = res.data;
                  setTimeout(function(){
                    _this.openAddFee(event);
                    layer.msg("添加成功");
                  }, 500);
                }else{
                  layer.msg(res.message, {icon: 5,anim: 6});
                }
              });
            }else{
              layer.close(loadIndex);
              layer.msg(res.message, {icon: 5,anim: 6});
            }
          }).fail(function () {
            layer.close(loadIndex);
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
        $(".layui-layer-content").html("");
        
      },1500);
      return;
    }else if(addCarsFlag){
      layer.msg("车辆已存在", {icon: 5,anim: 6});
      setTimeout(function () { 
        layer.closeAll();
        $(".layui-table-view[lay-id=cars_table]").remove();
        $(".layui-layer-content").html("");

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
          $(".layui-layer-content").html("");

          layer.closeAll();
          form.val(filter, data);
        }else{
          layer.msg(res.message, {icon: 5,anim: 6});
        }
      });
      return;
    }
    $(".layui-table-view[lay-id=cars_table]").remove();
    $(".layui-layer-content").html("");
    layer.closeAll();
    $("#tables_container").html($("#tables_tpl").html());
    form.val(filter, data);
  }
  Edit.prototype.handleDeleteCar = function (e) {
    var _this = this;
    var filter = e.target.dataset.filter;
    var initialLength = 0;
    var delInitialFlag = false;
    _this.carFormList.forEach(function (item) {
      if(item.initial) initialLength ++;
      if(item.filter == filter && item.initial) delInitialFlag = true;
    });
    if(_this.carFormList.length <= 1){
      layer.alert("不能删除唯一车辆信息", {icon: 2})
      return;
    }
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
      if(item.filter == filter) carFormListIndex = index;
    });
    _this.carFormList.splice(carFormListIndex, 1);
    _this.tempLicenseBackImage = _this.tempLicenseBackImage.filter(function (item) {
      return item.filter != filter;
    });
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
          if(_this.carFormList.length == 0){
            layer.alert("订单中已没有车辆，订单将会被取消", { icon: 6 }, function() {
              edipao.request({
                url: "/admin/order/cancelOrder",
                method: "post",
                data: {loginStaffId: _this.user.staffId, id: _this.orderId}
              }).done(function(res){
                if(res.code == 0){
                    layer.msg("订单已取消");
                    xadmin.father_reload();
                    xadmin.close();
                }
              });
            });
          }
        }else{
          layer.msg(res.message, {icon: 5,anim: 6});
        }
      });
      return;
    }else{
      $("." + filter).remove();
      if(_this.carFormList.length == 0){
        layer.alert("订单中已没有车辆，订单将会被取消", { icon: 6 }, function() {
          edipao.request({
            url: "/admin/order/cancelOrder",
            method: "post",
            data: {loginStaffId: _this.user.staffId, id: _this.orderId}
          }).done(function(res){
            if(res.code == 0){
              $("." + filter).remove();
              layer.msg("订单已取消");
              xadmin.father_reload();
              xadmin.close();
            }
          });
        });
      }
    }
  }
  Edit.prototype.preSubmit = function () {
    var _this = this;
    var truckUpdateReqList = [];
    var orderData = JSON.parse(JSON.stringify(_this.orderData));
    var data = {};
    var truckDTOList;
    try {
      JSON.parse(JSON.stringify(orderData.truckDTOList));
    } catch (error) {
      truckDTOList = [];
    }
    delete orderData.truckDTOList;
    var ascriptionData = form.val("form_ascription");
    ascriptionData.dispatchOperator = ascriptionData.dispatchOperator.split(",");
    ascriptionData.fetchOperator = ascriptionData.fetchOperator.split(",");
    ascriptionData.deliveryOperator = ascriptionData.deliveryOperator.split(",");
    ascriptionData.followOperator = ascriptionData.followOperator.split(",");
    ascriptionData.dispatchOperatorPhone = ascriptionData.dispatchOperator[1];
    ascriptionData.dispatchOperator = ascriptionData.dispatchOperator[0];
    ascriptionData.fetchOperatorPhone = ascriptionData.fetchOperator[1];
    ascriptionData.fetchOperator = ascriptionData.fetchOperator[0];
    ascriptionData.deliveryOperatorPhone = ascriptionData.deliveryOperator[1];
    ascriptionData.deliveryOperator = ascriptionData.deliveryOperator[0];
    ascriptionData.followOperatorPhone = ascriptionData.followOperator[1];
    ascriptionData.followOperator = ascriptionData.followOperator[0];


    var dispatchData = form.val("form_dispatch");
    _this.prePay = _this.prePay.map(function (item, index) {
      item.val = dispatchData["prePay_" + index] || 0;
      return item;
    });
    _this.arrivePay = _this.arrivePay.map(function (item, index) {
      item.val = dispatchData["arrivePay_" + index] || 0;
      return item;
    });
    _this.tailPay = _this.tailPay.map(function (item, index) {
      item.val = dispatchData["tailPay_" + index] || 0;
      return item;
    });

    var totalIncome = 0;
    var totalManageFee = 0;
    var carsLength = $(".car_info_form").length;
    _this.carFormList.forEach(function (item, index) {
      var itemData = form.val(item.filter);
      if(!itemData.id && itemData.id != 0) return;
      totalIncome += itemData.income * 1;
      totalManageFee += itemData.manageFee * 1;
      console.log(itemData)
      var truckItem = {
        truckId: itemData.id||0,
        masterFlag: itemData.masterFlag == "on" ? "否" : "是",
        vinCode: itemData.vinCode||"",
        productCode: itemData.productCode||"",
        gpsDeviceCode: itemData.gpsDeviceCode||"",
        customerFullName: itemData.customerFullName||"",
        startWarehouse: itemData.startWarehouse||"",
        warehouseNo: itemData.warehouseNo||"",
        startPark: itemData.startPark||"",
        startProvince: itemData.startProvince||"",
        startCity: itemData.startCity ||"",
        startAddress: itemData.startAddress||"",
        startLat: itemData.startLat||"",
        startLng: itemData.startLng||"",
        settleWay: itemData.settleWay||"",
        shaftNum: itemData.shaftNum,
        model: itemData.model,
        power: itemData.power,
        endPark: itemData.endPark||"",
        endProvince: itemData.endProvince ||"",
        endCity: itemData.endCity ||"",
        endLat: itemData.endLat||"",
        endLng: itemData.endLng||"",
        endAddress: itemData.endAddress||"",
        connectorName: itemData.connectorName||"",
        connectorPhone: itemData.connectorPhone||"",
        latestArriveTime: itemData.latestArriveTime||"",
        customerMileage: itemData.customerMileage||"",
        pricePerMeliage: itemData.pricePerMeliage||0,
        income: itemData.income||0,
        manageFee: itemData.manageFee||0,
        tempLicense: itemData.tempLicense,
        tempLicenseBackImage: _this.tempLicenseBackImage[index].image || itemData.tempLicenseBackImage,
        saleRemark: itemData.saleRemark||"",
        storageAndDeliverRemark: itemData.storageAndDeliverRemark||"",
        dealerRemark: itemData.dealerRemark||"",
        deliverResourceRemark: itemData.deliverResourceRemark,
        transportRemark: itemData.transportRemark||"",
      }
      if(_this. dataPermission.canViewOrderIncome != "Y"){
        if(_this.orderDataBackUp.truckDTOList[index]){
          truckItem.income = _this.orderDataBackUp.truckDTOList[index].income;
        }else{
          truckItem.income = "";
        }
        if(_this.orderDataBackUp.truckDTOList[index]){
          truckItem.pricePerMeliage = _this.orderDataBackUp.truckDTOList[index].pricePerMeliage;
        }else{
          truckItem.pricePerMeliage = "";
        }
        if(_this.orderDataBackUp.truckDTOList[index]){
          truckItem.manageFee = _this.orderDataBackUp.truckDTOList[index].manageFee;
        }else{
          truckItem.manageFee = "";
        }
      }
      truckUpdateReqList.push(truckItem);
    });
    data.id = _this.orderId;
    data.loginStaffId = _this.user.staffId || "";
    data.orderNo = _this.orderNo || "";
    data.orderType = carsLength > 1 ? 2 : 1;
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
    data.driverMileage = (dispatchData.driverMileage*1).toFixed(2) || "";
    
    if(_this. dataPermission.canViewOrderIncome != "Y"){
      data.totalIncome = _this.orderDataBackUp.totalIncome || "";
      data.totalManageFee = _this.orderDataBackUp.totalManageFee || "";
    }else{
      data.totalIncome = totalIncome || 0;
      data.totalManageFee = totalManageFee || 0;
    }

    var pres = JSON.parse(JSON.stringify(_this.prePay));
    var arrives = JSON.parse(JSON.stringify(_this.arrivePay));
    var tails = JSON.parse(JSON.stringify(_this.tailPay));
    
    //费用项
    if(_this.dataPermission.canViewOrderCost != "Y"){
      pres = _this.orderDataBackUp.prePayFeeItems;
      arrives = _this.orderDataBackUp.arrivePayFeeItems;
      tails = _this.orderDataBackUp.tailPayFeeItems;
    }
    var feeItemErrorFlag = false;
    pres.forEach(function(item){
      if(!item.val || item.val * 1 == 0 || item.val * 1 < 0) feeItemErrorFlag = true;
    });
    arrives.forEach(function(item){
      if(!item.val || item.val * 1 == 0 || item.val * 1 < 0) feeItemErrorFlag = true;
    });
    tails.forEach(function(item){
      if(!item.val || item.val * 1 == 0 || item.val * 1 < 0) feeItemErrorFlag = true;
    });
    if(feeItemErrorFlag){
      layer.msg("收费项金额不正确", {icon: 2});
      return;
    }
    data.prePay = JSON.stringify(pres);
    data.arrivePay = JSON.stringify(arrives);
    data.tailPay = JSON.stringify(tails);

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
    // var hasLatAndLng = true;
    // for(var i = 0; i < truckUpdateReqList.length; i ++){
    //   if(!truckUpdateReqList[i].endLat || !truckUpdateReqList[i].endLng){
    //     hasLatAndLng = false;
    //     break;
    //   }
    // }
    // if(!hasLatAndLng){
    //   layer.msg("请选择正确的收车地址");
    //   return;
    // }
    if(!_this.veriftParams(data)) return;
    var loadIndex = layer.load(1);
    _this.submitAll(edipao.request({
      url: "/admin/order/updateOrder",
      method: "POST",
      data: getParams(data),
    }), loadIndex);
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
  Edit.prototype.veriftParams = function (data) {
    //校验必传参数
    var flag = true;
    data.truckUpdateReqList.some(function (item) {
      if(!item.tempLicense){
        layer.msg("临牌号为必填项", {icon: 2});
        flag = false;
        return true;
      }
      if(!item.settleWay){
        layer.msg("结算方式为必填项", {icon: 2});
        flag = false;
        return true;
      }
      if(!item.tempLicenseBackImage){
        layer.msg("请上传行驶证", {icon: 2});
        flag = false;
        return true;
      }
      // if(!item.income && _this.dataPermission.canViewOrderIncome == "Y"){
      //   layer.msg("车辆收入为必填项", {icon: 2});
      //   flag = false;
      //   return true;
      // }
      // if(!item.pricePerMeliage && _this.dataPermission.canViewOrderIncome == "Y"){
      //   layer.msg("收入单价为必填项", {icon: 2});
      //   flag = false;
      //   return true;
      // }
      // if(!item.manageFee && _this.dataPermission.canViewOrderIncome == "Y"){
      //   layer.msg("管理费为必填项", {icon: 2});
      //   flag = false;
      //   return true;
      // }
    });
    return flag;
  }
  Edit.prototype.submitAll = function(req1, loadIndex){
    var _this = this;
    var reqs = [];
    req1.done(function (res) {
      layer.close(loadIndex);
      if(res.code == "0"){
        layer.alert("修改成功", {icon: 6}, function(){
          xadmin.close();
          xadmin.father_reload();
        });
      }else{
        layer.msg(res.message, {icon: 5,anim: 6});
      }
    }).fail(function () {
      layer.close(loadIndex);
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
        if(res.data.length < 1)return;
        _this.driverInfoListDto = res.data;
        laytpl($("#driver_list_tpl").html()).render({list: res.data}, function (html) {
          $("#driver_select_item_container").html(html);
          $(".driver_item").on("click", function (e) {
            var index = e.target.dataset.index * 1;
            if(index != "none") {
              var data = _this.driverInfoListDto[index];
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
      area: ["600px", "400px"],
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
            //$(".layui-layer-content").html("");
            $(".layui-table-view[lay-id=drivers_table]").remove();
            layer.close(index);
            $("#tables_container").html($("#tables_tpl").html());
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
  Edit.prototype.setStartSelectCity = function(data){
    var province = $(".startProvince"),
      city = $(".startCity");
      // district = $("#district");
    
    //初始将省份数据赋予
    for (var i = 0; i < provinceList.length; i++) {
      addEle(province, provinceList[i].name);
    }
    
    
    //赋予完成 重新渲染select
    form.render('select');
    
    //向select中 追加内容
    function addEle(ele, value) {
      var optionStr = "";
      optionStr = "<option value=" + value + " >" + value + "</option>";
      ele.append(optionStr);
    }

    //移除select中所有项 赋予初始值
    function removeEle(ele) {
      ele.find("option").remove();
      var optionStar = "<option value=" + "0" + ">" + "请选择" + "</option>";
      ele.append(optionStar);
    }
    
    var provinceText = !data ? '' : data.startProvince,
      cityText = !data ? '' : data.startCity,
      cityItem;

    //初始将城市数据赋予
    $.each(provinceList, function(i, item) {
      if (provinceText == item.name) {
        console.log(provinceList[i].cityList)
        for (var j = 0; j < provinceList[i].cityList.length; j++) {
          addEle(city, provinceList[i].cityList[j].name);
        }
      }
    });
    
    //选定省份后 将该省份的数据读取追加上
    form.on('select(startProvince)', function(data) {
      provinceText = data.value;
      $.each(provinceList, function(i, item) {
        if (provinceText == item.name) {
          cityItem = i;
          return cityItem;
        }
      });
      removeEle(city);
      // removeEle(district);
      $.each(provinceList[cityItem].cityList, function(i, item) {
        addEle(city, item.name);
      })
      console.log(province)
      console.log(provinceText)
      //重新渲染select 
      form.render('select');
    });

    ////选定市或直辖县后 将对应的数据读取追加上
    form.on('select(startCity)', function(data) {
      cityText = data.value;
      // removeEle(district);
      $.each(provinceList, function(i, item) {
        if (provinceText == item.name) {
          cityItem = i;
          return cityItem;
        }
      });
      console.log(cityText)
      // $.each(provinceList[cityItem].cityList, function(i, item) {
      //   if (cityText == item.name) {
      //     for (var n = 0; n < item.areaList.length; n++) {
      //       addEle(district, item.areaList[n]);
      //     }
      //   }
      // })
      //重新渲染select 
      form.render('select');
    });

  }
  Edit.prototype.setEndSelectCity = function(data){
    var _this = this;
    var province = $(".endProvince"),
      city = $(".endCity");
      // district = $("#district");
    
    //初始将省份数据赋予
    for (var i = 0; i < provinceList.length; i++) {
      addEle(province, provinceList[i].name);
    }
    
    //赋予完成 重新渲染select
    form.render('select');
    
    //向select中 追加内容
    function addEle(ele, value) {
      var optionStr = "";
      optionStr = "<option value=" + value + " >" + value + "</option>";
      ele.append(optionStr);
    }

    //移除select中所有项 赋予初始值
    function removeEle(ele) {
      ele.find("option").remove();
      var optionStar = "<option value=" + "0" + ">" + "请选择" + "</option>";
      ele.append(optionStar);
    }

    var provinceText = !data ? '' : data.endProvince,
      cityText = !data ? '' : data.endCity,
      cityItem;

    //初始将城市数据赋予
    $.each(provinceList, function(i, item) {
      if (provinceText == item.name) {
        for (var j = 0; j < provinceList[i].cityList.length; j++) {
          addEle(city, provinceList[i].cityList[j].name);
        }
      }
    });
    
    //选定省份后 将该省份的数据读取追加上
    form.on('select(endProvince)', function(data) {
      var $productSelector = $("."+data.elem.dataset.filter+"_endCity_select");
      provinceText = data.value;
      $.each(provinceList, function(i, item) {
        if (provinceText == item.name) {
          cityItem = i;
          return cityItem;
        }
      });
      removeEle($productSelector);
      removeEle(city);
      // removeEle(district);
      $.each(provinceList[cityItem].cityList, function(i, item) {
        addEle(city, item.name);
      })
      //重新渲染select 
      form.render('select');
    })

    ////选定市或直辖县后 将对应的数据读取追加上
    form.on('select(endCity)', function(data) {
      cityText = data.value;
      $.each(provinceList, function(i, item) {
        if (provinceText == item.name) {
          cityItem = i;
          return cityItem;
        }
      });
      _this.setEndAddressSelect(data.elem.dataset.filter);
      form.render('select');
    });
  }
  Edit.prototype.setEndAddressSelect = function (filter) {
    //关联选择网点
    var _this = this;
    var data = form.val(filter);
    var province = data.endProvince;
    var city = data.endCity;
    var $selecter = $("."+filter+"_endCity_select");
    getEndAddressList().done(function (res) {
      if(res.code == "0"){
        $selecter.html(returnOptions(res.data));
        $selecter.removeAttr("disabled");
        form.render("select");
      }
    });

    function returnOptions(array){
      var html = '';
      html = '<option value="请选择">请选择</option>';
      for(var i = 0; i < array.length; i ++){
        html += '<option value="' + array[i].name + '">' + array[i].name + '</option>';
      }
      return html;
    }
    // 获取收车网点
    function getEndAddressList(){
      return edipao.request({
        url: "/admin/dictionary/getEndAddressList",
        method: "GET",
        data: {
          loginStaffId: _this.user.staffId,
          pageNo: 1,
          pageSize: 9999,
          endProvince: province,
          endCity: city
        }
    })
  }
  }
  Edit.prototype.getMapAddress = function(){
    $('.getAddressList').unbind('input').bind('input', function(){
      $('.addressList').remove();
      if($(this).val() == '') return;
      var _t = $(this);
      $.getJSON('http://api.careland.com.cn/api/v1/search/keyword?keyword=' + $(this).val() + '&ak=6012dcd6278a2d4db3840604&xytype=2',function(json){          
          // 提交保存json
          if(json.errorCode != 0 ){
              layer.msg(json.errorMessage, {
                  time: 1500,
              });
              return;
          }
          
          _t.parent().parent().append('<div class="addressList">'+ getItem(json.pois) + '</div>');

          function getItem(pois){
            var content = '';
            if(pois.length > 0){
              $('.empty') && $('.empty').remove();
              for(var i = 0; i < pois.length; i ++ ){
                content += '<div class="item">' +  pois[i].address + '</div>';
              }
            } else {
              content = '<div class="empty">暂无数据</div>'
            }
            
            return content;
          }

          $('.addressList .item').click(function(){
            $(this).parents('.address-map').find('input').val($(this).text())
            $('.addressList') && $('.addressList').remove();
          })

      });
      
    })
    $('.getAddressList').blur(function(){
      setTimeout(function(){
        $('.addressList') && $('.addressList').remove();
      }, 500)
    })
  }
  Edit.prototype.bindInputLimit = function () {
    $(".vinCode_input").on("input", function (e) {
      if(e.target.value.length > 17) e.target.value = e.target.value.slice(0, 17);
    });
    $(".productCode_input").on("input", function (e) {
      if(e.target.value.length > 17) e.target.value = e.target.value.slice(0, 17);
    });
  }
  Edit.prototype.getProductInfo = function (e) {
    var code, _this = this, filter = e.target.dataset.filter;
    if(e.target.value && e.target.value.length > 0){
      code = e.target.value;
      edipao.request({
        method: "GET",
        url: "/admin/truck/parse/truckattr",
        data: {
          loginStaffId: _this.user.staffId,
          truckType: code
        }
      }).done(function(res){
        if(res.code == "0"){
          form.val(filter, {
            model: res.data.modelDesc,
            shaftNum: res.data.axlesDesc,
            power: res.data.horsepowerDesc
          });
        }
      });
    }
  }
  Edit.prototype.bindEvents = function(){
    var _this = this;
    $(".select_operator_btn").unbind().on("click", function (e) {
      var field = e.target.dataset.field;
      var index = layer.open({
        type: 1,
        area: ["500px","400px"],
        title: "选择员工",
        content: $("#staffList_table"),
        success: function () {
          table.render({
            elem: '#staffList_table'
            , url: layui.edipao.API_HOST+'/admin/staff/list'
            // , url: "js/cars.json"
            , method: "get" // 请求方式  默认get
            , page: true //开启分页
            , limit: 10  //每页显示条数
            , limits: [10, 20] //每页显示条数可选择
            , id: "staffList_table"
            , request: {
                pageName: 'pageNo' //页码的参数名称，默认：page
                , limitName: 'pageSize' //每页数据量的参数名，默认：limit
            }
            , where: {
              loginStaffId: _this.user.staffId,
            }
            , parseData: function (res) {
              return {
                  "code": res.code, //解析接口状态
                  "msg": res.message, //解析提示文本
                  "count": res.data.totalSize, //解析数据长度
                  "data": res.data.staffDtoList //解析数据列表
              }
          }
          , done: function () {
            table.on('row(staffList_table)', function(obj){
              var data = obj.data;
              data[field] = obj.data.name + "," + obj.data.phone;
              form.val("form_ascription", data);
              $(".layui-table-view[lay-id=staffList_table]").remove();
              layer.close(index);
              //$(".layui-layer-content").html("");
              $("#tables_container").html($("#tables_tpl").html());
            });
          }
            , height: 'full'
            , autoSort: true
            , text: {
                none: "暂无数据"
            }
            , cols: [[
                {field: 'name', title: '员工姓名', sort: false, width: 100},
                {field: 'phone', title: '员工手机', sort: false, width: 120},
                { field: 'dept', title: '所属部门', width: 100, templet: function(d){
                  return d.dept || '--'
                } },
                {field: 'status', title: '状态', sort: false,},
            ]]
          });
        },
        cancel: function () {
          $(".layui-table-view[lay-id=staffList_table]").remove();
        }
      });
    });
    $("#driver_name").unbind().on("click", function(){
      _this.openSelectDriver();
    });
    $("#driver_name").on("input", function (e) {
      var name = e.target.value;
      _this.driverTimer = setTimeout(function () {
        edipao.request({
          url: "/admin/driver/info/list?pageNumber=1&pageSize=100&searchFieldDTOList%5B0%5D.fieldName=name&searchFieldDTOList%5B0%5D.fieldValue=" + name,
          method: "GET",
        }).done(function (res) {
          if(res.code == "0"){
            if(!res.data) return;
            if(!res.data.driverInfoListDtoList || res.data.driverInfoListDtoList.length < 0) return;
            _this.driverInfoListDto = res.data.driverInfoListDtoList;
            laytpl($("#driver_list_tpl").html()).render({list: res.data.driverInfoListDtoList}, function (html) {
              $("#driver_select_item_container").html(html);
              $(".driver_item").unbind().on("click", function (e) {
                var index = e.currentTarget.dataset.index;
                if(index != "none") {
                  console.log(_this.driverInfoListDto, index)
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
                $('#match_driver_list').hide();
              });
            });
          }
        });
      }, 500);
    });
    $(document).on("click", function (e) {
      if(!$(e.target).hasClass("driver_item")){
        $('#match_driver_list').hide();
      }
    });
    $("#select_driver_btn").unbind().on("click", function () {
      $('#match_driver_list').hide();
      $('#match_driver_list').remove();
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
    $(".product_code").unbind().on("blur", function (e) {
      _this.getProductInfo(e);
    });
    $("#add_car").unbind().on("click", function(e){
      var carFormHtml = $("#car_info_tpl").html();
      var filterStr = "form_car_" + _this.carFormListBackUp.length;
      _this.carFormList.push({
        filter: filterStr,
        id: ""
      });
      _this.tempLicenseBackImage.push({
        id: "",
        filter: filterStr,
        image: ""
      });
      _this.carFormListBackUp.push(filterStr);
      var html = carFormHtml.replace(/CARFORM/g, filterStr);
      var addRenderData = {}
      if(_this.dataPermission.canViewOrderIncome != "Y"){
        addRenderData = {
          income: "*",
          pricePerMeliage: "*",
          manageFee: "*"
        }
      }
      laytpl(html).render(addRenderData, function(html2){
        $("#car_form_container").append(html2);
        $.each($('.location-end-name'), function(i,d){
          $(this).attr({
            id: 'seach-location-input' + i
          })
        })
        $.each($('.location-start-name'), function(i,d){
          $(this).attr({
            id: 'seach-location-input-start' + i
          })
        })
        
        $.each($('.tempLicenseBackImageBox'), function(i,d){
          $(this).attr({
            id: 'tempLicenseBackImageBox' + i
          })
        })
        try {
          _this.renderHiddenMap(_this.hiddenMap);
        } catch (error) {}
        form.render();
        _this.setStartSelectCity();
        _this.setEndSelectCity();
        _this.setConfigData(function(){
          form.render('select');
        }, {
          flag: false,
          province: '',
          city: '',
          selector: "." + filterStr + "_endCity_select"
        });
        _this.getMapAddress();
        $(".vinCode_input").unbind().on("input", function (e) {
          if(e.target.value.length > 17) e.target.value = e.target.value.slice(0, 17);
        });
        $(".productCode_input").unbind().on("input", function (e) {
          if(e.target.value.length > 17) e.target.value = e.target.value.slice(0, 17);
        });
        $(".product_code").unbind().on("blur", function (e) {
          _this.getProductInfo(e);
        });
        _this.showMap();
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
          layer.alert("没有数据");
          return;
          _this.openSelectVin(e);
        });
        var index = _this.carFormList.length - 1;
        _this.tempLicense.push({
          id: "",
          image: ""
        });
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
            truckId: _this.carFormList[index].id||"",
            type: 1,
            index: 1
          },
          done: function (res) {
            if(res.code == 0){
              _this.tempLicenseBackImage[index] = {
                image: res.data,
                id: _this.carFormList[index].id || "",
                filter: _this.carFormList[index].filter
              };
              $('#tempLicenseBackImageBox' + index).find('img').attr('src', res.data + '?' + Math.floor(Math.random() * 10e6))
              layer.msg("上传成功");
            }else{
              layer.msg(res.message, {icon: 5,anim: 6});
            }
          }
        });
      });
    });
    $(".add_fee").unbind().on("click", function (e) {
      _this.openAddFee(e);
    });
    $(".select_vin").unbind().on("click", function (e) {
      // layer.alert("没有数据");
      // return;
      _this.openSelectVin(e);
    });

    var currentAddress = '';
    $('.location-end-name').focus(function (e) {
      currentAddress = $(this).val()
    });
    $('.location-end-name').on("input", function (e) {
      if(currentAddress !== $(this).val()){
        $(this).next().val('').next().val('');
      }
    });
    $('.location-start-name').focus(function (e) {
      currentAddress = $(this).val()
    });
    $('.location-start-name').on("input", function (e) {
      if(currentAddress !== $(this).val()){
        $(this).next().val('').next().val('');
      }
    });

    _this.showMap();
    
  }

  Edit.prototype.showMap = function(){
    $('.selectMapLocation').unbind('click').on('click', function(e){
      var field = e.target.dataset.field;
      $('#seachLocation').val('');
      $('#select-address').text('');
      var _t = $(this);
      var address = '';
      var height = $(document).scrollTop()
      $('html,body').animate({scrollTop:0},100);
      layer.open({
        type: 1,
        title: "选择位置",
        area: ['900px', '500px'],
        content: $("#select-map-dialog"),
        btn: ['取消', '确定'],
        btnAlign: 'c',
        scrollbar: false,
        zIndex: 9991, //层优先级
        cancel: function () {
          address = '';
          $('#seachLocation').val('');
          $('#select-address').text('');
        },
        btn2: function(){
          if(!$('#seachLocation').val()){
            layer.msg("请选择地址");
            return false;
          }
          console.log(address, field)
          if(field == "start"){
            _t.parents('.address-map').find('.location-start-name').val(address.name).next().val(address.lat).next().val(address.lng);
          }else{
            _t.parents('.address-map').find('.location-end-name').val(address.name).next().val(address.lat).next().val(address.lng);
          }
          //address = '';
          $('#seachLocation').val('');
          $('#select-address').text('');
        },
        success: function () {
          //凯立德地图API功能
          var point = new Careland.Point(419364916, 143908009);
          var map = new Careland.Map('select-map', point, 15); 
          map.enableAutoResize();      
          map.load();
          regionMapView(map, $(this));
          
        },
        end: function(){
          $('html,body').animate({scrollTop:height},100);
        }
      })

      // 获取点击点的坐标数据
      function regionMapView(map, ctx){
          var myGeo = new Careland.Geocoder();

          var layer = new Careland.Layer('point', 'layer');
          var style = new Careland.PointStyle({offsetX:-11,offsetY:-30,textOffsetX:-5,textOffsetY:-30,src:'https://www.d.edipao.cn/admin/images/center.png',fontColor:'#000'});
          layer.setStyle(style);
          map.addLayer(layer);

          var mapInfoWin = new Careland.InfoWindow();
          mapInfoWin.setOffset(new Careland.Size(0, -22));

          var ac = new Careland.Autocomplete({
            input : "seachLocation",
            location : map
          });
          ac.setLocation(map);
          ac.setInputForm('seachLocation');
          ac.addEventListener("onConfirm",function(e){
            mapInfoWin.close();
            $('#select-address').text(e.item.poi.name);
            mapInfoWin.setContent('当前地址：' + e.item.poi.name);
            try {
              mapInfoWin.redraw();
            } catch (error) {}
            layer.clear();
            //创建文本标注点
            var marker = new Careland.Marker('image');
            marker.setPoint(e.item.poi.point);
            layer.add(marker);
            marker.openInfoWindow(mapInfoWin);
            address = {
              name: e.item.poi.name,
              address: e.item.poi.address,
              lat: e.item.poi.pointGb.lat,
              lng: e.item.poi.pointGb.lng,
            }
            map.centerAndZoom(e.item.poi.point, 15);
          });

          $('#regionMapPoint').off('click').on('click', function(){
              var searchTxt = $('#seachLocation').val();
              var poiSearch = new Careland.LocalSearch(map,{
                  map: map,
                  selectFirstResult:false,
                  autoViewport:true,
                  onMarkersSet: function(pois){
                      layui.each(pois, function(v, k){
                          var marker = k.marker;
                          marker.addEventListener('click', function(e){
                            e.event.defaultPrevented = true;
                            layer.clear();
                            myGeo.getLocation(e.point,function(data){
                              setViewData(mapInfoWin, marker, data, ctx)
                            });
                          })
                      })
                  },
              });
              poiSearch.search(searchTxt);
          })

            
          map.addEventListener('click', function(point){
              var point = point;
              if(!point || typeof (point) != "object"){
                return;
              }
              myGeo.getLocation(point,function(data){
                layer.clear();
                //创建文本标注点
                var marker = new Careland.Marker('image');
                marker.setPoint(point);
                layer.add(marker);

                setViewData(mapInfoWin, marker, data, ctx);
              });
              
          });

      }
      // 设置视图显示和数据
      function setViewData(mapInfoWin, marker, data, ctx){
        $('#seachLocation').val(data.address);
        $('#select-address').text(data.address);
        mapInfoWin.setContent('当前地址：' + data.address);
        mapInfoWin.redraw();
        marker.openInfoWindow(mapInfoWin);
        console.log(data)
        address = {
          name: data.address,
          address: data.address,
          lat: edipao.kcodeToGb(data.kcode).lat,
          lng: edipao.kcodeToGb(data.kcode).lng,
        }
      }
    })
  }
  var edit = new Edit();
  top.window.edit = edit;
  edit.init();
});