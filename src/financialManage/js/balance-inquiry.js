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
      where = {},
      permissionList = edipao.getMyPermission(),
      exportHead = {};
      permissionList = permissionList.concat(["同步订单", "重新发起支付", "导出"]);
      console.log(permissionList);
      window.form = form;
    var showList = [
      'depositTradeNumber',
      'orderNo', 'warehouseNo',
      'vinCode', 'transportAssignTime',
      'signTime', 'returnAuditTime',
      'feeType', 'feeName',
      'feeAmount', 'receiver',
      'receiverIdNum', 'receiverBankName',
      'receiverAccountName', 'accountNumber',
      'payTime', 'withdrawTime',
      'withdrawStatus', 'remark',
      'toAccountTime', 'thirdFlowNo',
      "bankReceipt"
    ];
    var tableCols = [
      { checkbox: true },
      { field: "depositTradeNumber", title: "支付流水号", width: 120, templet: function (d) {
          return d.depositTradeNumber ? d.depositTradeNumber : "- -";
      }},
      { field: "orderNo", title: "业务单号", width: 105, templet: function (d) {
          return d.orderNo ? d.orderNo : "- -";
      }},
      { field: "warehouseNo", title: "仓库作业单号", width: 100, templet: function (d) {
          return d.warehouseNo ? d.warehouseNo : "- -";
      }},
      { field: "vinCode", title: "车辆vin码", width: 100, templet: function (d) {
          return d.vinCode ? d.vinCode : "- -";
      }},
      { field: "transportAssignTime", title: "运输商指派时间", width: 100, templet: function (d) {
          return d.transportAssignTime ? d.transportAssignTime : "- -";
      }},
      { field: "signTime", title: "扫码签收时间", width: 100, templet: function (d) {
          return d.signTime ? d.signTime : "- -";
      }},
      { field: "returnAuditTime", title: "回单审核时间", width: 100, templet: function (d) {
          return d.returnAuditTime ? d.returnAuditTime : "- -";
      }},
      { field: "feeType", title: "费用类型", width: 100, templet: function (d) {
          return d.feeType ? d.feeType : "- -";
      }},
      { field: "feeName", title: "费用名称", width: 100, templet: function (d) {
          return d.feeName ? d.feeName : "- -";
      }},
      { field: "feeAmount", title: "金额", width: 100, templet: function (d) {
          return d.feeAmount ? d.feeAmount : "- -";
      }},
      { field: "receiver", title: "业务方", width: 100, templet: function (d) {
          return d.receiver ? d.receiver : "- -";
      }},
      { field: "receiverIdNum", title: "身份证号码", width: 100, templet: function (d) {
          return d.receiverIdNum ? d.receiverIdNum : "- -";
      }},
      { field: "receiverBankName", title: "银行开户行", width: 100, templet: function (d) {
          return d.receiverBankName ? d.receiverBankName : "- -";
      }},
      { field: "receiverAccountName", title: "银行账户名", width: 100, templet: function (d) {
          return d.receiverAccountName ? d.receiverAccountName : "- -";
      }},
      { field: "accountNumber", title: "银行账号", width: 100, templet: function (d) {
          return d.accountNumber ? d.accountNumber : "- -";
      }},
      { field: "payTime", title: "支付完成时间", width: 100, templet: function (d) {
          return d.payTime ? d.payTime : "- -";
      }},
      { field: "withdrawTime", title: "提现发起时间", width: 100, templet: function (d) {
          return d.withdrawTime ? d.withdrawTime : "- -";
      }},
      { field: "withdrawStatus", title: "银行支付状态", width: 100, templet: function (d) {
          return d.withdrawStatus ? d.withdrawStatus : "- -";
      }},
      { field: "remark", title: "银行备注", width: 100, templet: function (d) {
          return d.remark ? d.remark : "- -";
      }},
      { field: "toAccountTime", title: "提现到账时间", width: 100, templet: function (d) {
          return d.toAccountTime ? d.toAccountTime : "- -";
      }},
      { field: "thirdFlowNo", title: "银行支付流水号", width: 100, templet: function (d) {
          return d.thirdFlowNo ? d.thirdFlowNo : "- -";
      }},
      { field: "bankReceipt", title: "银行回单", width: 100, templet: "#view_pic", },
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
    };
    Balance.prototype.renderTable = function () {
      var _this = this;
      tableIns = table.render({
        elem: "#balanceList",
        id: "balanceList",
        url: layui.edipao.API_HOST + '/admin/finance/pay-flow/get',
        limit: 10,
        limits: [10, 20, 30],
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
          if (res.code == 0) {
            return {
              code: res.code,
              msg: res.message,
              count: res.data.totalSize,
              data: res.data.orderDTOList,
            };
          }
        },
        defaultToolbar: [],
        cols: [tableCols],
        done: function (res, curr, count) {
          _this.bindTableEvents();
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
      $(".view_pic_btn").unbind().on("click", function(e){
        console.log(e)
      });
      table.on("tool(balanceList)", handleEvent);
      $(".top_tool_bar").unbind().on("click", function (e) {
        handleEvent({ event: e.target.dataset.event, data: {} });
      });
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
          case "table_set":
            xadmin.open('表格设置', './table-set.html?tableKey=balance-order-list', 600, 400);
            break;
          case "log":
            top.xadmin.open('操作日志', 'OperateLog/log.html?id=' + data.id + '&type=4');
            break;
        }
      }
    }
    /**
     * @method handleSync
     * @desc 同步订单
     */
    Balance.prototype.handleSync = function (data) {
      var loadIndex = layer.load(1);
      edipao.request({
        url: "/admin/finance/order/sync",
        data: { paymentNumber: data.paymentNumber },
        method: "GET",
      }).done(function (res) {
        layer.close(loadIndex);
        if(res.code == "0"){
          layer.alert("订单已重新发起同步。", function () {
            layer.closeAll();
            tableIns.reload( { where: where, page: { curr: 1 }} );
          }, function () {
            layer.closeAll();
            // tableIns.reload( { where: where, page: { curr: 1 }} );
          });
        }
      }).fail(function () {
        layer.close(loadIndex);
      });
    }
    /**
     * @method handleRepay
     * @desc 发起支付
     */
    Balance.prototype.handleRepay = function (data) {
      layer.confirm("确认重新发起支付？", {icon: 3, title: "重新发起支付"}, 
      function () {
        var loadIndex = layer.load(1);
        edipao.request({
          url: "/admin/finance/pay/again",
          data: { paymentNumber: data.paymentNumber },
          method: "GET",
        }).done(function (res) {
          layer.close(loadIndex);
          if(res.code == "0"){
            layer.alert("费用已重新发起支付。", function () {
              layer.closeAll();
              tableIns.reload( { where: where, page: { curr: 1 }} );
            }, function () {
              layer.closeAll();
              // tableIns.reload( { where: where, page: { curr: 1 }} );
            });
          }
        }).fail(function () {
          layer.close(loadIndex);
        });
      });
    }
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
          url: "/admin/finance/pay-flow/get",
          data: param,
        })
        .done(function (res) {
          if (res.code == 0) {
            if (res.data) {
              res.data = res.data || {};
              res.data.financeDetailEntityList = res.data.financeDetailEntityList || [];
              var data = res.data.financeDetailEntityList;
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
      function DataNull(data) {
        if (data == null || data == "") {
          return "--";
        } else {
          return data;
        }
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
        { field: 'depositTradeNumber', type: 'input' },
        { field: 'orderNo', type: 'input' },
        { field: 'warehouseNo', type: 'input' },
        { field: 'vinCode', type: 'input' },
        { field: 'transportAssignTime', type: 'timeslot' },
        { field: 'signTime', type: 'input' },
        { field: 'returnAuditTime', type: 'input' },
        { field: 'feeType', type: 'input' },
        { field: 'feeName', type: 'input' },
        { field: 'feeAmount', type: 'input' },
        { field: 'receiver', type: 'input' },
        { field: 'receiverIdNum', type: 'input' },
        { field: 'receiverBankName', type: 'input' },
        { field: 'receiverAccountName', type: 'input' },
        { field: 'accountNumber', type: 'input' },
        { field: 'payTime', type: 'input' },
        { field: 'withdrawTime', type: 'input' },
        { field: 'withdrawStatus', type: 'input' },
        { field: 'remark', type: 'input' },
        { field: 'toAccountTime', type: 'input' },
        { field: 'thirdFlowNo', type: 'input' },
        // { field: "银行回单", type: "input" },
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
      var w = "300px";
      var backw = "100px";
      var r = "-1px";
      var backr = "-200px";
      $(".opeartion_icon").removeClass("layui-icon-next").addClass("layui-icon-prev");
      if(resizeTableTimer) clearTimeout(resizeTableTimer);
      resizeTableTimer = setTimeout(function () {
          $(".layui-table-main td[data-field=operation]").css("border-color","#ffffff").css("background","#ffffff").find(".layui-table-cell").css("width", backw).html("");
          $(".layui-table-box>.layui-table-header th[data-field=operation]").css("border", "none").css("color", "#f2f2f2");
          var $fixed = $(".layui-table-fixed.layui-table-fixed-r");
          $fixed.removeClass("layui-hide").find(".layui-table-body").css("height", "auto");
          $fixed.find(".layui-table-header").css("overflow", "visible")
          $fixed.find(".layui-table-filter").css("left","60px");
          $fixed.find("thead .layui-table-cell").css("position", "relative");
          if(!$fixed.find(".opeartion_icon").length) $fixed.find("thead .layui-table-cell").append("<i style='cursor:pointer;' class='layui-icon opeartion_icon layui-icon-prev'></i>");
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
