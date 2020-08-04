layui
  .config({
    base: "../../lib/",
  })
  .extend({
    excel: "layui_exts/excel.min",
    tableFilter: "TableFilter/tableFiltercopy",
  })
  .use(["jquery", "table", "layer", "excel", "tableFilter", "form"], function () {
    
    var combinationWayData = [
      { key: 1, value: "人工" },
      { key: 2, value: "系统" },
    ]
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
    window.permissionList = edipao.getPermissionIdList();
    window.form = form;
    var where = {
      loginStaffId: edipao.getLoginStaffId(),
    };
    var showList = ["createTime", "type", "remark", "createUser", "status"];
    var exportHead = {}; // 导出头部
    var tableCols = [
      { checkbox: true },
      { field: "combinationOrderName", title: "组合名称", width: 200, templet: function (d) {
          return d.combinationOrderName ? d.combinationOrderName : "- -";
      }},
      { field: "orderCount", title: "订单数量", width: 150, templet: "#orderCountTpl"},
      { field: "noDispatchOrderCount", title: "未调度订单", width: 150, templet: "#noDispatchOrderCountTpl"},
      { field: "combinationWay", title: "组合方式", width: 150, templet: function (d) {
        var res = "- -";
        combinationWayData.some(function (item) {
          if(item.key == d.combinationWay){
            res = item.value;
            return true;
          }
        });
        return res;
      }},
      { field: "certificateCode", title: "驾照要求", width: 150, templet: function (d) {
          return d.certificateCode ? d.certificateCode : "- -";
      }},
      { field: "createTime", title: "创建时间", width: 150, templet: function (d) {
          return d.createTime ? d.createTime : "- -";
      }},
      { title: "操作", field: "operation", width: 320, fixed: "right", toolbar: "#rowBtns" },
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
      this.tableKey = "order-compose-list-table";
      this.logKey = 26;
      this.dataKey = "grabCombinationOrderList";
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
            _this.bindTableEvents();
          }
        });
    };
    List.prototype.renderTable = function () {
      var _this = this;
      tableIns = table.render({
        elem: "#" + _this.tableKey,
        id: _this.tableKey,
        url: edipao.API_HOST + "/admin/grab/combination-order/list",
        page: true,
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
          _this.bindEvents();
          if (!res.data || res.data == null || res.data.length < 1) {
            $(".layui-table-header").css("overflow-x", "scroll");
          } else {
            $(window).unbind("resize");
            resizeTable();
            $(".layui-table-header").css("overflow", "hidden");
          }
          if(reloadOption) {
            tableIns.reload(JSON.parse(JSON.stringify(reloadOption)));
            reloadOption = false;
          }
          tableFilterIns && tableFilterIns.reload(); // 搜索
        },
      });
      var resizeTime = null;
      function resizeTable() {
        var w = "100px";
        var backw = "320px";
        var backl = "-1px";
        var l = "-215px";
        var dur = 300;
        $(".opeartion_icon").removeClass("layui-icon-next").addClass("layui-icon-prev");
        if (resizeTime) clearTimeout(resizeTime);
        resizeTime = setTimeout(function () {
          $(".layui-table-main td[data-field=operation]")
            .css("border-color", "#ffffff")
            .css("background", "#ffffff")
            .find(".layui-table-cell")
            .css("width", w)
            .html("");
          $(".layui-table-box>.layui-table-header th[data-field=operation]")
            .css("border", "none")
            .css("color", "#f2f2f2");
          var $fixed = $(".layui-table-fixed.layui-table-fixed-r");
          $fixed.removeClass("layui-hide").find(".layui-table-body").css("height", "auto");
          $fixed.find(".layui-table-header").css("overflow", "visible");
          $fixed.find(".layui-table-filter").css("left", "60px");
          $fixed.find("thead .layui-table-cell").css("position", "relative");
          if (!$fixed.find(".opeartion_icon").length)
            $fixed.find("thead .layui-table-cell").append("<i class='layui-icon opeartion_icon layui-icon-prev'></i>");
          $fixed.animate({ right: l }, dur, function () {
            $(".opeartion_icon")
              .unbind()
              .on("click", function (e) {
                var $this = $(this);
                if ($this.hasClass("layui-icon-prev")) {
                  $(".layui-table-main td[data-field=operation] .layui-table-cell").css("width", backw);
                  $this.removeClass("layui-icon-prev").addClass("layui-icon-next");
                  $fixed.animate({ right: backl }, dur);
                } else {
                  $(".layui-table-main td[data-field=operation] .layui-table-cell").css("width", w);
                  $this.removeClass("layui-icon-next").addClass("layui-icon-prev");
                  $fixed.animate({ right: l }, dur);
                }
              });
          });
        }, dur);
      }
    };
    List.prototype.bindEvents = function () {
      $(".href_order_count").unbind().on("click", function (e) {
        var no = e.target.dataset.no, name = e.target.dataset.name;
        xadmin.open("查看订单", "./orderAdd.html?action=all&combinationOrderNo=" + no + "&combinationOrderName=" + name);
      });
      $(".href_order_count_no_dispatch").unbind().on("click", function (e) {
        var no = e.target.dataset.no, name = e.target.dataset.name;
        xadmin.open("查看订单", "./orderAdd.html?action=noDispatch&combinationOrderNo=" + no + "&combinationOrderName=" + name);
      });
    }
    List.prototype.bindTableEvents = function () {
      var _this = this;
      table.on("tool("+_this.tableKey+")", handleEvent);
      table.on("toolbar("+_this.tableKey+")", handleEvent);
      table.on("checkbox("+_this.tableKey+")", handleEvent);
      function handleEvent(obj) {
        var data = obj.data;
        // obj.event == "export" && permissionList.indexOf("车损报备-导出") == -1 && (obj.event = "reject");

        switch (obj.event) {
          case "one_add":
            _this.openOneAdd();
            break;
          case "reject":
            layer.alert("你没有访问权限", { icon: 2 });
            break;
          case "remove_order":
            xadmin.open("减少订单", "./orderAdd.html?action=remove&combinationOrderNo=" + data.combinationOrderNo + "&combinationOrderName=" + data.combinationOrderName);
            break;
          case "add_order":
            xadmin.open("添加订单", "./orderAdd.html?action=add&combinationOrderNo=" + data.combinationOrderNo + "&combinationOrderName=" + data.combinationOrderName);
            break;
          case "discompose_order":
            layer.confirm("确定打散该订单组合吗？", { icon: 3, title: "提示" }, function (index) {
              edipao.request({
                url: "/admin/grab/combination-order/breakup",
                type: "POST",
                data: {
                  combinationOrderNo: data.combinationOrderNo,
                },
              }).done(function (res) {
                if (res.code == 0) {
                  layer.msg("打散成功", {icon: 1});
                  tableIns.reload( { where: where, page: { curr: 1 }} );
                } else {
                  layer.msg(res.message);
                }
              });
            });
            break;
          case "export":
            _this.exportExcel();
            break;
          case "tableSet":
            xadmin.open("表格设置", "./table-set.html?tableKey=" + _this.tableKey, 600, 500);
            break;
          case "add":
            xadmin.open("订单组合 / 新增组合", "./addCompose.html");
            break;
          case "log":
            xadmin.open("操作日志", "../../OperateLog/log.html?id=" + data.combinationOrderNo + "&type=" + _this.logKey);
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
    };
    List.prototype.openOneAdd = function () {
      var _this = this;
      var index = layer.open({
        title: "一键新增",
        area: "400px",
        content: $("#one_add_tpl").html(),
        btn: ["确认", "取消"],
        yes: function(){
            edipao.request({
                url: "/admin/order/cancelOrder",
                data: {
                    loginStaffId: user.staffId,
                    id: data.id
                }
            }).done(function (res) {
                if(res.code == "0"){
                    layer.msg("创建成功");
                    layer.close(index);
                    mainTable.reload( { where: where, page: { curr: 1 }});
                }else{
                    layer.msg(res.message, {icon: 5,anim: 6});
                }
            });
        },
        success: function () {
          form.render("checkbox");
        }
    });
    }
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
        { field: "combinationOrderName", type: "input" },
        { field: "orderCount", type: "numberslot" },
        { field: "noDispatchOrderCount", type: "numberslot" },
        { field: "certificateCode", type: "input" },
        { field: "combinationWay", type: "checkbox", data: combinationWayData },
        { field: "createTime", type: "timeslot" },
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
            if (key == "createTime") {
              where['searchFieldDTOList['+ index +'].fieldName'] = key;
              value = value.split(" 至 ");
              where['searchFieldDTOList['+ index +'].fieldMinValue'] = value[0];
              where['searchFieldDTOList['+ index +'].fieldMaxValue'] = value[1];
            }else if(key == "combinationWay"){
              where['searchFieldDTOList['+ index +'].fieldName'] = key;
              where['searchFieldDTOList['+ index +'].fieldListValue'] = value.join(',');
            } else if(key == "orderCount" || key == "noDispatchOrderCount"){
              where["searchFieldDTOList[" + index + "].fieldName"] = key;
              where['searchFieldDTOList[' + index + '].fieldMinValue'] = value[0];
              where['searchFieldDTOList[' + index + '].fieldMaxValue'] = value[1];
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
                case "combinationWay":
                  var res = "- -";
                  combinationWayData.some(function (item) {
                    if(item.key == v[value]){
                      res = item.value;
                      return true;
                    }
                  });
                  exportObj[index] = res;
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
          "订单组合数据.xlsx",
          "xlsx"
        );
        exportLog();
      }
      // 导出日志
      function exportLog() {
        var params = {
          operationModule: _this.logKey,
          operationRemark: "导出订单组合数据",
        };
        edipao.exportLog(params);
      }
    };
    var list = new List();
    list.init();
  });
