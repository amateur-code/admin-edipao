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
    edipao = layui.edipao,
    tableIns,
    tableFilterIns,
    reloadOption = null;
  var clientData = [
    {key: 1, value: "司机APP"},
  ];
  var where = {
    loginStaffId: edipao.getLoginStaffId(),
  };
  var showList = [], exportHead = {};
  var tableCols = [
    { checkbox: true, fixed: "left" },
    { field: "sendStartTime", title: "开始时间", width: 150, templet: function (d) {
      return d.sendStartTime || "- -";
    }},
    { field: "sendEndTime", title: "结束时间", width: 150, templet: function (d) {
      return d.sendEndTime || "- -";
    }},
    { field: "content", title: "消息内容", width: 400, templet: function(d){
      return d.content || "- -";
    }},
    { field: "msgClient", title: "推送对象", width: 150, templet: function(d){
      var res = "- -";
      clientData.some(function (item) {
        if(item.key == d.msgClient){
          res = item.value;
          return true;
        }
      });
      return res;
    }},
    { title: "操作", width: 200, fixed: "right", toolbar: "#rowBtns" },
  ];
  function View() {
    this.detail = null;
    this.tableKey = "driver-push-list";
    this.logKey = 26;
    this.dataKey = "msgDtoList";
    this.url = "/admin/msg/list";
  }
  View.prototype.init = function(){
    var _this = this;
    _this.bindTableEvents();
    _this.setTableFilter();
    edipao
    .request({
      type: "GET",
      url: "/admin/table/show-field/get",
      data: {
        tableName: this.tableKey,
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
          showList = tableCols.map(function (item) { 
            return item.field == "operation" ? false : item.field; 
          });
          layui.each(tableCols, function (index, item) {
            if (item.field && showList.indexOf(item.field) != -1) {
              if (item.field && item.field !== "" && item.field != "right" && item.field != "left") {
                exportHead[item.field] = item.title;
              }
            }
          });
        }
        _this.renderTable();
      }
    });
  }
  View.prototype.renderTable = function () {
    var _this = this;
    tableIns = table.render({
      elem: "#" + _this.tableKey,
      id: _this.tableKey,
      url: edipao.API_HOST + _this.url,
      method: "post",
      page: true,
      loading: true,
      where: where,
      request: {
        pageName: "pageNo", //页码的参数名称
        limitName: "pageSize", //每页数据量的参数名
      },
      parseData: function (res) {
        edipao.codeMiddleware(res);
        res.data = res.data || {};
        res.data[_this.dataKey] = res.data[_this.dataKey] || [];
        if (res.code == 0) {
          return {
            code: res.code,
            msg: res.message,
            count: res.data.totalSize,
            data: res.data[_this.dataKey],
          };
        }
      },
      toolbar: "#headerBtns",
      defaultToolbar: [],
      cols: [tableCols],
      done: function (res, curr, count) {
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
  }
  View.prototype.bindTableEvents = function () {
    var _this = this;
    table.on("tool("+_this.tableKey+")", handleEvent);
    table.on("toolbar("+_this.tableKey+")", handleEvent);
    function handleEvent(obj) {
      var data = obj.data;
      switch (obj.event) {
        case "add":
          xadmin.open("添加消息推送", "./push-edit.html?action=add");
          break;
        case "edit":
          xadmin.open("修改消息推送", "./push-edit.html?action=edit&id=" + data.msgId);
          break;
        case "delete":
          layer.confirm("确认删除该消息？", { icon: 3, title: "提示" }, function (index) {
            var loadIndex = layer.load(1);
            edipao.request({
              url: "/admin/msg/delete",
              type: "POST",
              data: {
                msgId: data.msgId,
              },
            }).done(function (res) {
              if (res.code == 0) {
                layer.msg("删除成功", {icon: 1});
                tableIns.reload( { where: where, page: { curr: 1 }} );
              } else {
                layer.msg(res.message);
              }
            }).always(function () { layer.close(loadIndex); });
          });
          break;
        case "export":
          _this.exportExcel();
          break;
        case "tableSet":
          xadmin.open("表格设置", "./table-set.html?tableKey=" + _this.tableKey, 600, 500);
          break;
        case "log":
          xadmin.open("操作日志", "../../OperateLog/log.html?id=" + data.msgId + "&type=" + _this.logKey);
          break;
        case "reset_search":
          edipao.resetSearch(_this.tableKey, function(){
              location.reload();
          });
          break;
        case "exportLog":
          xadmin.open('导出日志', '../../OperateLog/log.html?type='+_this.logKey+'&action=exportLog');
          break;
      }
    }
  }
  View.prototype.setTableFilter = function () {
    var _this = this;
    var filters = [
      { field: "content", type: "input" },
      { field: "sendStartTime", type: "timeslot" },
      { field: "sendEndTime", type: "timeslot" },
      { field: "msgClient", type: "checkbox", data: clientData },
    ];
    tableFilterIns = tableFilter.render({
      elem: "#" + _this.tableKey, //table的选择器
      mode: "self", //过滤模式
      filters: filters, //过滤项配置
      done: function (filters, reload) {
        filters = $.extend({},filters);
        var index = 0;
        where = {
          loginStaffId: edipao.getLoginStaffId(),
        };
        layui.each(filters, function (key, value) {
          if (key == "sendStartTime" || key == "sendEndTime") {
            where['searchFieldDTOList['+ index +'].fieldName'] = key;
            value = value.split(" 至 ");
            where['searchFieldDTOList['+ index +'].fieldMinValue'] = value[0];
            where['searchFieldDTOList['+ index +'].fieldMaxValue'] = value[1];
          }else if(key == "msgClient"){
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
  }
  var exportLoading = false;
  View.prototype.getExportData = function (cb) {
    var _this = this;
    var checkStatus = table.checkStatus(_this.tableKey);
    if(checkStatus.data.length < 1){
      if(exportLoading) return layer.msg("数据正在下载，暂不能操作。");
      layer.msg("正在下载数据，请勿退出系统或者关闭浏览器");
      exportLoading = true;
      edipao.exportData({
        params: where,
        url: _this.url,
        method: "post",
        pageSize: "pageSize",
        limit: 99999,
        checkFunction: function(res){
          return !(!res.data || !res.data[_this.dataKey] || res.data[_this.dataKey].length == 0);
        }
      }).done(function (res) {
        var data = [];
        exportLoading = false;
        res.forEach(function (item) {
          data = data.concat(item);
        });
        cb(data);
      });
    }else{
      cb(checkStatus.data);
    }
  }
  View.prototype.exportExcel = function () {
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
              case "sendStartTime":
                exportObj[index] = v[index] + "-" + v["sendEndTime"];
                break;
              default:
                exportObj[index] = DataNull(item);
            }
          }
        });
        exportData.push(exportObj);
      });
      console.log(exportData)
      // 导出
      excel.exportExcel(
        {
          sheet1: exportData,
        },
        "消息推送数据.xlsx",
        "xlsx"
      );
      // exportLog();
    }
    // 导出日志
    function exportLog() {
      var params = {
        operationModule: _this.logKey,
        operationRemark: "导出消息推送数据",
      };
      edipao.exportLog(params);
    }
  };
  var view = new View();
  view.init();
});