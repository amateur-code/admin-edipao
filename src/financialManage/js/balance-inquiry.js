layui
  .config({
    base: "../lib/",
  })
  .extend({
    excel: "layui_exts/excel.min",
    tableFilter: "TableFilter/tableFiltercopy",
  })
  .use(["jquery", "form", "table", "excel", "tableFilter"], function () {
    var $ = layui.jquery,
      edipao = layui.edipao,
      excel = layui.excel,
      table = layui.table,
      tableFilter  = layui.tableFilter ,
      form = layui.form,
      tableIns,
      tableFilterIns,
      reloadOption = null,
      resizeTableTimer = null,
      where = {};
    window.permissionList = edipao.getMyPermission();
    window.form = form;
    var tableCols = [
      { checkbox: true },
      { field: "company", title: "支付流水号", width: 100, templet: function (d) {
          return d.company ? d.company : "- -";
        },
      },
      { field: "orderNo", title: "业务单号", width: 105, templet: function (d) {
          return d.orderNo ? d.orderNo : "- -";
        },
      },
      { field: "company", title: "仓库作业单号", width: 100, templet: function (d) {
          return d.company ? d.company : "- -";
        },
      },
      { field: "company", title: "车辆vin码", width: 100, templet: function (d) {
          return d.company ? d.company : "- -";
        },
      },
      { field: "company", title: "运输商指派时间", width: 100, templet: function (d) {
          return d.company ? d.company : "- -";
        },
      },
      { field: "company", title: "扫码签收时间", width: 100, templet: function (d) {
          return d.company ? d.company : "- -";
        },
      },
      { field: "company", title: "回单审核时间", width: 100, templet: function (d) {
          return d.company ? d.company : "- -";
        },
      },
      { field: "company", title: "费用类型", width: 100, templet: function (d) {
          return d.company ? d.company : "- -";
        },
      },
      { field: "company", title: "费用名称", width: 100, templet: function (d) {
          return d.company ? d.company : "- -";
        },
      },
      { field: "company", title: "金额", width: 100, templet: function (d) {
          return d.company ? d.company : "- -";
        },
      },
      { field: "company", title: "业务方", width: 100, templet: function (d) {
          return d.company ? d.company : "- -";
        },
      },
      { field: "company", title: "身份证号码", width: 100, templet: function (d) {
          return d.company ? d.company : "- -";
        },
      },
      { field: "company", title: "银行开户行", width: 100, templet: function (d) {
          return d.company ? d.company : "- -";
        },
      },
      { field: "company", title: "银行账户名", width: 100, templet: function (d) {
          return d.company ? d.company : "- -";
        },
      },
      { field: "company", title: "银行账号", width: 100, templet: function (d) {
          return d.company ? d.company : "- -";
        },
      },
      { field: "company", title: "支付完成时间", width: 100, templet: function (d) {
          return d.company ? d.company : "- -";
        },
      },
      { field: "company", title: "提现发起时间", width: 100, templet: function (d) {
          return d.company ? d.company : "- -";
        },
      },
      { field: "company", title: "银行支付状态", width: 100, templet: function (d) {
          return d.company ? d.company : "- -";
        },
      },
      { field: "company", title: "银行备注", width: 100, templet: function (d) {
          return d.company ? d.company : "- -";
        },
      },
      { field: "company", title: "提现到账时间", width: 100, templet: function (d) {
          return d.company ? d.company : "- -";
        },
      },
      { field: "company", title: "银行支付流水号", width: 100, templet: function (d) {
          return d.company ? d.company : "- -";
        },
      },
      { field: "company", title: "银行回单", width: 100, templet: function (d) {
          return d.company ? d.company : "- -";
        },
      },
    ]
    var toolField = {title: '操作', field: "operation", toolbar: '#rowBtns', align: 'left', fixed: 'right', width: 300};

    function Balance() {}
    Balance.prototype.init = function () {
      edipao.request({
          type: "GET",
          url: "/admin/finance/balance/get",
          data: {},
      }).done(function (res) {
        if (res.code == 0) {
          $("#balanceNo").text(res.data);
        }
      });
      tableCols.push(toolField);
      this.renderTable();
      this.setTableFilter();
      this.bindTableEvents();
    };
    Balance.prototype.renderTable = function () {
      var _this = this;
      tableIns = table.render({
        elem: "#balanceList",
        id: "balanceList",
        url: layui.edipao.API_HOST+'/admin/order/list',
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
          res.data.orderDTOList = res.data.orderDTOList || [];
          res.data.orderDTOList.forEach(function (item) {
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
        defaultToolbar: [],
        cols: [tableCols],
        done: function (res, curr, count) {
          if (!res.data || res.data == null || res.data.length < 1) {
            $(".layui-table-header").css("overflow-x", "scroll");
          } else {
            $(window).unbind("resize");
            _this.resizeTable();
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
    Balance.prototype.bindTableEvents = function () {
      var _this = this;
      table.on("tool(balanceList)", handleEvent);
      table.on("toolbar(balanceList)", handleEvent);
      table.on("checkbox(balanceList)", handleEvent);
      function handleEvent(obj) {
        var data = obj.data;
        obj.event == "sync" && permissionList.indexOf("同步订单") == -1 && (obj.event = "reject");
        obj.event == "repay" && permissionList.indexOf("重新发起支付") == -1 && (obj.event = "reject");
        obj.event == "export" && permissionList.indexOf("导出") == -1 && (obj.event = "reject");

        switch (obj.event) {
          case "reject":
            layer.alert("你没有访问权限", { icon: 2 });
            break;
          case "export":
            _this.exportExcel();
            break;
          case "sync":
            _this.handleSync(data);
            break;
          case "repay":
            _this.handleRepay(data);
            break;
          case "log":
            break;
        }
      }
    }
    Balance.prototype.handleSync = function () {  }
    Balance.prototype.handleRepay = function () {  }
    Balance.prototype.exportExcel = function () {
      var _this = this;
      var checkStatus = table.checkStatus("balanceList");
      if (checkStatus.data.length > 0) {
        exportXlsx(checkStatus.data);
        return;
      }
      var param = where;
      param["pageNo"] = 1;
      param["pageSize"] = 9999;
      edipao
        .request({
          type: "GET",
          url: "/admin/order/list",
          data: param,
        })
        .done(function (res) {
          if (res.code == 0) {
            if (res.data) {
              res.data = res.data || {};
              res.data.orderDTOList = res.data.orderDTOList || [];
              var data = res.data.orderDTOList;
              exportXlsx(data);
            }
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
          "已付流水.xlsx",
          "xlsx"
        );
        var ids = [];
        data.forEach(function (item) {
          ids.push(item.id);
        });
        exportLog(ids.join(","));
      }
      // 导出日志
      function exportLog(ids) {
        var params = {
          operationModule: 10,
          operationRemark: "导出已付流水",
        };
        if (ids) params.dataPkList = ids;
        edipao.exportLog(params);
      }
    };
    Balance.prototype.setTableFilter = function () {
      var filters = [
        { field: "company", type: "input" },
        { field: "orderNo", type: "input" },
        { field: "company", type: "input" },
        { field: "company", type: "input" },
        { field: "company", type: "input" },
        { field: "company", type: "input" },
        { field: "company", type: "input" },
        { field: "company", type: "input" },
        { field: "company", type: "input" },
        { field: "company", type: "input" },
        { field: "company", type: "input" },
        { field: "company", type: "input" },
        { field: "company", type: "input" },
        { field: "company", type: "input" },
        { field: "company", type: "input" },
        { field: "company", type: "input" },
        { field: "company", type: "input" },
        { field: "company", type: "input" },
        { field: "company", type: "input" },
        { field: "company", type: "input" },
        { field: "company", type: "input" },
        { field: "company", type: "input" },
      ]
      tableFilterIns = tableFilter.render({
        'elem' : '#balanceList',//table的选择器
        'mode' : 'self',//过滤模式
        'filters' : filters,//过滤项配置
        'done': function (filters, reload) {
            filters = $.extend({},filters);
            var index = 0;
            where = {
                loginStaffId: edipao.getLoginStaffId()
            };
            layui.each(filters, function (key, value) {
                if(key=='startProvince'||key=='endProvince'){
                    where['searchFieldDTOList['+ index +'].fieldName'] = key;
                    where['searchFieldDTOList['+ index +'].fieldValue'] = value[key];
                }else{
                    where['searchFieldDTOList['+ index +'].fieldName'] = key;
                    where['searchFieldDTOList['+ index +'].fieldValue'] = value;
                }
                index++;
            });
            if(reload){
                reloadOption = { where: where, page: { curr: 1 }};
            }else{
                mainTable.reload( { where: where, page: { curr: 1 }});
            }
        }
      });
    }
    Balance.prototype.resizeTable = function () {
      var dur = 500;
      var w = "390px";
      var backw = "100px";
      var r = "-1px";
      var backr = "-290px";
      if(resizeTableTimer) clearTimeout(resizeTableTimer);
      resizeTableTimer = setTimeout(function () {
          $(".layui-table-main td[data-field=operation]").css("border-color","#ffffff").css("background","#ffffff").find(".layui-table-cell").css("width", backw).html("");
          $(".layui-table-box>.layui-table-header th[data-field=operation]").css("border", "none").css("color", "#f2f2f2");
          var $fixed = $(".layui-table-fixed.layui-table-fixed-r");
          $fixed.removeClass("layui-hide").find(".layui-table-body").css("height", "auto");
          $fixed.find(".layui-table-header").css("overflow", "visible")
          $fixed.find(".layui-table-filter").css("left","60px");
          $fixed.find("thead .layui-table-cell").css("position", "relative");
          if(!$fixed.find(".opeartion_icon").length) $fixed.find("thead .layui-table-cell").append("<i class='layui-icon opeartion_icon layui-icon-prev'></i>");
          $fixed.animate({"right": backr}, 500, function () {
              $(".opeartion_icon").unbind().on("click", function (e) {
                  var $this = $(this);
                  if($this.hasClass("layui-icon-prev")){
                      $(".layui-table-main td[data-field=operation] .layui-table-cell").css("width", w);
                      $this.removeClass("layui-icon-prev").addClass("layui-icon-next");
                      $fixed.animate({"right": r}, 500);
                  }else{
                      $(".layui-table-main td[data-field=operation] .layui-table-cell").css("width", backw);
                      $this.removeClass("layui-icon-next").addClass("layui-icon-prev");
                      $fixed.animate({"right": backr}, 500);
                  }
              });
          });
      }, dur);
    }
    var balance = new Balance();
    balance.init();
  });
