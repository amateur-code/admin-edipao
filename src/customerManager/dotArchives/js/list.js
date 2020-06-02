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
      { key: "1", value: "有效" },
      { key: "2", value: "失效" },
    ];
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
    console.log(permissionList)
    window.form = form;
    var where = {};
    var showList = ["company", "endProvince", "endAddress", "addrCode", "connectorName", "remark","deliveryOperator", "feeJson","grabOrderHot", "transportOrderNum", "status"];
    var exportHead = {}; // 导出头部
    var tableCols = [
      { checkbox: true },
      {
        field: "company",
        title: "网点名称",
        width: 300,
        templet: function (d) {
          return d.company ? d.company : "- -";
        },
      },
      {
        field: "endProvince",
        title: "所在省市",
        width: 130,
        templet: function (d) {
          if (!d.endProvince && !d.endCity) return "- -";
          return d.endProvince + d.endCity;
        },
      },
      {
        field: "endAddress",
        title: "详细地址",
        width: 400,
        templet: function (d) {
          return d.endAddress ? d.endAddress : "- -";
        },
      },
      {
        field: "addrCode",
        title: "地址代码",
        width: 130,
        templet: function (d) {
          return d.addrCode ? d.addrCode : "- -";
        },
      },
      {
        field: "connectorName",
        title: "联系人",
        width: 150,
        templet: function (d) {
          if (!d.connectorName && !d.connectorPhone) return "- -";
          return d.connectorName + d.connectorPhone;
        },
      },
      {
        field: "remark",
        title: "备注",
        width: 400,
        templet: function (d) {
          return d.remark ? d.remark : "- -";
        },
      },
      {
        field: "deliveryOperator",
        title: "发运经理",
        width: 200,
        templet: function (d) {
            d.deliveryOperator = d.deliveryOperator || "";
            d.deliveryOperatorPhone = d.deliveryOperatorPhone || "";
            return (d.deliveryOperator || d.deliveryOperatorPhone) ? d.deliveryOperator + d.deliveryOperatorPhone : '- -';
        },
      },
      {
        field: "feeJson",
        title: "费用模板",
        width: 200,
        templet: function (d) {
          var feeJson, feeName = [];
          try {
            feeJson = JSON.parse(d.feeJson) || [];
          } catch (error) {
            feeJson = [];
          }
          feeJson.forEach(function (item) {
            feeName.push(item.startWarehouse + "-" + item.name);
          });
          return feeName.join("，");
        },
      },
      {
        field: "grabOrderHot",
        title: "抢单热度",
        width: 200,
        templet: function (d) {
          return (d.grabOrderHot || d.grabOrderHot == 0) ? d.grabOrderHot : "- -";
        },
      },
      {
        field: "transportOrderNum",
        title: "发运趟数",
        width: 100,
        templet: function (d) {
          return d.transportOrderNum || d.transportOrderNum == "0" ? d.transportOrderNum : "- -";
        },
      },
      {
        field: "status",
        title: "状态",
        width: 100,
        templet: function (d) {
          switch (d.status + "") {
            case "1":
              return "有效";
            case "2":
              return "失效";
            default:
              return "- -";
          }
        },
      },
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
      this.tableKey = "customer-manager-dot-list-table";
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
        elem: "#dotList",
        id: "dotList",
        url: edipao.API_HOST + "/admin/customer/truckNetwork/list",
        page: true,
        where: {
          loginStaffId: edipao.getLoginStaffId(),
        },
        request: {
          pageName: "pageNo", //页码的参数名称
          limitName: "pageSize", //每页数据量的参数名
        },
        parseData: function (res) {
          edipao.codeMiddleware(res);
          var data = [];
          res.data = res.data || {};
          res.data.receiveTruckNetworkRespList = res.data.receiveTruckNetworkRespList || [];
          res.data.receiveTruckNetworkRespList.forEach(function (item) {
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
      table.on("tool(dotList)", handleEvent);
      table.on("toolbar(dotList)", handleEvent);
      table.on("checkbox(dotList)", handleEvent);
      function handleEvent(obj) {
        var data = obj.data;
        obj.event == "add" && permissionList.indexOf("新增") == -1 && (obj.event = "reject");
        obj.event == "edit" && permissionList.indexOf("修改") == -1 && (obj.event = "reject");
        obj.event == "del" && permissionList.indexOf("删除") == -1 && (obj.event = "reject");
        // obj.event == "verify" && permissionList.indexOf("审核") == -1 && (obj.event = "reject");
        obj.event == "export" && permissionList.indexOf("导出") == -1 && (obj.event = "reject");

        switch (obj.event) {
          case "reject":
            layer.alert("你没有访问权限", { icon: 2 });
            break;
          case "add":
            xadmin.open("新增网点", "./add.html");
            break;
          case "export":
            _this.exportExcel();
            break;
          case "tableSet":
            xadmin.open("表格设置", "./table-set.html?tableKey=" + _this.tableKey, 600, 600);
            break;
          case "edit":
            xadmin.open("修改网点", "./add.html?action=edit&id=" + data.id);
            break;
          case "verify":
            xadmin.open("审核网点", "./view.html?action=verify&id=" + data.id);
            break;
          case "info":
            xadmin.open("查看网点", "./view.html?action=view&id=" + data.id);
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
            xadmin.open("操作日志", "../../OperateLog/log.html?id=" + data.id + "&type=10");
            break;
          case "reset_search":
            edipao.resetSearch("dotList", function(){
                location.reload();
            });
            break;
          case "exportLog":
            xadmin.open('导出日志', '../../OperateLog/log.html?type=10&action=exportLog');
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
      var filters = [
        { field: "company", type: "input" },
        { field: "endProvince", type: "provincecity" },
        { field: "endAddress", type: "input" },
        { field: "addrCode", type: "input" },
        { field: "connectorName", type: "contract" },
        { field: "deliveryOperator", type: "contract" },
        { field: "feeJson", type: "input" },
        { field: "grabOrderHot", type: "numberslot" },
        { field: "transportOrderNum", type: "numberslot" },
        { field: "status", type: "checkbox", data: statusData },
      ];
      tableFilterIns = tableFilter.render({
        elem: "#dotList", //table的选择器
        mode: "self", //过滤模式
        filters: filters, //过滤项配置
        done: function (filters, reload) {
          filters = $.extend({},filters);
          var index = 0;
          where = {
            loginStaffId: edipao.getLoginStaffId(),
          };
          layui.each(filters, function (key, value) {
            if(key == "grabOrderHot" || key == "transportOrderNum"){
              where["searchFieldDTOList[" + index + "].fieldName"] = key;
              where['searchFieldDTOList[' + index + '].fieldMinValue'] = value[0];
              where['searchFieldDTOList[' + index + '].fieldMaxValue'] = value[1];
            } else if (key == "endProvince") {
              where["searchFieldDTOList[" + index + "].fieldName"] = "endProvince";
              where["searchFieldDTOList[" + index++ + "].fieldValue"] = value.province;
              where["searchFieldDTOList[" + index + "].fieldName"] = "endCity";
              where["searchFieldDTOList[" + index + "].fieldValue"] = value.city;
            } else if(key == "status"){
              where['searchFieldDTOList['+ index +'].fieldName'] = key;
              where['searchFieldDTOList['+ index +'].fieldListValue'] = value.join(',');
            }else if(key == "connectorName"){
              if(value[0]){
                where["searchFieldDTOList[" + index + "].fieldName"] = "connectorName";
                where["searchFieldDTOList[" + index + "].fieldValue"] = value[0];
              }
              if(value[0] && value[1]) index++;
              if(value[1]){
                where["searchFieldDTOList[" + index + "].fieldName"] = "connectorPhone";
                where["searchFieldDTOList[" + index + "].fieldValue"] = value[1];
              }
            }else if(key == "deliveryOperator"){
              if(value[0]){
                where["searchFieldDTOList[" + index + "].fieldName"] = "deliveryOperator";
                where["searchFieldDTOList[" + index + "].fieldValue"] = value[0];
              }
              if(value[0] && value[1]) index++;
              if(value[1]){
                where["searchFieldDTOList[" + index + "].fieldName"] = "deliveryOperatorPhone";
                where["searchFieldDTOList[" + index + "].fieldValue"] = value[1];
              }
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
      var checkStatus = table.checkStatus("dotList");
      if (checkStatus.data.length > 0) {
        exportXlsx(checkStatus.data);
        return;
      }
      var param = JSON.parse(JSON.stringify(where));
      param["pageNo"] = 1;
      param["pageSize"] = 9999;
      edipao
        .request({
          type: "GET",
          url: "/admin/customer/truckNetwork/list",
          data: param,
        })
        .done(function (res) {
          if (res.code == 0) {
            if (res.data) {
              res.data = res.data || {};
              res.data.receiveTruckNetworkRespList = res.data.receiveTruckNetworkRespList || [];
              var data = res.data.receiveTruckNetworkRespList;
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
                case "feeJson":
                  var feeJson, feeName = [];
                  try {
                    feeJson = JSON.parse(v["feeJson"]) || [];
                  } catch (error) {
                    feeJson = [];
                  }
                  feeJson.forEach(function (item) {
                    feeName.push(item.startWarehouse + "-" + item.name);
                  });
                  exportObj[index] = feeName.join("，") || "- -";
                  break;
                case "status":
                  exportObj[index] = v["statusDesc"] || "- -";
                  break;
                case "connectorName":
                  if(!v.connectorName && !v.connectorPhone){
                    exportObj[index] = "- -";
                  }else{
                    exportObj[index] = v.connectorName + v.connectorPhone;
                  }
                  break;
                case "deliveryOperator":
                  if(!v.deliveryOperator && !v.deliveryOperatorPhone){
                    exportObj[index] = "- -";
                  }else{
                    exportObj[index] = v.deliveryOperator + v.deliveryOperatorPhone;
                  }
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
          "网点档案.xlsx",
          "xlsx"
        );
        exportLog();
      }
      // 导出日志
      function exportLog() {
        var params = {
          operationModule: 10,
          operationRemark: "导出网点档案",
        };
        edipao.exportLog(params);
      }
    };
    var list = new List();
    list.init();
  });
