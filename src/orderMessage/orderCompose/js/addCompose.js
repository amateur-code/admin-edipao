var orderTypeData = [
  {key: 1, value: "单车单"},
  {key: 2, value: "背车单"},
]
var dispatchModeData = [
  {key: 1, value: "人工调度"},
  {key: 2, value: "抢单"},
  {key: 3, value: "抢单转人工"},
  {key: 4, value: "抢单变人工"},
  {key: 5, value: "短驳直发"},
]
layui
  .config({
    base: "../../lib/",
  })
  .extend({
    excel: "layui_exts/excel.min",
    tableFilter: "TableFilter/tableFiltercopy",
  })
  .use(["jquery", "table", "layer", "form"], function () {
    var table = layui.table,
      layer = layui.layer,
      edipao = layui.edipao,
      form = layui.form,
      edipao = layui.edipao,
      tableIns;
    window.permissionList = edipao.getPermissionIdList();
    window.form = form;
    var tableCols = [
      {type: 'checkbox', fixed: 'left'},
      {field: 'orderNo', title: '业务单号', sort: false,minWidth:105, templet: "#orderNoTpl"},
      {field: 'warehouseNo', title: '仓库单号', sort: false,minWidth:140, templet: function(d){
          return d.warehouseNo ? d.warehouseNo : '- -';
      }},
      {field: 'vinCode', title: 'VIN码', sort: false,width: 200,minWidth:100, templet: function(d){
          return d.vinCode ? d.vinCode : '- -';
      }},
      {field: 'tempLicense', title: '临牌号', sort: false,minWidth:100,minWidth:100, templet: function(d){
          return d.tempLicense ? d.tempLicense : '- -';
      }},
      {field: 'orderType', title: '订单类型', sort: false,minWidth:100, templet: function (d) {
        if(d.masterFlag != "是") return "";
        var value = '- -';
        orderTypeData.some(function (status) {
            if(status.key == d.orderType){
                value = status.value;
                return true;
            }
        });
        return value;
      }},
      {field: 'customerFullName', title: '客户全称', sort: false, width: 120, templet: function(d){
          return d.customerFullName ? d.customerFullName : '- -';
      }},
      {field: 'startWarehouse', title: '发车仓库', sort: false, width: 200, templet: function(d){
          return d.startWarehouse ? d.startWarehouse : '- -';
      }},
      {field: 'startPark', title: '发车停车场', sort: false, width: 200, templet: function(d){
          return d.startPark ? d.startPark : '- -';
      }},
      {field: 'startProvince', title: '发车省', sort: false,minWidth:100, templet: function(d){
          return d.startProvince ? d.startProvince : '- -';
      }},
      {field: 'startCity', title: '发车城市', sort: false,minWidth:100, templet: function(d){
          return d.startCity ? d.startCity : '- -';
      }},
      {field: 'startAddress', title: '发车地址', sort: false, width: 300, templet: function(d){
          return d.startAddress ? d.startAddress : '- -';
      }},
      {field: 'endPark', title: '收车网点', sort: false, width: 300, templet: function(d){
          return d.endPark ? d.endPark : '- -';
      }},
      {field: 'endProvince', title: '收车省', sort: false,minWidth:100, templet: function(d){
          return d.endProvince ? d.endProvince : '- -';
      }},
      {field: 'endCity', title: '收车城市', sort: false,minWidth:100, templet: function(d){
          return d.endCity ? d.endCity : '- -';
      }},
      {field: 'endAddress', title: '收车地址', sort: false, width: 300, templet: function(d){
          return d.endAddress ? d.endAddress : '- -';
      }},
      {field: 'transportMode', title: '运输方式', sort: false, width: 100, templet: function(d){
        if(d.masterFlag != "是") return "";
        return d.transportMode ? d.transportMode : '- -';
      }},
      {field: 'transportAssignTime', title: '运输商指派时间', sort: false,width: 200, templet: function(d){
          return d.transportAssignTime ? d.transportAssignTime : '- -';
      }},
      {field: 'income', title: '收入金额', sort: false,width: 150, templet: function(d){
        if(d.masterFlag != "是") return "";
        return d.income ? (d.income + "元") : '- -';
      }},
      {field: 'deliveryOperator', title: '发运经理', sort: false, minWidth:180, templet: function(d){
        if(d.masterFlag != "是") return "";
        d.deliveryOperator = d.deliveryOperator || "";
        d.deliveryOperatorPhone = d.deliveryOperatorPhone || "";
        return (d.deliveryOperator || d.deliveryOperatorPhone) ? d.deliveryOperator + d.deliveryOperatorPhone : '- -';
      }},
      {field: 'dispatchMode', title: '调度方式', sort: false, minWidth: 145, templet: function(d){
        if(d.masterFlag != "是") return "";
        var result = "";
        dispatchModeData.some(function(item){
            if(item.key == d.dispatchMode){
                result = item.value;
                return true;
            }
        });
        return result || "- -";
      }},
      {field: 'prePayAmount', title: '预付款金额', sort: false,width: 200, hide: false, templet: function (d) {
        if(d.masterFlag != "是") return "";
        return d.prePayAmount + "元";
      }},
      {field: 'prePayAmount', title: '油升数', sort: false,width: 200, hide: false, templet: function (d) {
        if(d.masterFlag != "是") return "";
        return d.prePayOil + "升";
      }},
      {field: 'arrivePayAmount', title: '到付款金额', sort: false,width: 200, hide: false, templet: function (d) {
        if(d.masterFlag != "是") return "";
        return d.arrivePayAmount + "元";
      }},
      {field: 'tailPayAmount', title: '尾款金额', sort: false,width: 200, hide: false, templet: function (d) {
        if(d.masterFlag != "是") return "";
        return d.tailPayAmount + "元";
      }},
      { title: "操作", field: "operation", width: 100, fixed: "right", toolbar: "#rowBtns" },
    ];
    function DataNull(data) {
      if (data == null || data == "") {
        return "- -";
      } else {
        return data;
      }
    }
    function List() {
      this.orderList = [];
    }
    List.prototype.init = function () {
      var _this = this;
      _this.renderTable();
      _this.bindTableEvents();
    };
    List.prototype.renderTable = function () {
      var _this = this;
      tableIns = table.render({
        elem: "#orderList",
        id: "orderList",
        limit: 99999,
        data: _this.orderList,
        toolbar: "#headerBtns",
        defaultToolbar: [],
        cols: [tableCols],
        done: function (res, curr, count) {
          _this.bindEvents();
        },
      });
    };
    List.prototype.bindTableEvents = function () {
      var _this = this;
      $("#add_order_btn").unbind().on("click", function () {
        xadmin.open("添加订单", "./orderAdd.html?action=new");
      });
      $("#addConfirm").unbind().on("click", _this.submitOrder.bind(_this));
      $("#addCancel").unbind().on("click", xadmin.close);
      $(window).on("message", function (e) {
        var message = e.originalEvent.data;
        var origin = e.originalEvent.origin;
        if(origin.indexOf("edipao") == -1) return;
        switch(message.type){
          case "addOrder":
            _this.addOrder(_this.orderFilter(message.data));
            break;
        }
      });
      table.on("tool(orderList)", handleEvent);
      function handleEvent(obj) {
        switch (obj.event) {
          case "remove":
            _this.removeOrder(obj.data.orderNo);
            tableIns.reload({
              data: _this.orderList,
            });
            break;
        }
      }
    };
    List.prototype.submitOrder = function () {
      var orderNoList = [], _this = this;
      if(_this.orderList.length == 0) return layer.msg("请添加订单！", {icon: 2});
      _this.orderList.forEach(function (item) {
        if(orderNoList.indexOf(item.orderNo) < 0){
          orderNoList.push(item.orderNo);
        }
      });
      var loadIndex = layer.load(1, {time: 10000});
      edipao.request({
        url: "/admin/grab/combination-order/add",
        data: {
          orderNoList: orderNoList.join(","),
        }
      }).done(function (res) {
        if(res.code == 0){
          layer.alert("添加成功", {icon: 1}, function () {
            xadmin.close();
            xadmin.father_reload();
          });
        }
      }).always(function () { layer.close(loadIndex); });
    }
    List.prototype.bindEvents = function () {
      $(".href_order_no").unbind().on("click", function (e) {
        var orderNo = e.target.dataset.orderno;
        var pid = 200;
        top.xadmin.open('查看订单', '/orderMessage/order-view.html?orderNo=' + orderNo + "&action=view&perssionId=" + pid);
      });
    }
    List.prototype.orderFilter = function (orderList) {
      var res = [], orderNoList = this.orderList.map(function (item) { return item.orderNo });
      orderList.forEach(function (item) {
        if(orderNoList.indexOf(item.orderNo) < 0){
          res.push(item);
        }
      });
      return res;
    }
    List.prototype.addOrder = function (orderList) {
      var _this = this;
      _this.orderList = _this.orderList.concat(orderList);
      console.log(_this.orderList)
      tableIns.reload({
        data: _this.orderList,
      });
    }
    List.prototype.removeOrder = function (orderNo) {
      this.orderList = this.orderList.filter(function (item) {
        return item.orderNo != orderNo;
      });
    }
    var list = new List();
    list.init();
  });
