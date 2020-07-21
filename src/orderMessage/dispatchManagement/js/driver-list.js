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
    window.permissionList = edipao.getMyPermission();
    window.form = form;
    var where = {
      loginStaffId: edipao.getLoginStaffId(),
    };
    var showList = [];
    var exportHead = {}; // 导出头部
    var tableCols = [
      { checkbox: true },
      { field: "createTime", title: "抢单时间", width: 150, templet: function (d) {
          return d.createTime ? d.createTime : "- -";
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
      { checkbox: true },
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
      var driverConfig = {
        join: {
          title: "参与抢单司机",
          tableKey: "join-rob-driver-list-table",
          tableCols: tableColsJoin,
          url: "/admin/grab/statistics/grab-driver/statistics-list",
          dataKey: "grabDriverStatisticsList"
        },
        login: {
          title: "登录司机",
          tableKey: "login-rob-driver-list-table",
          tableCols: tableColsJoin,
          url: "/admin/grab/statistics/login-driver/statistics-list",
          dataKey: "loginDriverStatisticsList",
        },
        orderJoin: {
          title: "参与抢单司机",
          tableKey: "order-join-rob-driver-list-table",
          tableCols: tableCols,
          url: "/admin/grab/statistics/grab-activity/order/driver-list",
        }
      }
      tableCols = driverConfig[this.action].tableCols;
      this.dataKey = driverConfig[this.action].dataKey;
      this.tableKey = driverConfig[this.action].tableKey;
      this.url = driverConfig[this.action].url;
      $("#doc-content").html(`<table id="${this.tableKey}" lay-filter="${this.tableKey}"></table>`);
      $("#nav_cite").html(driverConfig[this.action].title);
      where["searchFieldDTOList[0].fieldName"] = "activityBatchNo";
      where["searchFieldDTOList[0].fieldValue"] = this.robKey;
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
        xadmin.open('订单池','./rob-order-list.html?action=driver');
      });
      $(".href_order_no").unbind().on("click", function (e) {
        var dataset = e.target.dataset;
        var pid = 200;
        xadmin.open('查看订单', '../order-view.html?orderNo=' + dataset.orderno + "&action=view&perssionId=" + pid);
      });
    }
    List.prototype.bindTableEvents = function () {
      var _this = this;
      table.on("tool("+_this.tableKey+")", handleEvent);
      table.on("toolbar("+_this.tableKey+")", handleEvent);
      table.on("checkbox("+_this.tableKey+")", handleEvent);
      function handleEvent(obj) {
        var data = obj.data;
        obj.event == "export" && permissionList.indexOf(6031) == -1 && (obj.event = "reject");

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
            xadmin.open("操作日志", "../../OperateLog/log.html?id=" + data.id + "&phone=15");
            break;
          case "reset_search":
            edipao.resetSearch(_this.tableKey, function(){
                location.reload();
            });
            break;
          case "exportLog":
            xadmin.open('导出日志', '../../OperateLog/log.html?phone=15&action=exportLog&dataPk=' + _this.orderNo);
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
        { field: "name", type: "input" },
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
          var where2 = Object.assign({
            loginStaffId: edipao.getLoginStaffId(),
          }, where);
          layui.each(filters, function (key, value) {
            if (key == "createTime") {
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
    List.prototype.exportExcel = function () {
      var _this = this;
      var checkStatus = table.checkStatus(_this.tableKey);
      if (checkStatus.data.length > 0) {
        exportXlsx(checkStatus.data);
        return;
      }
      var param = JSON.parse(JSON.stringify(where));
      param["pageNo"] = 1;
      param["pageSize"] = 9999;
      edipao
        .request({
          phone: "POST",
          url: _this.url,
          data: param,
        })
        .done(function (res) {
          if (res.code == 0) {
            if (res.data) {
              res.data = res.data || {};
              res.data[_this.dataKey] = res.data[_this.dataKey] || [];
              var data = res.data[_this.dataKey];
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
          "司机数据.xlsx",
          "xlsx"
        );
        exportLog();
      }
      // 导出日志
      function exportLog() {
        var params = {
          operationModule: 15,
          dataPk: _this.orderNo,
          operationRemark: "导出司机数据",
        };
        edipao.exportLog(params);
      }
    };
    var list = new List();
    list.init();
  });
