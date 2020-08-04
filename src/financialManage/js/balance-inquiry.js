var feeNameData = [
  {key: "预付款", value: "预付款"},
  {key: "到付款", value: "到付款"},
  {key: "尾款", value: "尾款"},
]

var feeTypeData = [
  {key: "运费", value: "运费"},
]

var withdrawStatusData = [
  {key: "未提现", value: "未提现"},
  {key: "打款中", value: "打款中"},
  {key: "打款成功", value: "打款成功"},
  {key: "打款失败", value: "打款失败"},
  {key: "不需要提现", value: "不需要提现"},
]

function timeNull(time){
  if(!time || time == "0") return "- -";
  time = time + "";
  var year = time.substring(0, 4);
  var month = time.substring(4, 6);
  var day = time.substring(6, 8);
  var h = time.substring(8, 10);
  var m = time.substring(10, 12);
  var s = time.substring(12, 14);
  return year + "-" + month + "-" + day + " " + h + ":" + m + ":" + s;
}

var tipsIndex = null;
$(document).on("click", function (e) {
  layer.close(tipsIndex);
});

layui
  .config({
    base: "../lib/",
  })
  .extend({
    excel: "layui_exts/excel.min",
    tableFilter: "TableFilter/tableFiltercopy",
  })
  .use(["jquery", "form", "table", "excel", "tableFilter", "laytpl"], function () {
    var $ = layui.jquery,
      edipao = layui.edipao,
      excel = layui.excel,
      table = layui.table,
      laytpl = layui.laytpl,
      tableFilter  = layui.tableFilter ,
      form = layui.form,
      tableIns,
      tableFilterIns,
      reloadOption = null,
      resizeTableTimer = null,
      where = {},
      permissionList = edipao.getMyPermission(),
      exportHead = {};
      console.log(permissionList);
      window.form = form;
      window.permissionList = permissionList;
    var showList = [
      'withdrawFlowNo',
      'orderNo', 'warehouseNo',
      'vinCode', 'transportAssignTime',
      'signTime', 'returnAuditTime',
      'feeType', 'feeName',
      'feeAmount', 'receiverName',
      'receiverIdNum', 'receiverBankName',
      'receiverAccountName', 'accountNumber',
      'payTime', 'withdrawTime',
      'withdrawStatus', 'remark',
      'toAccountTime', 'thirdFlowNo',
      "bankReceipt"
    ];
    var tableCols = [
      { checkbox: true, fixed: true, },
      { field: "withdrawFlowNo", title: "支付流水号", width: 250, templet: function (d) {
        return d.withdrawFlowNo ? d.withdrawFlowNo : "- -";
      }},
      { field: "orderNo", title: "业务单号", width: 120, templet: "#order_href" },
      { field: "warehouseNo", title: "仓库作业单号", minWidth: 180, width: 180, templet: function (d) {
        var str = d.warehouseNo;
        return str ? str.split(",").join("，\n") : "- -";
      }},
      { field: "vinCode", title: "车辆vin码", minWidth: 180, width: 180, templet: function (d) {
        var str = d.vinCode;
        return str ? str.split(",").join("，\n") : "- -";
      }},
      { field: "transportAssignTime", title: "运输商指派时间", minWidth: 180, width: 180, templet: function (d) {
        var str = d.transportAssignTime;
        return str ? str.split(",").join("，\n") : "- -";
      }},
      { field: "signTime", title: "扫码签收时间", width: 160, templet: function (d) {
          return d.signTime ? timeNull(d.signTime) : "- -";
      }},
      { field: "returnAuditTime", title: "回单审核时间", width: 160, templet: function (d) {
          return d.returnAuditTime ? timeNull(d.returnAuditTime) : "- -";
      }},
      { field: "feeType", title: "费用类型", width: 120, templet: function (d) {
          return d.feeType ? d.feeType : "- -";
      }},
      { field: "feeName", title: "费用名称", width: 120, templet: function (d) {
          return d.feeName ? d.feeName : "- -";
      }},
      { field: "feeAmount", title: "金额", width: 120, templet: function (d) {
          return d.feeAmount ? d.feeAmount + "元" : "- -";
      }},
      { field: "receiverName", title: "业务方", width: 160, templet: "#driver_href"},
      { field: "receiverIdNum", title: "身份证号码", width: 160, templet: function (d) {
          return d.receiverIdNum ? d.receiverIdNum : "- -";
      }},
      { field: "receiverBankName", title: "银行开户行", width: 160, templet: function (d) {
          return d.receiverBankName ? d.receiverBankName : "- -";
      }},
      { field: "receiverAccountName", title: "银行账户名", width: 130, templet: function (d) {
          return d.receiverAccountName ? d.receiverAccountName : "- -";
      }},
      { field: "receiverAccountNumber", title: "银行账号", width: 160, templet: function (d) {
          return d.receiverAccountNumber ? d.receiverAccountNumber : "- -";
      }},
      { field: "payTime", title: "支付完成时间", width: 160, templet: function (d) {
          return d.payTime ? timeNull(d.payTime) : "- -";
      }},
      { field: "withdrawTime", title: "提现发起时间", width: 160, templet: function (d) {
          return d.withdrawTime ? timeNull(d.withdrawTime) : "- -";
      }},
      { field: "withdrawStatus", title: "提现状态", width: 120, templet: function (d) {
          return d.withdrawStatus ? d.withdrawStatus : "- -";
      }},
      { field: "remark", title: "银行备注", width: 400, templet: function (d) {
          return d.remark ? d.remark : "- -";
      }},
      { field: "toAccountTime", title: "提现到账时间", width: 150, templet: function (d) {
          return d.toAccountTime ? timeNull(d.toAccountTime) : "- -";
      }},
      { field: "thirdFlowNo", title: "银行支付流水号", width: 200, templet: function (d) {
        return d.thirdFlowNo ? d.thirdFlowNo : "- -";
      }},
      { field: "bankReceipt", title: "银行回单", width: 120, templet: "#view_pic", },
    ]
    var toolField = {title: '操作', field: "operation", toolbar: '#rowBtns', align: 'left', fixed: 'right', width: 300};

    function Balance() {
      this.tableKey = "balance-order-list";
    }
    Balance.prototype.init = function () {
      var _this = this;
      if(permissionList.indexOf("导出") < 0){
        $("#export_data").remove();
      } 
      if(permissionList.indexOf("查看余额") > -1){
        edipao.request({
          type: "GET",
          url: "/admin/finance/balance/get",
          data: {},
        }).done(function (res) {
          if (res.code == 0) {
            $("#balanceNo").text(res.data);
          }
        });
      }
      edipao.request({
        type: "GET",
        url: "/admin/table/show-field/get",
        data: {
          tableName: this.tableKey,
        },
      }).done(function (res) {
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
          tableCols.push(toolField);
          _this.renderTable();
          _this.setTableFilter();
        }
      });
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
          res.data.financeDetailEntityList = res.data.financeDetailEntityList || [];
          if (res.code == 0) {
            return {
              code: res.code,
              msg: res.message,
              count: res.data.totalSize,
              data: res.data.financeDetailEntityList,
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
      $(".tips_btn").unbind().click(function (e) {
        layui.stope(e);
        var that = this;
        var context = e.currentTarget.dataset.context;
        var id = e.currentTarget.dataset.data;
        var strList = [];
        if(!id) return;
        _this.getOrder(id).done(function (res) {
          if(res.code == "0"){
            res.data = res.data || {};
            res.data.truckDTOList = res.data.truckDTOList || [];
            res.data.truckDTOList.forEach(function (item) {
              strList.push(item[context] || '');
            });
            tipsIndex = layer.tips(strList.join("，\n"), that, {time: 15000});
          }
        });
      });
      $(".view_driver_btn").unbind().on("click", function (e) {
        var key = e.target.dataset.data;
        xadmin.open('司机信息','../DriverManager/DriverArchives/info.html?id=' + key);
      });
      $(".view_order_btn").unbind().on("click", function (e) {
        var user = layui.sessionData("user"), pid;
        if (user) {
          layui.each(user.funcPermissionDTOList ,function(key,value){
            if(value.url.indexOf("order-list.html") > -1){
              pid = value.resourceId;
            }
          });
        }
        var key = e.target.dataset.data;
        var orderNo = e.target.dataset.no;
        xadmin.open('查看订单', '../orderMessage/order-view.html?orderNo=' + orderNo + "&orderId=" + key + "&action=view&perssionId=" + (pid || 200));
      });
      // $(".view_pic_btn").unbind().on("click", function (e) {
      //   laytpl($("#view_pic_tpl").html()).render({pic: e.target.dataset.data}, function (html) {
      //     layer.open({
      //       type: 1,
      //       title: "查看",
      //       content: html,
      //       area: "600px",
      //       success: function(){}
      //     });
      //   });
      // });
      zoomImg();
      table.on("tool(balanceList)", handleEvent);
      $(".top_tool_bar").unbind().on("click", function (e) {
        handleEvent({ event: e.target.dataset.event, data: {} });
      });
      function handleEvent(obj) {
        var data = obj.data;
        obj.event == "sync" && permissionList.indexOf("同步订单") == -1 && (obj.event = "reject");
        obj.event == "repay" && permissionList.indexOf("重新支付") == -1 && (obj.event = "reject");
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
            top.xadmin.open('操作日志', 'OperateLog/log.html?id=' + data.orderNo + '&type=14');
            break;
          case "reset_search":
            edipao.resetSearch("balanceList", function(){
                location.reload();
            });
            break;
          case "exportLog":
            xadmin.open('导出日志', '../../OperateLog/log.html?type=14&action=exportLog');
            break;
        }
      }
    }
    Balance.prototype.getOrder = function (id) {
      return edipao.request({
        method: "GET",
        url: "/admin/order/detail",
        data: { id: id }
      });
    }
    /**
     * @method handleSync
     * @desc 同步订单
     */
    Balance.prototype.handleSync = function (data) {
      layer.confirm("确认同步订单？", {icon: 3, title: "同步订单"}, function(){
        var loadIndex = layer.load(1);
        edipao.request({
          url: "/admin/finance/order/sync",
          data: { orderNo: data.orderNo },
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
          data: { orderNo: data.orderNo, withdrawFlowNo: data.withdrawFlowNo },
          method: "GET",
        }).done(function (res) {
          layer.close(loadIndex);
          if(res.code == "0"){
            layer.alert(res.data ? res.data : "重新发起支付成功", function () {
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
          layui.each(v, function (key, value) {
            if (key && showList.indexOf(key) != -1) {
              switch (key) {
                case "payTime":
                case "withdrawTime":
                case "toAccountTime":
                case "transportAssignTime":
                case "signTime":
                case "returnAuditTime":
                  exportObj[key] = timeNull(value);
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
          "已付流水.xlsx",
          "xlsx"
        );
        exportLog();
      }
      function DataNull(data) {
        if (data == null || data == "") {
          return "- -";
        } else {
          return data;
        }
      }
      // 导出日志
      function exportLog() {
        var params = {
          operationModule: 14,
          operationRemark: "导出已付流水",
        };
        edipao.exportLog(params);
      }
    };
    Balance.prototype.setTableFilter = function () {
      var filters = [
        { field: 'withdrawFlowNo', type: 'input' },
        { field: 'orderNo', type: 'input' },
        { field: 'warehouseNo', type: 'input' },
        { field: 'vinCode', type: 'input' },
        { field: 'transportAssignTime', type: 'timeslot' },
        { field: 'signTime', type: 'timeslot' },
        { field: 'returnAuditTime', type: 'timeslot' },
        { field: 'feeType', type: 'checkbox', data: feeTypeData },
        { field: 'feeName', type: 'checkbox', data: feeNameData },
        { field: 'feeAmount', type: 'numberslot' },
        { field: 'receiverName', type: 'input' },
        { field: 'receiverIdNum', type: 'input' },
        { field: 'receiverBankName', type: 'input' },
        { field: 'receiverAccountName', type: 'input' },
        { field: 'receiverAccountNumber', type: 'input' },
        { field: 'payTime', type: 'timeslot' },
        { field: 'withdrawTime', type: 'timeslot' },
        { field: 'withdrawStatus', type: 'checkbox', data: withdrawStatusData },
        { field: 'remark', type: 'input' },
        { field: 'toAccountTime', type: 'timeslot' },
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
                if(key=='withdrawStatus'||key=='feeType'||key=='feeName'){
                    where['searchFieldDTOList['+ index +'].fieldName'] = key;
                    where['searchFieldDTOList['+ index +'].fieldListValue'] = value.join(',');
                }else if(key=='feeAmount'){
                  where['searchFieldDTOList['+ index +'].fieldName'] = key;
                  where['searchFieldDTOList[' + index + '].fieldMinValue'] = value[0];
                  where['searchFieldDTOList[' + index + '].fieldMaxValue'] = value[1];
                }else if(key=='withdrawTime'||key=='toAccountTime'||key=='transportAssignTime'||key=='payTime'||key=='signTime'||key=='returnAuditTime'){
                  where['searchFieldDTOList['+ index +'].fieldName'] = key;
                  value = value.split(" 至 ");
                  where['searchFieldDTOList['+ index +'].fieldMinValue'] = value[0];
                  where['searchFieldDTOList['+ index +'].fieldMaxValue'] = value[1];
                }else{
                    where['searchFieldDTOList['+ index +'].fieldName'] = key;
                    where['searchFieldDTOList['+ index +'].fieldValue'] = value;
                }
                index++;
            });
            if(reload){
                reloadOption = { where: where, page: { curr: 1 }};
            }else{
                tableIns.reload( { where: where, page: { curr: 1 }});
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
      // $(".layui-table-fixed tbody td").each(function (index, item) {
      //   var $item = $(item);
      //   if($item.hasClass("layui-table-col-special")){
      //     $item.css("height", $($(".layui-table-body.layui-table-main tbody tr")[index]).find("td").height() - 1);
      //   }else{
      //     $item.css("height", $($(".layui-table-body.layui-table-main tbody tr")[index]).find("td").height());
      //   }
      // });
    }
    var balance = new Balance();
    balance.init();
  });
