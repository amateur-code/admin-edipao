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
      { key: "已通过", value: "已通过" },
      { key: "待审核", value: "待审核" },
      { key: "审核中", value: "审核中" },
      { key: "已驳回", value: "已驳回" },
    ];
    var typeData = [
      { key: "车损", value: "车损" },
      { key: "报备", value: "报备" },
      { key: "补油", value: "补油" },
      { key: "中途拍照", value: "中途拍照" },
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
    window.permissionList = edipao.getMyPermission();
    window.form = form;
    var where = {
      loginStaffId: edipao.getLoginStaffId(),
    };
    var showList = ["createTime", "type", "remark", "createUser", "status"];
    var exportHead = {}; // 导出头部
    var tableCols = [
      { checkbox: true },
      { field: "createTime", title: "时间", width: 200, templet: function (d) {
          return d.createTime ? d.createTime : "- -";
      }},
      { field: "type", title: "类型", width: 200, templet: function (d) {
          return d.type ? d.type : "- -";
      }},
      { field: "remark", title: "备注", width: 400, templet: function (d) {
          return d.remark ? d.remark : "- -";
      }},
      { field: "createUser", title: "上传人", width: 300, templet: function (d) {
          return d.createUser ? d.createUser : "- -";
      }},
      { field: "status", title: "状态", width: 200, templet: function (d) {
          return d.status ? d.status : "- -";
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
      this.tableKey = "order-vehicle-damage-list-table";
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
        elem: "#damageList",
        id: "damageList",
        url: edipao.API_HOST + "/admin/order/damage/list",
        method: "post",
        page: true,
        where: where,
        request: {
          pageName: "pageNo", //页码的参数名称
          limitName: "pageSize", //每页数据量的参数名
        },
        parseData: function (res) {
          edipao.codeMiddleware(res);
          var data = [];
          res.data = res.data || {};
          res.data.ordeDamageEntityList = res.data.ordeDamageEntityList || [];
          res.data.ordeDamageEntityList.forEach(function (item) {
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
    List.prototype.bindTableEvents = function () {
      // if(location.href.indexOf("test") > -1){
      //   $("#nav_cite").on("click", function (e) {
      //     top.xadmin.add_tab("demo", "customerManager/dotArchives/demo.html");
      //   });
      // }
      var _this = this;
      table.on("tool(damageList)", handleEvent);
      table.on("toolbar(damageList)", handleEvent);
      table.on("checkbox(damageList)", handleEvent);
      function handleEvent(obj) {
        var data = obj.data;
        obj.event == "add" && permissionList.indexOf("车损报备-新增") == -1 && (obj.event = "reject");
        obj.event == "edit" && permissionList.indexOf("车损报备-编辑") == -1 && (obj.event = "reject");
        obj.event == "export" && permissionList.indexOf("车损报备-导出") == -1 && (obj.event = "reject");

        switch (obj.event) {
          case "reject":
            layer.alert("你没有访问权限", { icon: 2 });
            break;
          case "add":
            xadmin.open("新增车损/报备", "./add.html?action=add&orderNo=" + _this.orderNo);
            break;
          case "export":
            _this.exportExcel();
            break;
          case "tableSet":
            xadmin.open("表格设置", "./table-set.html?tableKey=" + _this.tableKey, 600, 600);
            break;
          case "edit":
            xadmin.open("修改车损/报备", "./add.html?action=edit&id=" + data.id + "&orderNo=" + _this.orderNo);
            break;
          case "verify":
            xadmin.open("审核车损/报备", "./view.html?action=verify&id=" + data.id + "&orderNo=" + _this.orderNo);
            break;
          case "info":
            xadmin.open("查看车损/报备", "./view.html?action=view&id=" + data.id + "&orderNo=" + _this.orderNo);
            break;
          case "del":
            layer.confirm("确定删除吗？", { icon: 3, title: "提示" }, function (index) {
              edipao
                .request({
                  url: "/admin/customer/truckNetwork/del",
                  type: "POST",
                  data: {
                    id: data.id,
                  },
                })
                .then(function (res) {
                  if (res.code == 0) {
                    layer.msg("删除成功");
                    tableIns.reload( { where: where, page: { curr: 1 }} );
                  } else {
                    layer.msg(res.message);
                  }
                });
            });
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
        { field: "createTime", type: "timeslot" },
        { field: "type", type: "checkbox", data: typeData },
        { field: "remark", type: "input" },
        { field: "createUser", type: "contract" },
        { field: "status", type: "checkbox", data: statusData },
      ];
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
          "车损/报备数据.xlsx",
          "xlsx"
        );
        exportLog();
      }
      // 导出日志
      function exportLog() {
        var params = {
          operationModule: 15,
          dataPk: _this.orderNo,
          operationRemark: "导出车损/报备数据",
        };
        edipao.exportLog(params);
      }
    };
    var list = new List();
    list.init();
  });
