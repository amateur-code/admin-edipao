layui
  .config({
    base: "../../lib/",
  })
  .extend({
    excel: "layui_exts/excel.min",
    tableFilter: "TableFilter/tableFiltercopy",
  })
  .use(["jquery", "table", "layer", "excel", "tableFilter", "form"], function () {
    var statusData = [
      { key: 0, value: "未支付" },
      { key: 1, value: "已支付" },
    ];
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
    window.form = form;
    var where = {
      loginStaffId: edipao.getLoginStaffId(),
    };
    var showList = [];
    var exportHead = {}; // 导出头部
    var tableCols = [
      { checkbox: true, fixed: true, },
      { field: "grabTime", title: "抢单时间", width: 150, templet: function (d) {
          return d.grabTime ? d.grabTime : "- -";
      }},
      { field: "name", title: "司机姓名", width: 200, templet: function (d) {
        return d.name || "- -";
      }},
      { field: "phone", title: "司机手机", width: 200, templet: "#driverPhoneTpl"},
      { field: "idNum", title: "司机身份证", width: 250, templet: function (d) {
          return d.idNum ? d.idNum : "- -";
      }},
      { field: "depositStatus", title: "押金状态", width: 150, templet: function (d) {
        var status = "- -";
        statusData.some(function(item){
          if(item.key== d.depositStatus) {
            status = item.value;
            return true;
          }
        })
        return status;
      }},
    ];
    var tableColsJoin = [
      { checkbox: true, fixed: 'left' },
      { field: "name", title: "司机姓名", width: 150, templet: function (d) {
        return d.name || "- -";
      }},
      { field: "phone", title: "司机手机", width: 150, templet: "#driverPhoneTpl"},
      { field: "idNum", title: "司机身份证", width: 200, templet: function (d) {
          return d.idNum ? d.idNum : "- -";
      }},
      { field: "depositStatus", title: "押金状态", width: 150, templet: function (d) {
        var status = "- -";
        statusData.some(function(item){
          if(item.key== d.depositStatus) {
            status = item.value;
            return true;
          }
        })
        return status;
      }},
      { field: "grabOrderCount", title: "抢单数", width: 150, templet: "#robNumTpl"},
      { field: "winningOrderNo", title: "中签订单", width: 150, templet: "#orderNoTpl"},
    ]
    function DataNull(data) {
      if (data == null || data == "") {
        return "- -";
      } else {
        return data;
      }
    }
    function List() {
      var qs = edipao.urlGet();
      this.action = qs.action;
      this.robKey = qs.robKey;
      this.orderNo = qs.orderNo || "";
      var driverConfig = {
        join: {
          title: "参与抢单司机",  //活动维度
          tableKey: "join-rob-driver-list-table",
          tableCols: tableColsJoin,
          url: "/admin/grab/statistics/grab-driver/statistics-list",
          dataKey: "grabDriverStatisticsList",
          logKey: 21,
          logRemark: "导出参与抢单司机",
        },
        login: {
          title: "登录司机",
          tableKey: "login-rob-driver-list-table",
          tableCols: tableColsJoin,
          url: "/admin/grab/statistics/login-driver/statistics-list",
          dataKey: "loginDriverStatisticsList",
          logKey: 21,
          logRemark: "导出登录APP司机",
        },
        orderJoin: {
          title: "参与抢单司机",  //订单维度
          tableKey: "order-join-rob-driver-list-table",
          tableCols: tableCols,
          url: "/admin/grab/statistics/grab-activity/order/driver-list",
          dataKey: "grabActivityOrderDriverList",
          logKey: 21,
          logRemark: "导出订单"+this.orderNo+"参与抢单司机",
        }
      }
      tableCols = driverConfig[this.action].tableCols;
      this.logKey = driverConfig[this.action].logKey;
      this.dataKey = driverConfig[this.action].dataKey;
      this.tableKey = driverConfig[this.action].tableKey;
      this.logRemark = driverConfig[this.action].logRemark;
      this.url = driverConfig[this.action].url;
      $("#doc-content").html(`<table id="${this.tableKey}" lay-filter="${this.tableKey}"></table>`);
      $("#nav_cite").html(driverConfig[this.action].title);
      where["searchFieldDTOList[0].fieldName"] = "activityBatchNo";
      where["searchFieldDTOList[0].fieldValue"] = this.robKey;
      if(this.action == "orderJoin"){
        where["searchFieldDTOList[1].fieldName"] = "orderNo";
        where["searchFieldDTOList[1].fieldValue"] = this.orderNo;
      }
    }
    List.prototype.init = function () {
      var _this = this;
      // _this.renderTable();
      _this.setTableFilter();
      _this.bindTableEvents();
      edipao
        .request({
          method: "GET",
          url: "/admin/table/show-field/get",
          data: {
            tableName: _this.tableKey,
          },
        })
        .done(function (res) {
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
              showList = [];
              layui.each(tableCols, function (index, item) {
                if (item.field) {
                  showList.push(item.field);
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
        elem: "#"+_this.tableKey,
        id: _this.tableKey,
        url: edipao.API_HOST + this.url,
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
          var data = [];
          res.data = res.data || {};
          res.data[_this.dataKey] = res.data[_this.dataKey] || [];
          res.data[_this.dataKey].forEach(function (item) {
            data.push(item);
          });
          if (res.code == 0) {
            return {
              code: res.code,
              msg: res.message,
              count: res.data.totalSize,
              data: data,
            };
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
      $(".href_driver_phone").unbind().on("click", function (e) {
        var id = e.target.dataset.id;
        xadmin.open('司机信息','../../DriverManager/DriverArchives/info.html?id=' + id);
      });
      $(".href_rob_num").unbind().on("click", function (e) {
        var id = e.target.dataset.id;
        xadmin.open('订单池','./rob-order-list.html?action=rob&robKey=' + _this.robKey + "&driverId=" + id);
      });
      $(".href_order_no").unbind().on("click", function (e) {
        var dataset = e.target.dataset;
        var pid = 200;
        top.xadmin.open('查看订单', '/orderMessage/order-view.html?orderNo=' + dataset.orderno + "&action=view&perssionId=" + pid);
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
            xadmin.open("表格设置", "./table-set.html?tableKey=" + _this.tableKey, 600, 400);
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
        { field: "grabTime", type: "timeslot" },
        { field: "phone", type: "input" },
        { field: "idNum", type: "input" },
        { field: "depositStatus", type: "checkbox", data: statusData },
        { field: "grabOrderCount", type: "numberslot" },
        { field: "winningOrderNo", type: "input" },
      ];
      tableFilterIns = tableFilter.render({
        elem: "#" + _this.tableKey, //table的选择器
        mode: "self", //过滤模式
        filters: filters, //过滤项配置
        done: function (filters, reload) {
          filters = $.extend({},filters);
          var index = 1;
          if(_this.action == "orderJoin") index = 2;
          var where2 = Object.assign({
            loginStaffId: edipao.getLoginStaffId(),
          }, where);
          layui.each(filters, function (key, value) {
            if (key == "grabTime") {
              where2['searchFieldDTOList['+ index +'].fieldName'] = key;
              value = value.split(" 至 ");
              where2['searchFieldDTOList['+ index +'].fieldMinValue'] = value[0];
              where2['searchFieldDTOList['+ index +'].fieldMaxValue'] = value[1];
            }else if(key == "depositStatus"){
              where2['searchFieldDTOList['+ index +'].fieldName'] = key;
              where2['searchFieldDTOList['+ index +'].fieldListValue'] = value.join(',');
            }else if(key == 'grabOrderCount'){
              // 驾龄、押金
              where2['searchFieldDTOList['+ index +'].fieldName'] = key;
              where2['searchFieldDTOList['+ index +'].fieldMinValue'] = value[0];
              where2['searchFieldDTOList['+ index +'].fieldMaxValue'] = value[1];
            } else {
              where2["searchFieldDTOList[" + index + "].fieldName"] = key;
              where2["searchFieldDTOList[" + index + "].fieldValue"] = value;
            }
            index++;
          });
          if(reload){
            reloadOption = { where: where2, page: { curr: 1 }};
          }else{
            tableIns.reload( { where: where2, page: { curr: 1 }});
          }
        },
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
                case "depositStatus":
                  var status = "- -";
                  statusData.some(function(item){
                    if(item.key== v[index]) {
                      status = item.value;
                      return true;
                    }
                  })
                  exportObj[index] = status;
                  break;
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
