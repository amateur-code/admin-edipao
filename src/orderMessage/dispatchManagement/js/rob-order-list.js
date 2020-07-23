var orderStatusData = [
  {key: 1, value: "待调度"},
  {key: 2, value: "待发车"},
  {key: 3, value: "运输中"},
  {key: 44, value: "已收车未扫码"},
  {key: 4, value: "已收车"},
  {key: 5, value: "已完结"},
  {key: 6, value: "已取消"},
]
var orderTypeData = [
  {key: 1, value: "单车单"},
  {key: 2, value: "背车单"},
]
var operationData = [
  {key: 1, value: "待审核"},
]
var feeData = [
  {key: 1, value: "待支付"},
  {key: 2, value: "支付中"},
  {key: 3, value: "支付成功"}
]
var picData = [
  {key: 1, value: "未上传"},
  {key: 2, value: "已上传"},
]
var tailPayStatusData = [
  {key: 1, value: "待支付"},
  {key: 2, value: "支付中"},
  {key: 3, value: "支付成功"},
  {key: 4, value: "支付失败"},
  {key: 5, value: "未到期"},
]
var masterFlagData = [
  {key: "否", value: "上车"},
  {key: "是", value: "下车"},
]
var dispatchModeData = [
  {key: 1, value: "人工调度"},
  {key: 2, value: "抢单"},
  {key: 3, value: "抢单转人工"},
  {key: 4, value: "抢单变人工"},
  {key: 5, value: "短驳直发"},
]
var jingxiaoshangData = [
  {key: "未收迟到", value: "未收迟到"},
  {key: "未签收", value: "未签收"},
  {key: "签收迟到", value: "签收迟到"},
  {key: "正常", value: "正常"},
]
var hegezhengData = [
  {key: "未收迟到", value: "未收迟到"},
  {key: "未签收", value: "未签收"},
  {key: "签收迟到", value: "签收迟到"},
  {key: "正常", value: "正常"},
]
var transportModeData = [
  {key: "国道", value: "国道"},
  {key: "高速", value: "高速"},
  {key: "部分高速", value: "部分高速"},
]
layui.config({
  base: "../../lib/",
}).extend({
  excel: "layui_exts/excel.min",
  tableFilter: "TableFilter/tableFiltercopy",
}).use(["jquery", "table", "layer", "excel", "tableFilter", "form"], function () {
    var table = layui.table,
      layer = layui.layer,
      tableFilter = layui.tableFilter,
      edipao = layui.edipao,
      excel = layui.excel,
      form = layui.form,
      tableIns,
      tableFilterIns,
      reloadOption = null;
    window.permissionList = edipao.getPermissionIdList();
    var dataPermission = edipao.getDataPermission();
    window.dataPermission = dataPermission;
    window.form = form;
    var where = {
      loginStaffId: edipao.getLoginStaffId(),
    };
    var showList = [];
    var exportHead = {}; // 导出头部
    var tableCols = [
      {type: 'checkbox', fixed: 'left'},
      {field: 'orderNo', title: '业务单号', sort: false,minWidth:105, templet: "#orderNoTpl"},
      {field: 'warehouseNo', title: '仓库单号', sort: false,minWidth:140, templet: function(d){
          return d.warehouseNo ? d.warehouseNo : '- -';
      }},
      {field: 'vinCode', title: 'VIN码', sort: false,width: 200,minWidth:100, templet: function(d){
          return d.vinCode ? d.vinCode : '- -';
      }},
      {field: 'tempLicense', title: '临牌号', sort: false,minWidth:100,minWidth:100, templet: function(d){
          return d.tempLicense ? d.tempLicense : '- -';
      }},
      {field: 'orderType', title: '订单类型', sort: false,minWidth:100, templet: function (d) {
        if(!d.showBtn) return "";
        var value = '- -';
        orderTypeData.some(function (status) {
            if(status.key == d.orderType){
                value = status.value;
                return true;
            }
        });
        return value;
      }},
      {field: 'customerFullName', title: '客户全称', sort: false, width: 120, templet: function(d){
          return d.customerFullName ? d.customerFullName : '- -';
      }},
      {field: 'startWarehouse', title: '发车仓库', sort: false, width: 200, templet: function(d){
          return d.startWarehouse ? d.startWarehouse : '- -';
      }},
      {field: 'startPark', title: '发车停车场', sort: false, width: 200, templet: function(d){
          return d.startPark ? d.startPark : '- -';
      }},
      {field: 'startProvince', title: '发车省', sort: false,minWidth:100, templet: function(d){
          return d.startProvince ? d.startProvince : '- -';
      }},
      {field: 'startCity', title: '发车城市', sort: false,minWidth:100, templet: function(d){
          return d.startCity ? d.startCity : '- -';
      }},
      {field: 'startAddress', title: '发车地址', sort: false, width: 300, templet: function(d){
          return d.startAddress ? d.startAddress : '- -';
      }},
      {field: 'endPark', title: '收车网点', sort: false, width: 300, templet: function(d){
          return d.endPark ? d.endPark : '- -';
      }},
      {field: 'endProvince', title: '收车省', sort: false,minWidth:100, templet: function(d){
          return d.endProvince ? d.endProvince : '- -';
      }},
      {field: 'endCity', title: '收车城市', sort: false,minWidth:100, templet: function(d){
          return d.endCity ? d.endCity : '- -';
      }},
      {field: 'endAddress', title: '收车地址', sort: false, width: 300, templet: function(d){
          return d.endAddress ? d.endAddress : '- -';
      }},
      {field: 'transportMode', title: '运输方式', sort: false, width: 100, templet: function(d){
        if(!d.showBtn) return "";
        return d.transportMode ? d.transportMode : '- -';
      }},
      {field: 'transportAssignTime', title: '运输商指派时间', sort: false,width: 200, templet: function(d){
          return d.transportAssignTime ? d.transportAssignTime : '- -';
      }},
      {field: 'income', title: '收入金额', sort: false,width: 150, templet: function(d){
        if(!d.showBtn) return "";
        if(dataPermission.canViewOrderCost != "Y") return "****";
        return d.income ? (d.income + "元") : '- -';
      }},
      {field: 'dispatchTime', title: '调度时间', sort: false, width: 200, templet: function(d){
        if(!d.showBtn) return "";
        return d.dispatchTime ? d.dispatchTime : '- -';
      }},
      {field: 'openOperator', title: '开单员', sort: false, width: 180, templet: function(d){
        if(!d.showBtn) return "";
        d.openOperator = d.openOperator || "";
        d.openOperatorPhone = d.openOperatorPhone || "";
        return (d.openOperator || d.openOperatorPhone) ? d.openOperator + d.openOperatorPhone : '- -';
      }},
      {field: 'deliveryOperator', title: '发运经理', sort: false, minWidth:180, templet: function(d){
        if(!d.showBtn) return "";
        d.deliveryOperator = d.deliveryOperator || "";
        d.deliveryOperatorPhone = d.deliveryOperatorPhone || "";
        return (d.deliveryOperator || d.deliveryOperatorPhone) ? d.deliveryOperator + d.deliveryOperatorPhone : '- -';
      }},
      {field: 'dispatchOperator', title: '调度员', sort: false, minWidth:180, templet: function(d){
        if(!d.showBtn) return "";
        if(d.dispatchMode == 2) return "系统调度";
        d.dispatchOperator = d.dispatchOperator || "";
        d.dispatchOperatorPhone = d.dispatchOperatorPhone || "";
        return (d.dispatchOperator || d.dispatchOperatorPhone) ? d.dispatchOperator + d.dispatchOperatorPhone : '- -';
      }},
      {field: 'dispatchMode', title: '调度方式', sort: false, minWidth: 145, templet: function(d){
        if(!d.showBtn) return "";
          var result = "";
          dispatchModeData.some(function(item){
              if(item.key == d.dispatchMode){
                  result = item.value;
                  return true;
              }
          });
          return result || "- -";
      }},
      {field: 'driverName', title: '司机信息', sort: false, minWidth: 150, templet: "#driverNameTpl"},
      {field: 'driverIdCard', title: '司机身份证', sort: false,width: 150, hide: false, templet: function(d){
        if(!d.showBtn) return "";
          return d.driverIdCard ? d.driverIdCard : '- -';
      }},
      {field: 'prePayAmount', title: '预付款金额', sort: false,width: 200, hide: false, templet: function (d) {
        if(!d.showBtn) return "";
        return d.prePayAmount + "元";
      }},
      {field: 'prePayAmount', title: '油升数', sort: false,width: 200, hide: false, templet: function (d) {
        if(!d.showBtn) return "";
        return d.prePayOil + "升";
      }},
      {field: 'arrivePayAmount', title: '到付款金额', sort: false,width: 200, hide: false, templet: function (d) {
        if(!d.showBtn) return "";
        return d.arrivePayAmount + "元";
      }},
      {field: 'tailPayAmount', title: '尾款金额', sort: false,width: 200, hide: false, templet: function (d) {
        if(!d.showBtn) return "";
        return d.tailPayAmount + "元";
      }},
    ];
    function DataNull(data) {
      if (data == null || data == "") {
        return "- -";
      } else {
        return data;
      }
    }
    function List() {
      var qs = edipao.urlGet();
      var config = {
        all: {
          url: "/admin/grab/statistics/order-pool/statistics-list",
          dataKey: "orderPoolStatisticsList",
          tableKey: "all-rob-order-list-table",
          logKey: 22,
          logRemark: "导出订单池列表",
        },
        win: {
          url: "/admin/grab/statistics/winning-order/statistics-list",
          dataKey: "winningOrderStatisticsList",
          tableKey: "win-rob-order-list-table",
          logKey: 22,
          logRemark: "导出中签订单列表",

        },
        rob: {
          url: "/admin/grab/statistics/grab-activity/driver/order-list",
          dataKey: "grabActivityDriverOrderList",
          tableKey: "driver-rob-order-list-table",
          logKey: 22,
          logRemark: "导出司机签单列表",
        }
      }
      this.action = qs.action;
      this.robKey = qs.robKey;
      this.url = config[this.action].url;
      this.logKey = config[this.action].logKey;
      this.dataKey = config[this.action].dataKey;
      this.tableKey = config[this.action].tableKey;
      this.logRemark = config[this.action].logRemark;
      $("#doc-content").html(`<table id="${this.tableKey}" lay-filter="${this.tableKey}"></table>`);
      where["searchFieldDTOList[0].fieldName"] = "activityBatchNo";
      where["searchFieldDTOList[0].fieldValue"] = this.robKey;
      if(this.action == "rob"){
        where["searchFieldDTOList[1].fieldName"] = "driverId";
        where["searchFieldDTOList[1].fieldValue"] = qs.driverId;
      }else{
        tableCols.push({field: 'grabOrderDriverCount', title: '抢单司机', sort: false,width: 200, hide: false, templet: "#robDriverTpl"});
      }
    }
    List.prototype.init = function () {
      var _this = this;
      edipao.getCitys(function (data) {
        window.provinceList = data;
        _this.setTableFilter();
      });
      _this.bindTableEvents();
      edipao.request({
        type: "GET",
        url: "/admin/table/show-field/get",
        data: {
          tableName: _this.tableKey,
        },
      }).done(function (res) {
        if (res.code == 0) {
          if (res.data) {
            showList = [];
            try {
              showList = JSON.parse(res.data);
            } catch (e) {}
            layui.each(tableCols, function (index, item) {
              if (item.field == "operation") return;
              if (item.field && showList.indexOf(item.field) == -1) {
                item.hide = true;
              } else {
                if (item.field && item.field !== "" && item.field != "right" && item.field != "left") {
                  exportHead[item.field] = item.title;
                }
              }
            });
          } else {
            layui.each(tableCols, function (index, item) {
              if (item.field) {
                if (item.field && item.field !== "" && item.field != "right" && item.field != "left") {
                  exportHead[item.field] = item.title;
                }
              }
            });
          }
          _this.renderTable();
          _this.setTableFilter();
        }
      });
    };
    List.prototype.renderTable = function () {
      var _this = this;
      tableIns = table.render({
        elem: "#" + _this.tableKey,
        id: _this.tableKey,
        url: edipao.API_HOST + _this.url,
        method: "get",
        page: true,
        limits: [10, 20, 50, 100],
        where: where,
        request: {
          pageName: "pageNo", //页码的参数名称
          limitName: "pageSize", //每页数据量的参数名
        },
        parseData: function (res) {
          edipao.codeMiddleware(res);
          var orderDTOList = res.data[_this.dataKey] || [];
          orderDTOList.forEach(function(item){
              if(item.orderType == 2 && item.masterFlag == "否"){
                  item.showBtn = 0;
              }else{
                  item.showBtn = 1;
              }
          });
          return {
              "code": res.code, //解析接口状态
              "msg": res.message, //解析提示文本
              "count": res.data.totalSize, //解析数据长度
              "data": orderDTOList //解析数据列表
          }
        },
        toolbar: "#headerBtns",
        defaultToolbar: [],
        cols: [tableCols],
        done: function (res, curr, count) {
          _this.bindEvents();
          if (!res.data || res.data == null || res.data.length < 1) {
            $(".layui-table-header").css("overflow-x", "scroll");
          } else {
            $(".layui-table-header").css("overflow", "hidden");
          }
          if(reloadOption) {
            tableIns.reload(JSON.parse(JSON.stringify(reloadOption)));
            reloadOption = false;
          }
          tableFilterIns && tableFilterIns.reload(); // 搜索
        },
      });
    };
    List.prototype.bindEvents = function () {
      var _this = this;
      $(".href_driver").unbind().on("click", function (e) {
        var id = e.target.dataset.id;
        top.xadmin.open('司机信息','/DriverManager/DriverArchives/info.html?id=' + id);
      });
      $(".href_order_no").unbind().on("click", function (e) {
        var dataset = e.target.dataset;
        var pid = 200;
        top.xadmin.open('查看订单', '/orderMessage/order-view.html?orderNo=' + dataset.orderno + "&orderId=" + dataset.id + "&action=view" + "&feeId=" + dataset.feeid + "&perssionId=" + pid);
      });
      $(".href_rob_driver").unbind().on("click", function (e) {
        var orderNo = e.target.dataset.orderno;
        xadmin.open('抢单司机', './driver-list.html?action=orderJoin&robKey=' + _this.robKey + "&orderNo=" + orderNo);
      });
    }
    List.prototype.bindTableEvents = function () {
      var _this = this;
      table.on("tool("+_this.tableKey+")", handleEvent);
      table.on("toolbar("+_this.tableKey+")", handleEvent);
      table.on("checkbox("+_this.tableKey+")", handleEvent);
      function handleEvent(obj) {
        obj.event == "export" && permissionList.indexOf(6021) == -1 && (obj.event = "reject");
        switch (obj.event) {
          case "reject":
            layer.alert("你没有访问权限", { icon: 2 });
            break;
          case "export":
            _this.exportExcel();
            break;
          case "tableSet":
            xadmin.open("表格设置", "./table-set.html?tableKey=" + _this.tableKey, 600, 600);
            break;
          case "reset_search":
            edipao.resetSearch(_this.tableKey, function(){
                location.reload();
            });
            break;
          case "exportLog":
            xadmin.open('导出日志', '../../OperateLog/log.html?type=' + _this.logKey + '&action=exportLog');
            break;
        }
      }
    };
    List.prototype.initPermission = function () {
      if (permissionList.indexOf(6021) < 0) {
        $("#export_data").remove();
      }
    };
    List.prototype.setTableFilter = function () {
      var _this = this;
      var filters = [
        { field: 'orderNo', type: 'input' },
        { field: 'warehouseNo', type: 'input' },
        { field: 'vinCode', type: 'input' },
        { field: 'tempLicense', type: 'input' },
        { field: 'orderType', type: 'checkbox', data:orderTypeData },
        { field: 'customerFullName', type: 'input' },
        { field: 'startWarehouse', type: 'input' },
        { field: 'startPark', type: 'input' },
        { field: 'startProvince', type: 'province' },
        { field: 'startCity', type: 'provincecity' },
        { field: 'startAddress', type: 'input' },
        { field: 'endPark', type: 'input' },
        { field: "endProvince", type: "province" },
        { field: 'endCity', type: 'provincecity' },
        { field: 'endAddress', type: 'input' },
        { field: 'transportMode', type: 'checkbox', data: transportModeData },
        { field: 'transportAssignTime', type: 'timeslot' },
        { field: 'dispatchTime', type: 'timeslot' },
        { field: 'openOperator', type: 'contract' },
        { field: 'deliveryOperator', type: 'contract' },
        { field: 'dispatchOperator', type: 'contract' },
        { field: 'dispatchMode', type: 'checkbox', data: dispatchModeData },
        { field: 'driverName', type: 'input' },
        { field: 'driverPhone', type: 'input' },
        { field: 'driverIdCard', type: 'input' },
        { field: 'income', type: 'numberslot' },
        { field: 'prePayAmount', type: 'checkbox-numberslot', data: feeData },
        { field: 'arrivePayAmount', type: 'checkbox-numberslot', data: feeData },
        { field: 'tailPayAmount', type: 'checkbox-numberslot', data: feeData },
        { field: 'grabOrderDriverCount', type: 'numberslot' },
      ]
      tableFilterIns = tableFilter.render({
        elem: "#" + _this.tableKey, //table的选择器
        mode: "self", //过滤模式
        filters: filters, //过滤项配置
        'done': function(filters, reload){
          filters = $.extend({}, filters);
          var index = 1;
          if(_this.action == "rob") index = 2;
          var where2 = Object.assign({loginStaffId: edipao.getLoginStaffId()}, JSON.parse(JSON.stringify(where)));
          if(filters.openOperator){
              filters.openOperatorPhone =  filters.openOperator[1];
              filters.openOperator =  filters.openOperator[0];
          }
          if(filters.deliveryOperator){
              filters.deliveryOperatorPhone =  filters.deliveryOperator[1];
              filters.deliveryOperator =  filters.deliveryOperator[0];
          }
          if(filters.dispatchOperator){
              filters.dispatchOperatorPhone =  filters.dispatchOperator[1];
              filters.dispatchOperator =  filters.dispatchOperator[0];
          }
          if(!filters.operation) {
              verifyFilter = false;
          }else{
              // verifyFilter = true;
              // where["pageSize"] = 60;
          }
          delete filters.operation;
          layui.each(filters,function(key, value){
              if(key=='startProvince'||key=='endProvince'){
                  where2['searchFieldDTOList['+ index +'].fieldName'] = key;
                  where2['searchFieldDTOList['+ index +'].fieldValue'] = value[key];
              }else if(key == "customerMileage" || key == "pricePerMeliage" || key == "income" || key == "driverMileage"||key=="carDamageCount"){
                  where2["searchFieldDTOList[" + index + "].fieldName"] = key;
                  where2['searchFieldDTOList[' + index + '].fieldMinValue'] = value[0];
                  where2['searchFieldDTOList[' + index + '].fieldMaxValue'] = value[1];
              }else if(key=='startCity'||key=='endCity'){ 
                  if(value.city == "全部") value.city = "";
                  if(key == "startCity"){
                      where2['searchFieldDTOList['+ index +'].fieldName'] = "startProvince";
                      where2['searchFieldDTOList['+ index++ +'].fieldValue'] = value.province;
                      where2['searchFieldDTOList['+ index +'].fieldName'] = "startCity";
                      where2['searchFieldDTOList['+ index +'].fieldValue'] = value.city;
                  }else if(key=='endCity'){
                      where2['searchFieldDTOList['+ index +'].fieldName'] = "endProvince";
                      where2['searchFieldDTOList['+ index++ +'].fieldValue'] = value.province;
                      where2['searchFieldDTOList['+ index +'].fieldName'] = "endCity";
                      where2['searchFieldDTOList['+ index +'].fieldValue'] = value.city;
                  }
              }else if(key == 'prePayAmount'||key == 'arrivePayAmount'||key == "tailPayAmount"){
                  if(value.slot.length > 0){
                      where2['searchFieldDTOList['+ index +'].fieldName'] = key;
                      where2['searchFieldDTOList['+ index +'].fieldMinValue'] = value.slot[0];
                      where2['searchFieldDTOList['+ index +'].fieldMaxValue'] = value.slot[1];
                      if(value.checked.length > 0) index++;
                  }
                  if(value.checked.length > 0){
                      where2['searchFieldDTOList['+ index +'].fieldName'] = key.replace("Amount", "Status");
                      where2['searchFieldDTOList['+ index +'].fieldListValue'] = value.checked.join(',');
                  }
              }else if(key == "orderStatus"){
                  var checkSign, checkFetch;
                  checkFetch = value.indexOf("4") > -1;
                  checkSign = value.indexOf("44") > -1;
                  value = value.filter(function (item) {
                      return item != "44";
                  });
                  value = value || [];
                  if((checkSign && checkFetch) || (!checkSign && !checkFetch)){
                      where2['searchFieldDTOList['+ index +'].fieldName'] = key;
                      where2['searchFieldDTOList['+ index +'].fieldListValue'] = value.join(',');
                  }else if(checkSign && !checkFetch){
                      value.push("4");
                      where2['searchFieldDTOList['+ index +'].fieldName'] = key;
                      where2['searchFieldDTOList['+ index++ +'].fieldListValue'] = value.join(',');
                      where2['searchFieldDTOList['+ index +'].fieldName'] = "dealerSignTime";
                      where2['searchFieldDTOList['+ index +'].fieldMinValue'] = "0";
                      where2['searchFieldDTOList['+ index +'].fieldMaxValue'] = "1";
                  }else if(!checkSign && checkFetch){
                      where2['searchFieldDTOList['+ index +'].fieldName'] = key;
                      where2['searchFieldDTOList['+ index++ +'].fieldListValue'] = value.join(',');
                      where2['searchFieldDTOList['+ index +'].fieldName'] = "dealerSignTime";
                      where2['searchFieldDTOList['+ index +'].fieldMinValue'] = "1980-01-01 00:00:00";
                      where2['searchFieldDTOList['+ index +'].fieldMaxValue'] = "2999-01-01 00:00:00";
                  }
              }else if(key == "grabOrderDriverCount"){
                where2['searchFieldDTOList['+ index +'].fieldName'] = "grabOrderDriverCount";
                where2['searchFieldDTOList['+ index +'].fieldMinValue'] = value[0];
                where2['searchFieldDTOList['+ index +'].fieldMaxValue'] = value[1];
              }else if(key == "dealerSignTime" || key == "certificateSignTime" || key=="arrivePayTime"||key=="prePayTime"||key=="tailPayTime"||key=="transportAssignTime"||key=="fetchTruckTime"||key=="dispatchTime" || key == "startTruckTime"){
                  where2['searchFieldDTOList['+ index +'].fieldName'] = key;
                  value = value.split(" 至 ");
                  where2['searchFieldDTOList['+ index +'].fieldMinValue'] = value[0];
                  where2['searchFieldDTOList['+ index +'].fieldMaxValue'] = value[1];
              }else if(key == "orderType" || key == "tailPayStatus" || key == "masterFlag"){
                  where2['searchFieldDTOList['+ index +'].fieldName'] = key;
                  where2['searchFieldDTOList['+ index +'].fieldListValue'] = value.join(',');
              }else if(key == "returnAuditStatus" || key == "dispatchMode" || key == "transportMode"){
                  where2['searchFieldDTOList['+ index +'].fieldName'] = key;
                  where2['searchFieldDTOList['+ index +'].fieldListValue'] = value.join(',');
              }else if(key == "carModel"){
                  where2['searchFieldDTOList['+ index +'].fieldName'] = "feeItemJson";
                  where2['searchFieldDTOList['+ index +'].fieldValue'] = value;
              }else{
                  where2['searchFieldDTOList['+ index +'].fieldName'] = key;
                  where2['searchFieldDTOList['+ index +'].fieldValue'] = value;
              }
              index++;
          });
          if(reload){
            reloadOption = { where: where2, page: { curr: 1 }};
          }else{
            tableIns.reload( { where: where2, page: { curr: 1 }});
          }
        }
      });
    };
    var exportLoading = false;
    List.prototype.getExportData = function (cb) {
      var _this = this;
      var checkStatus = table.checkStatus(_this.tableKey);
      if(checkStatus.data.length < 1){
          if(exportLoading) return layer.msg("数据正在下载，暂不能操作。");
          layer.msg("正在下载数据，请勿退出系统或者关闭浏览器");
          exportLoading = true;
          edipao.exportData({
              params: where,
              url: _this.url,
              method: "GET",
              pageSize: "pageSize",
              limit: 99999,
              checkFunction: function(res){
                  return !(!res.data || !res.data[_this.dataKey] || res.data[_this.dataKey].length == 0);
              }
          }).done(function (res) {
              var data = [];
              exportLoading = false;
              if(res.length > 0){
                  res.forEach(function (item) {
                      data = data.concat(item[_this.dataKey]);
                  });
                  cb(data);
              }else{
                  exportLoading = false;
              }
          });
      }else{
          cb(checkStatus.data);
      }
    }
    List.prototype.exportExcel = function () {
      var _this = this;
      _this.getExportData(function (data) {
        exportXlsx(data);
      });
      function exportXlsx(data) {
        var exportData = [];
        // 添加头部
        exportData.push(exportHead);
        // 过滤处理数据
        layui.each(data, function (k, v) {
          var exportObj = {};
          layui.each(v, function (index, item) {
            if (index && showList.indexOf(index) != -1) {
              switch (index) {
                default:
                  exportObj[index] = DataNull(item);
              }
            }
          });
          exportData.push(exportObj);
        });
        // 导出
        excel.exportExcel(
          {
            sheet1: exportData,
          },
          _this.logRemark + ".xlsx",
          "xlsx"
        );
        exportLog();
      }
      // 导出日志
      function exportLog() {
        var params = {
          operationModule: _this.logKey,
          dataPk: _this.orderNo,
          operationRemark: _this.logRemark,
        };
        edipao.exportLog(params);
      }
    };
    var list = new List();
    list.init();
  });
