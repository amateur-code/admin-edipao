layui
  .config({
    base: "../../lib/",
  })
  .extend({
    excel: "layui_exts/excel.min",
    tableFilter: "TableFilter/tableFiltercopy",
  })
  .use(["jquery", "table", "layer", "excel", "tableFilter", "form"], function () {
    var table = layui.table,
      layer = layui.layer,
      tableFilter = layui.tableFilter,
      edipao = layui.edipao,
      excel = layui.excel,
      form = layui.form,
      tableIns,
      tableFilterIns,
      reloadOption = null;
    var permissionList = edipao.getPermissionIdList();
    window.permissionList = permissionList;
    window.form = form;
    var where = {
      loginStaffId: edipao.getLoginStaffId(),
    };
    var showList = [];
    var exportHead = {}; // 导出头部
    var tableCols = [
      { checkbox: true },
      { field: "grabStartTime", title: "抢单开始时间", width: 150, templet: function (d) {
        return d.grabStartTime  || "- -";
      }},
      { field: "grabEndTime", title: "抢单结束时间", width: 150, templet: function (d) {
        return d.grabEndTime || "- -";
      }},
      { field: "grabOrderPoolCount", title: "订单池总数",  templet: "#ordersSumTpl"},
      { field: "grabOrderDriverCount", title: "参与抢单司机数",  templet: "#driverSumTpl"},
      { field: "winningOrderCount", title: "中签订单数",  templet: "#winnerSumTpl"},
      { field: "loginDriverCount", title: "登录APP司机数",  templet: "#loginSumTpl"},
      { field: "winningRate", title: "中签率", width: 150, templet: function (d) {
          return d.winningRate;
      }},
    ];
    function DataNull(data) {
      if (data == null || String(data) == "" || data == undefined) {
        return "- -";
      } else {
        return data;
      }
    }
    function List() {
      var qs = edipao.urlGet();
      this.perssionId = qs.perssionId;
      this.tableKey = "rob-list-table";
      this.orderNo = qs.orderNo;
      this.orderStatus = qs.orderStatus;
      this.logKey = 20;
      $("#doc-content").html(`<table id="${this.tableKey}" lay-filter="${this.tableKey}"></table>`);
      window.orderStatus = this.orderStatus;
    }
    List.prototype.init = function () {
      var _this = this;
      // _this.renderTable();
      _this.setTableFilter();
      _this.bindTableEvents();
      edipao
        .request({
          type: "GET",
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
        elem: "#" + _this.tableKey,
        id: _this.tableKey,
        url: edipao.API_HOST + "/admin/grab/statistics/grab-activity/statistics-list",
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
          res.data.grabActivityStatisticsList = res.data.grabActivityStatisticsList || [];
          res.data.grabActivityStatisticsList.forEach(function (item) {
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
      $(".href_order_sum").unbind().on("click", function (e) {
        var key = e.target.dataset.key;
        xadmin.open('订单池','./rob-order-list.html?action=all&robKey=' + key + '&perssionId=' + _this.perssionId);
      });
      $(".href_driver_sum").unbind().on("click", function (e) {
        var key = e.target.dataset.key;
        xadmin.open('参与抢单司机', './driver-list.html?action=join&robKey=' + key + '&perssionId=' + _this.perssionId);
      });
      $(".href_winner_sum").unbind().on("click", function (e) {
        var key = e.target.dataset.key;
        xadmin.open('中签订单','./rob-order-list.html?action=win&robKey=' + key + '&perssionId=' + _this.perssionId);
      });
      $(".href_login_sum").unbind().on("click", function (e) {
        var key = e.target.dataset.key;
        xadmin.open('登录司机','./driver-list.html?action=login&robKey=' + key + '&perssionId=' + _this.perssionId);
      });
    }
    List.prototype.bindTableEvents = function () {
      // if(location.href.indexOf("test") > -1){
      //   $("#nav_cite").on("click", function (e) {
      //     top.xadmin.add_tab("demo", "customerManager/dotArchives/demo.html");
      //   });
      // }
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
        { field: "grabEndTime", type: "timeslot" },
        { field: "grabStartTime", type: "timeslot" },
        { field: "loginDriverCount", type: "numberslot"},
        { field: "winningOrderCount", type: "numberslot" },
        { field: "winningRate", type: "numberslot" },
        { field: "grabOrderPoolCount", type: "numberslot" },
        { field: "grabOrderDriverCount", type: "numberslot" },
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
            if (key == "grabEndTime" || key == "grabStartTime") {
              where2['searchFieldDTOList['+ index +'].fieldName'] = key;
              value = value.split(" 至 ");
              where2['searchFieldDTOList['+ index +'].fieldMinValue'] = value[0];
              where2['searchFieldDTOList['+ index +'].fieldMaxValue'] = value[1];
            }else if(key == "loginDriverCount" || key == "winningOrderCount" || key == "winningRate" || key == "grabOrderPoolCount" || key == "grabOrderDriverCount"){
              where2["searchFieldDTOList[" + index + "].fieldName"] = key;
              where2['searchFieldDTOList[' + index + '].fieldMinValue'] = value[0];
              where2['searchFieldDTOList[' + index + '].fieldMaxValue'] = value[1];
            }else {
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
      var checkStatus = table.checkStatus('dotList');
      if(checkStatus.data.length < 1){
          if(exportLoading) return layer.msg("数据正在下载，暂不能操作。");
          layer.msg("正在下载数据，请勿退出系统或者关闭浏览器");
          exportLoading = true;
          edipao.exportData({
              params: where,
              url: "/admin/grab/statistics/grab-activity/statistics-list",
              method: "GET",
              pageSize: "pageSize",
              limit: 99999,
              step: 500,
              checkFunction: function(res){
                  return !(!res.data || !res.data["grabActivityStatisticsList"] || res.data["grabActivityStatisticsList"].length == 0);
              }
          }).done(function (res) {
              var data = [];
              exportLoading = false;
              if(res.length > 0){
                  res.forEach(function (item) {
                      data = data.concat(item.grabActivityStatisticsList);
                  });
                  cb(data);
              }else{
                  exportLoading = false;
              }
          });
      }else{
          cb(checkStatus.data);
      }
    },
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
          "抢单数据.xlsx",
          "xlsx"
        );
        exportLog();
      }
      // 导出日志
      function exportLog() {
        var params = {
          operationModule: _this.logKey,
          dataPk: _this.orderNo,
          operationRemark: "导出抢单数据",
        };
        edipao.exportLog(params);
      }
    };
    var list = new List();
    list.init();
  });
