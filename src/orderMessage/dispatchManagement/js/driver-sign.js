layui
  .config({
    base: "../../lib/",
  })
  .extend({
    excel: "layui_exts/excel.min",
    tableFilter: "TableFilter/tableFiltercopy",
  })
  .use(["jquery", "table", "layer", "excel", "tableFilter", "form"], function () {
    var depositStatusData = [
      { key: "0", value: "未支付" },
      { key: "1", value: "已支付" },
    ]
    var logKey = 23;
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
      { checkbox: true, fixed: 'left' },
      { field: "driverName", title: "司机姓名", width: 150, templet: function (d) {
        return d.driverName ? d.driverName : "- -";
      }},
      { field: "driverPhone", title: "司机手机", width: 200, templet: "#driverPhoneTpl"},
      { field: "driverIdNum", title: "司机身份证", width: 250, templet: function (d) {
        return d.driverIdNum ? d.driverIdNum : "- -";
      }},
      { field: "depositStatus", title: "押金状态", width: 150, templet: function (d) {
        var status = "- -";
        depositStatusData.some(function (item) {
          if(item.key == d.depositStatus){
            status = item.value;
            return true;
          }
        });
        return status;
      }},
      { field: "driveLicenceType", title: "驾照类型", width: 150, templet: function (d) {
        return d.driveLicenceType ? d.driveLicenceType : "- -";
      }},
      { field: "combCityNumber", title: "长春基地排名", width: 150, templet: function (d) {
        return d.combCityNumber || "- -";
      }},
      { field: "globalCityNumber", title: "总排名", width: 150, templet: function (d) {
        return d.globalCityNumber || "- -";
      }},
    ];
    function DataNull(data) {
      if (data == null || String(data) == "") {
        return "- -";
      } else {
        return data;
      }
    }
    function List() {
      this.tableKey = "driver-sign-list-table";
      $("#doc-content").html(`<table id="${this.tableKey}" lay-filter="${this.tableKey}"></table>`);
      this.dataKey = "driverSignDtoList";
      this.url = "/admin/driver/info/sign/stat";
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
        elem: "#" + _this.tableKey,
        id: _this.tableKey,
        url: edipao.API_HOST + "/admin/driver/info/sign/stat",
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
          res.data.driverSignDtoList = res.data.driverSignDtoList || [];
          res.data.driverSignDtoList.forEach(function (item) {
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
    }
    List.prototype.bindTableEvents = function () {
      var _this = this;
      table.on("tool("+this.tableKey+")", handleEvent);
      table.on("toolbar("+this.tableKey+")", handleEvent);
      table.on("checkbox("+this.tableKey+")", handleEvent);
      function handleEvent(obj) {
        obj.event == "export" && permissionList.indexOf(6011) == -1 && (obj.event = "reject");
        switch (obj.event) {
          case "reject":
            layer.alert("你没有访问权限", { icon: 2 });
            break;
          case "export":
            _this.exportExcel();
            break;
          case "tableSet":
            xadmin.open("表格设置", "./table-set.html?tableKey=" + _this.tableKey, 600, 500);
            break;
          case "reset_search":
            edipao.resetSearch(_this.tableKey, function(){
                location.reload();
            });
            break;
          case "exportLog":
            xadmin.open('导出日志', '../../OperateLog/log.html?type=' + logKey + '&action=exportLog');
            break;
        }
      }
    };
    List.prototype.initPermission = function () {
      if (permissionList.indexOf(6011) < 0) {
        $("#export_data").remove();
      }
    };
    List.prototype.setTableFilter = function () {
      var _this = this;
      var filters = [
        { field: "driverName", type: "input" },
        { field: "driverPhone", type: "input" },
        { field: "driverIdNum", type: "input" },
        { field: "depositStatus", type: "checkbox", data: depositStatusData },
        { field: "driveLicenceType", type: "input" },
        { field: "combCityNumber", type: "numberslot" },
        { field: "globalCityNumber", type: "numberslot" },
      ];
      tableFilterIns = tableFilter.render({
        elem: "#" + _this.tableKey, //table的选择器
        mode: "self", //过滤模式
        filters: filters, //过滤项配置
        done: function (filters, reload) {
          filters = $.extend({},filters);
          var index = 1;
          var where = Object.assign({
            loginStaffId: edipao.getLoginStaffId(),
          }, where);
          layui.each(filters, function (key, value) {
            if (key == "combCityNumber" || key == "globalCityNumber") {
              where["searchFieldDTOList[" + index + "].fieldName"] = key;
              where['searchFieldDTOList[' + index + '].fieldMinValue'] = value[0];
              where['searchFieldDTOList[' + index + '].fieldMaxValue'] = value[1];
            }else if(key == "depositStatus"){
              where['searchFieldDTOList['+ index +'].fieldName'] = key;
              where['searchFieldDTOList['+ index +'].fieldListValue'] = value.join(',');
            }else {
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
        layui.each(data, function (index, item) {
          var exportObj = {};
          layui.each(item, function (key, value) {
            if (key && showList.indexOf(key) != -1) {
              switch (key) {
                case "combCityNumber":
                case "globalCityNumber":
                  exportObj[key] = (value * 1) || "- -";
                  break;
                case "depositStatus":
                  var result = "- -";
                  depositStatusData.some(function (item2) {
                    if(item2.key == value){
                      result = item2.value;
                      return true;
                    }
                  });
                  exportObj[key] = result;
                  break;
                default:
                  exportObj[key] = DataNull(value);
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
          "导出司机签到数据.xlsx",
          "xlsx"
        );
        exportLog();
      }
      // 导出日志
      function exportLog() {
        var params = {
          operationModule: logKey,
          operationRemark: "导出司机签到数据",
        };
        edipao.exportLog(params);
      }
    };
    var list = new List();
    list.init();
  });
