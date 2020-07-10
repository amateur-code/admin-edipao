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
      edipao = layui.edipao,
      tableIns,
      tableFilterIns,
      reloadOption = null;
    window.permissionList = edipao.getMyPermission();
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
      {field: 'startWarehouse', title: '发车仓库', sort: false, width: 400, templet: function(d){
          return d.startWarehouse ? d.startWarehouse : '- -';
      }},
      {field: 'startPark', title: '发车停车场', sort: false, width: 400, templet: function(d){
          return d.startPark ? d.startPark : '- -';
      }},
      {field: 'startProvince', title: '发车省', sort: false,minWidth:100, templet: function(d){
          return d.startProvince ? d.startProvince : '- -';
      }},
      {field: 'startCity', title: '发车城市', sort: false,minWidth:100, templet: function(d){
          return d.startCity ? d.startCity : '- -';
      }},
      {field: 'startAddress', title: '发车地址', sort: false, width: 400, templet: function(d){
          return d.startAddress ? d.startAddress : '- -';
      }},
      {field: 'endPark', title: '收车网点', sort: false, width: 400, templet: function(d){
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
          return d.transportMode ? d.transportMode : '- -';
      }},
      {field: 'transportAssignTime', title: '运输商指派时间', sort: false,width: 200, templet: function(d){
          return d.transportAssignTime ? d.transportAssignTime : '- -';
      }},
      {field: 'income', title: '收入金额', sort: false,width: 150, templet: function(d){
          if(dataPermission.canViewOrderCost != "Y") return "****";
          return d.income ? (d.income + "元") : '- -';
      }},
      {field: 'dispatchTime', title: '调度时间', sort: false, width: 200, templet: function(d){
          return d.dispatchTime ? d.dispatchTime : '- -';
      }},
      {field: 'openOperator', title: '开单员', sort: false, width: 180, templet: function(d){
          d.openOperator = d.openOperator || "";
          d.openOperatorPhone = d.openOperatorPhone || "";
          return (d.openOperator || d.openOperatorPhone) ? d.openOperator + d.openOperatorPhone : '- -';
      }},
      {field: 'deliveryOperator', title: '发运经理', sort: false, minWidth:180, templet: function(d){
          d.deliveryOperator = d.deliveryOperator || "";
          d.deliveryOperatorPhone = d.deliveryOperatorPhone || "";
          return (d.deliveryOperator || d.deliveryOperatorPhone) ? d.deliveryOperator + d.deliveryOperatorPhone : '- -';
      }},
      {field: 'dispatchOperator', title: '调度员', sort: false, minWidth:180, templet: function(d){
          if(d.dispatchMode == 2) return "系统调度";
          d.dispatchOperator = d.dispatchOperator || "";
          d.dispatchOperatorPhone = d.dispatchOperatorPhone || "";
          return (d.dispatchOperator || d.dispatchOperatorPhone) ? d.dispatchOperator + d.dispatchOperatorPhone : '- -';
      }},
      {field: 'dispatchMode', title: '调度方式', sort: false, minWidth: 145, templet: function(d){
          var result = "";
          dispatchModeData.some(function(item){
              if(item.key == d.dispatchMode){
                  result = item.value;
                  return true;
              }
          });
          return result || "- -";
      }},
      {field: 'driverName', title: '司机姓名', sort: false, minWidth: 130, templet: "#driverNameTpl"},
      {field: 'driverPhone', title: '司机手机', sort: false,minWidth:120, templet: function (d) {
              return d.driverPhone || "- -";
      }},
      {field: 'driverIdCard', title: '司机身份证', sort: false,width: 160, hide: false, templet: function(d){
          return d.driverIdCard ? d.driverIdCard : '- -';
      }},
      {field: 'prePayAmount', title: '预付款金额', sort: false,width: 200, hide: false, templet: function (d) {
        return d.prePayAmount + "元";
      }},
      {field: 'prePayAmount', title: '油升数', sort: false,width: 200, hide: false, templet: function (d) {
        return d.prePayOil + "升";
      }},
      {field: 'arrivePayAmount', title: '到付款金额', sort: false,width: 200, hide: false, templet: function (d) {
        return d.arrivePayAmount + "元";
      }},
      {field: 'tailPayAmount', title: '尾款金额', sort: false,width: 200, hide: false, templet: function (d) {
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
      this.tableKey = "rob-order-list-table";
      this.orderNo = qs.orderNo;
      this.orderStatus = qs.orderStatus;
      window.orderStatus = this.orderStatus;
      where["searchFieldDTOList[0].fieldName"] = "orderNo";
      where["searchFieldDTOList[0].fieldValue"] = this.orderNo;
    }
    List.prototype.init = function () {
      var _this = this;
      // _this.renderTable();
      _this.setTableFilter();
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
              if (item.field && showList.indexOf(item.field) != -1) {
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
        elem: "#damageList",
        id: "damageList",
        url: edipao.API_HOST + "/admin/order/list",
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
          orderDTOList = res.data.orderDTOList;
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
              "data": res.data.orderDTOList //解析数据列表
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
        xadmin.open('司机信息','../../DriverManager/DriverArchives/info.html?id=' + id);
      });
      $(".href_order_no").unbind().on("click", function (e) {
        var dataset = e.target.dataset;
        var pid = 200;
        xadmin.open('查看订单', '../order-view.html?orderNo=' + dataset.orderno + "&orderId=" + dataset.id + "&action=view" + "&feeId=" + dataset.feeid + "&perssionId=" + pid);
      });
    }
    List.prototype.bindTableEvents = function () {
      var _this = this;
      table.on("tool(damageList)", handleEvent);
      table.on("toolbar(damageList)", handleEvent);
      table.on("checkbox(damageList)", handleEvent);
      function handleEvent(obj) {
        var data = obj.data;
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
          case "log":
            xadmin.open("操作日志", "../../OperateLog/log.html?id=" + data.id + "&type=15");
            break;
          case "reset_search":
            edipao.resetSearch("damageList", function(){
                location.reload();
            });
            break;
          case "exportLog":
            xadmin.open('导出日志', '../../OperateLog/log.html?type=15&action=exportLog&dataPk=' + _this.orderNo);
            break;
        }
      }
    };
    List.prototype.initPermission = function () {
      if (permissionList.indexOf("订单录入") < 0) {
        $("#import_order").remove();
      }
      if (permissionList.indexOf("导出") < 0) {
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
        { field: 'tailPayStatus', type: 'checkbox', data: tailPayStatusData },
      ]
      tableFilterIns = tableFilter.render({
        elem: "#damageList", //table的选择器
        mode: "self", //过滤模式
        filters: filters, //过滤项配置
        done: function (filters, reload) {
          filters = $.extend({},filters);
          var index = 1;
          var where = Object.assign({
            loginStaffId: edipao.getLoginStaffId(),
          }, where);
          where["searchFieldDTOList[0].fieldName"] = "orderNo";
          where["searchFieldDTOList[0].fieldValue"] = _this.orderNo;
          layui.each(filters, function (key, value) {
            if (key == "createTime") {
              where['searchFieldDTOList['+ index +'].fieldName'] = key;
              value = value.split(" 至 ");
              where['searchFieldDTOList['+ index +'].fieldMinValue'] = value[0];
              where['searchFieldDTOList['+ index +'].fieldMaxValue'] = value[1];
            }else if(key == "createUser"){
              value = value.filter(function (item) {
                return String(item) != "";
              });
              value.forEach(function(item, index2){
                where['searchFieldDTOList['+ (index + index2 * 1) +'].fieldName'] = key;
                where["searchFieldDTOList[" + (index + index2 * 1) + "].fieldValue"] = item;
              });

            }else if(key == "type" || key == "status"){
              where['searchFieldDTOList['+ index +'].fieldName'] = key;
              where['searchFieldDTOList['+ index +'].fieldListValue'] = value.join(',');
            } else {
              where["searchFieldDTOList[" + index + "].fieldName"] = key;
              where["searchFieldDTOList[" + index + "].fieldValue"] = value;
            }
            index++;
          });
          if(reload){
            reloadOption = { where: where, page: { curr: 1 }};
          }else{
            tableIns.reload( { where: where, page: { curr: 1 }});
          }
        },
      });
    };
    List.prototype.exportExcel = function () {
      var _this = this;
      var checkStatus = table.checkStatus("damageList");
      if (checkStatus.data.length > 0) {
        exportXlsx(checkStatus.data);
        return;
      }
      var param = JSON.parse(JSON.stringify(where));
      param["pageNo"] = 1;
      param["pageSize"] = 9999;
      edipao
        .request({
          type: "POST",
          url: "/admin/order/damage/list",
          data: param,
        })
        .done(function (res) {
          if (res.code == 0) {
            if (res.data) {
              res.data = res.data || {};
              res.data.ordeDamageEntityList = res.data.ordeDamageEntityList || [];
              var data = res.data.ordeDamageEntityList;
              exportXlsx(data);
            }
          }else{

          }
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
          "司机签到数据.xlsx",
          "xlsx"
        );
        exportLog();
      }
      // 导出日志
      function exportLog() {
        var params = {
          operationModule: 15,
          dataPk: _this.orderNo,
          operationRemark: "导出司机签到数据",
        };
        edipao.exportLog(params);
      }
    };
    var list = new List();
    list.init();
  });
