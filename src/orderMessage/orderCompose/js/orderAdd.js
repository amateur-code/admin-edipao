//过滤器数据
var orderStatusData = [
    {key: 1, value: "待调度"},
    {key: 2, value: "待发车"},
    {key: 3, value: "运输中"},
    {key: 44, value: "已收车未扫码"},
    {key: 4, value: "已收车"},
    {key: 5, value: "已完结"},
    {key: 6, value: "已取消"},
]
var orderTypeData = [
    {key: 1, value: "单车单"},
    {key: 2, value: "背车单"},
]
var operationData = [
    {key: 1, value: "待审核"},
]
var feeData = [
    {key: 1, value: "待支付"},
    {key: 2, value: "支付中"},
    {key: 3, value: "支付成功"}
]
var picData = [
    {key: 1, value: "未上传"},
    {key: 2, value: "已上传"},
]
var tailPayStatusData = [
    {key: 1, value: "待支付"},
    {key: 2, value: "支付中"},
    {key: 3, value: "支付成功"},
    {key: 4, value: "支付失败"},
    {key: 5, value: "未到期"},
]
var masterFlagData = [
    {key: "否", value: "上车"},
    {key: "是", value: "下车"},
]
var dispatchModeData = [
    {key: 1, value: "人工调度"},
    {key: 2, value: "抢单"},
    {key: 3, value: "抢单转人工"},
    {key: 4, value: "抢单变人工"},
    {key: 5, value: "短驳直发"},
]
var jingxiaoshangData = [
    {key: "未收迟到", value: "未收迟到"},
    {key: "未签收", value: "未签收"},
    {key: "签收迟到", value: "签收迟到"},
    {key: "正常", value: "正常"},
]
var hegezhengData = [
    {key: "未收迟到", value: "未收迟到"},
    {key: "未签收", value: "未签收"},
    {key: "签收迟到", value: "签收迟到"},
    {key: "正常", value: "正常"},
]
var transportModeData = [
    {key: "国道", value: "国道"},
    {key: "高速", value: "高速"},
    {key: "部分高速", value: "部分高速"},
]
var exportLoading = false;

function DataNull(data) {
    if (data == null || data == "") {
        return "- -";
    } else {
        return data;
    }
}
var provinceList = [];
var loadLayer = null;
var paying = false;
var reloadOption = null;
layui.config({
    base: '../../lib/'
}).extend({
    excel: 'layui_exts/excel.min',
    tableFilter: 'TableFilter/tableFiltercopy',
}).use(['form', 'jquery','layer', 'upload', 'table','laytpl', 'excel', 'tableFilter'], function () {
    var tableName = "orderCompose-order-add-list";
    var mainTable;
    var table = layui.table;
    var $ = layui.jquery;
    var form = layui.form;
    window.form = form;
    var layer = layui.layer;
    var edipao = layui.edipao;
    var tableFilter = layui.tableFilter;
    var user = JSON.parse(sessionStorage.user);
    var orderDTOList = [];
    var dataPermission = edipao.getDataPermission();
    window.dataPermission = dataPermission;
    var permissionList = edipao.getMyPermission();
    window.permissionList = permissionList;
    var loadLayer = layer.load(1);
    var exportHead = {};
    var where = {
        loginStaffId: user.staffId,
    };
    var tableKey = "orderCompose-add-order-list";
    var filters = [
        { field: 'orderNo', type: 'input' },
        { field: 'warehouseNo', type: 'input' },
        { field: 'vinCode', type: 'input' },
        { field: 'tempLicense', type: 'input' },
        { field: 'orderStatus', type: 'checkbox', data: orderStatusData },
        { field: 'orderType', type: 'checkbox', data:orderTypeData },
        // { field: "masterFlag", type: "checkbox", data: masterFlagData},
        { field: 'customerFullName', type: 'input' },
        { field: 'startWarehouse', type: 'input' },
        { field: 'startPark', type: 'input' },
        { field: 'startProvince', type: 'province' },
        { field: 'startCity', type: 'provincecity' },
        { field: 'startAddress', type: 'input' },
        { field: 'endPark', type: 'input' },
        { field: "endProvince", type: "province" },
        { field: 'endCity', type: 'provincecity' },
        { field: 'endAddress', type: 'input' },
        { field: 'transportMode', type: 'checkbox', data: transportModeData },
        { field: 'transportAssignTime', type: 'timeslot' },
        { field: 'cksj', type: 'timeslot' },
        { field: 'dispatchTime', type: 'timeslot' },
        { field: 'openOperator', type: 'contract' },
        { field: 'deliveryOperator', type: 'contract' },
        { field: 'dispatchOperator', type: 'contract' },
        { field: 'dispatchMode', type: 'checkbox', data: dispatchModeData },
        { field: 'driverName', type: 'input' },
        { field: 'driverPhone', type: 'input' },
        { field: 'driverIdCard', type: 'input' },
        { field: 'customerMileage', type: 'numberslot' },
        { field: 'pricePerMeliage', type: 'numberslot' },
        { field: 'income', type: 'numberslot' },
        { field: 'driverMileage', type: 'numberslot' },
        { field: 'prePayTime', type: 'timeslot' },
        { field: 'arrivePayTime', type: 'timeslot' },
        { field: 'tailPayTime', type: 'timeslot' },
        { field: 'prePayAmount', type: 'checkbox-numberslot', data: feeData },
        { field: 'arrivePayAmount', type: 'checkbox-numberslot', data: feeData },
        { field: 'tailPayAmount', type: 'checkbox-numberslot', data: feeData },
        { field: 'tailPayStatus', type: 'checkbox', data: tailPayStatusData },
        { field: 'feeName', type: 'input' },
        { field: 'carModel', type: 'input' },
        { field: 'fetchTruckTime', type: 'timeslot' },
        { field: 'startTruckTime', type: 'timeslot' },
        { field: 'returnAuditStatus', type: 'checkbox', data: picData },
        { field: 'dealerSignTime', type: 'timeslot' },
        { field: 'dealerEval', type: 'input' },
        { field: 'certificateSignTime', type: 'timeslot' },
        { field: 'dealerRemark', type: 'input' },
        { field: 'carDamageCount', type: 'numberslot' },
    ]
    // 自定义验证规则
    form.verify({
        provinceVerify: function(value) {
            if(value==''||value=='请选择省份'){
                return '请选择省份';
            }
        },
        cityVerify: function(value) {
            if(value==''||value=='请选择市级'){
                return '请选择市级';
            }
        }
    });
    // 获取城市数据
    edipao.request({
        url: '/admin/city/all',
    }).done(res=>{
        if(res.code == 0){
            var data = res.data;
            if(data){
                provinceList = toTree(data);
            }
        }else{
            layer.msg(res.message)
        }
    })
    function toTree(data) {
        var val = [
            {
                name: '请选择省份',
                code:'',
                cityList: [
                    { name: '请选择市级', areaList: [],code:'', },
                ]
            }
        ];
        var level2 = [];
        layui.each(data,function (index,item) {
            if(item.level == 1){
                var cityList = []
                if(item.province.indexOf('北京')=='-1'&&item.province.indexOf('天津')=='-1'&&item.province.indexOf('上海')=='-1'&&item.province.indexOf('重庆')=='-1'){
                    cityList = [{ name: '全部', areaList: []}]
                }
                val.push({
                    name: item.province,
                    code:item.code,
                    cityList:cityList
                })
            }else{
                level2.push(item)
            }
        });

        layui.each(val,function (k,v) {
            layui.each(level2,function (m,n) {
                if(v.name==n.province){
                    val[k]['cityList'].push({
                        name: n.city,
                        code:n.code,
                        areaList:[]
                    });
                }
            })
        });
        return val;
    }
    tableFilterIns = tableFilter.render({
        'elem' : '#' + tableKey,//table的选择器
        'mode' : 'self',//过滤模式
        'filters' : filters,//过滤项配置
        'done': function(filters, reload){
            filters = $.extend({},filters);
            var index = 0;
            where = {
                loginStaffId: edipao.getLoginStaffId()
            };
            if(filters.openOperator){
                filters.openOperatorPhone =  filters.openOperator[1];
                filters.openOperator =  filters.openOperator[0];
            }
            if(filters.deliveryOperator){
                filters.deliveryOperatorPhone =  filters.deliveryOperator[1];
                filters.deliveryOperator =  filters.deliveryOperator[0];
            }
            if(filters.dispatchOperator){
                filters.dispatchOperatorPhone =  filters.dispatchOperator[1];
                filters.dispatchOperator =  filters.dispatchOperator[0];
            }
            delete filters.operation;
            layui.each(filters,function(key, value){
                if(key=='startProvince'||key=='endProvince'){
                    where['searchFieldDTOList['+ index +'].fieldName'] = key;
                    where['searchFieldDTOList['+ index +'].fieldValue'] = value[key];
                }else if(key == "customerMileage" || key == "pricePerMeliage" || key == "income" || key == "driverMileage"||key=="carDamageCount"){
                    where["searchFieldDTOList[" + index + "].fieldName"] = key;
                    where['searchFieldDTOList[' + index + '].fieldMinValue'] = value[0];
                    where['searchFieldDTOList[' + index + '].fieldMaxValue'] = value[1];
                }else if(key=='startCity'||key=='endCity'){ 
                    if(value.city == "全部") value.city = "";
                    if(key == "startCity"){
                        where['searchFieldDTOList['+ index +'].fieldName'] = "startProvince";
                        where['searchFieldDTOList['+ index++ +'].fieldValue'] = value.province;
                        where['searchFieldDTOList['+ index +'].fieldName'] = "startCity";
                        where['searchFieldDTOList['+ index +'].fieldValue'] = value.city;
                    }else if(key=='endCity'){
                        where['searchFieldDTOList['+ index +'].fieldName'] = "endProvince";
                        where['searchFieldDTOList['+ index++ +'].fieldValue'] = value.province;
                        where['searchFieldDTOList['+ index +'].fieldName'] = "endCity";
                        where['searchFieldDTOList['+ index +'].fieldValue'] = value.city;
                    }
                }else if(key == 'prePayAmount'||key == 'arrivePayAmount'||key == "tailPayAmount"){
                    if(value.slot.length > 0){
                        where['searchFieldDTOList['+ index +'].fieldName'] = key;
                        where['searchFieldDTOList['+ index +'].fieldMinValue'] = value.slot[0];
                        where['searchFieldDTOList['+ index +'].fieldMaxValue'] = value.slot[1];
                        if(value.checked.length > 0) index++;
                    }
                    if(value.checked.length > 0){
                        where['searchFieldDTOList['+ index +'].fieldName'] = key.replace("Amount", "Status");
                        where['searchFieldDTOList['+ index +'].fieldListValue'] = value.checked.join(',');
                    }
                }else if(key == "orderStatus"){
                    var checkSign, checkFetch;
                    checkFetch = value.indexOf("4") > -1;
                    checkSign = value.indexOf("44") > -1;
                    value = value.filter(function (item) {
                        return item != "44";
                    });
                    value = value || [];
                    if((checkSign && checkFetch) || (!checkSign && !checkFetch)){
                        where['searchFieldDTOList['+ index +'].fieldName'] = key;
                        where['searchFieldDTOList['+ index +'].fieldListValue'] = value.join(',');
                    }else if(checkSign && !checkFetch){
                        value.push("4");
                        where['searchFieldDTOList['+ index +'].fieldName'] = key;
                        where['searchFieldDTOList['+ index++ +'].fieldListValue'] = value.join(',');
                        where['searchFieldDTOList['+ index +'].fieldName'] = "dealerSignTime";
                        where['searchFieldDTOList['+ index +'].fieldMinValue'] = "0";
                        where['searchFieldDTOList['+ index +'].fieldMaxValue'] = "1";
                    }else if(!checkSign && checkFetch){
                        where['searchFieldDTOList['+ index +'].fieldName'] = key;
                        where['searchFieldDTOList['+ index++ +'].fieldListValue'] = value.join(',');
                        where['searchFieldDTOList['+ index +'].fieldName'] = "dealerSignTime";
                        where['searchFieldDTOList['+ index +'].fieldMinValue'] = "1980-01-01 00:00:00";
                        where['searchFieldDTOList['+ index +'].fieldMaxValue'] = "2999-01-01 00:00:00";
                    }
                }else if(key == "cksj" || key == "dealerSignTime" || key == "certificateSignTime" || key=="arrivePayTime"||key=="prePayTime"||key=="tailPayTime"||key=="transportAssignTime"||key=="fetchTruckTime"||key=="dispatchTime" || key == "startTruckTime"){
                    where['searchFieldDTOList['+ index +'].fieldName'] = key;
                    value = value.split(" 至 ");
                    where['searchFieldDTOList['+ index +'].fieldMinValue'] = value[0];
                    where['searchFieldDTOList['+ index +'].fieldMaxValue'] = value[1];
                }else if(key == "orderType" || key == "tailPayStatus" || key == "masterFlag"){
                    where['searchFieldDTOList['+ index +'].fieldName'] = key;
                    where['searchFieldDTOList['+ index +'].fieldListValue'] = value.join(',');
                }else if(key == "returnAuditStatus" || key == "dispatchMode" || key == "transportMode"){
                    where['searchFieldDTOList['+ index +'].fieldName'] = key;
                    where['searchFieldDTOList['+ index +'].fieldListValue'] = value.join(',');
                }else if(key == "carModel"){
                    where['searchFieldDTOList['+ index +'].fieldName'] = "feeItemJson";
                    where['searchFieldDTOList['+ index +'].fieldValue'] = value;
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
        {field: 'startWarehouse', title: '发车仓库', sort: false, width: 400, templet: function(d){
            return d.startWarehouse ? d.startWarehouse : '- -';
        }},
        {field: 'startPark', title: '发车停车场', sort: false, width: 400, templet: function(d){
            return d.startPark ? d.startPark : '- -';
        }},
        {field: 'startProvince', title: '发车省', sort: false,minWidth:100, templet: function(d){
            return d.startProvince ? d.startProvince : '- -';
        }},
        {field: 'startCity', title: '发车城市', sort: false,minWidth:100, templet: function(d){
            return d.startCity ? d.startCity : '- -';
        }},
        {field: 'startAddress', title: '发车地址', sort: false, width: 400, templet: function(d){
            return d.startAddress ? d.startAddress : '- -';
        }},
        {field: 'endPark', title: '收车网点', sort: false, width: 400, templet: function(d){
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
            return d.transportMode ? d.transportMode : '- -';
        }},
        {field: 'transportAssignTime', title: '运输商指派时间', sort: false,width: 200, templet: function(d){
            return d.transportAssignTime ? d.transportAssignTime : '- -';
        }},
        {field: 'income', title: '收入金额', sort: false,width: 150, templet: function(d){
            if(dataPermission.canViewOrderCost != "Y") return "****";
            return d.income ? (d.income + "元") : '- -';
        }},
        {field: 'deliveryOperator', title: '发运经理', sort: false, minWidth:180, templet: function(d){
            d.deliveryOperator = d.deliveryOperator || "";
            d.deliveryOperatorPhone = d.deliveryOperatorPhone || "";
            return (d.deliveryOperator || d.deliveryOperatorPhone) ? d.deliveryOperator + d.deliveryOperatorPhone : '- -';
        }},
        {field: 'dispatchMode', title: '调度方式', sort: false, minWidth: 145, templet: function(d){
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
          return d.prePayAmount + "元";
        }},
        {field: 'prePayOil', title: '油升数', sort: false,width: 200, hide: false, templet: function (d) {
          return d.prePayOil + "升";
        }},
        {field: 'arrivePayAmount', title: '到付款金额', sort: false,width: 200, hide: false, templet: function (d) {
          return d.arrivePayAmount + "元";
        }},
        {field: 'tailPayAmount', title: '尾款金额', sort: false,width: 200, hide: false, templet: function (d) {
          return d.tailPayAmount + "元";
        }},
    ];
    var showList = [], exportHead = {};
    tableCols.forEach(function (item) {
      showList.push(item.field);
    });
    
  function List(){}
  List.prototype.init = function () {
    var _this = this;
    edipao.request({
      type: 'GET',
      url: '/admin/table/show-field/get',
      data: {
          tableName: tableName
      }
    }).done(function(res) {
      if (res.code == 0) {
          if(res.data){
              showList = [];
              try{
                  showList = JSON.parse(res.data);
              }catch(e){}
              layui.each(tableCols, function(index, item){
                  if(item.field && showList.indexOf(item.field) == -1){
                      item.hide = true;
                  }else{
                      if(item.field&&item.field!==''&&item.field!='right'&&item.field!='left'){
                          exportHead[item.field] = item.title;
                      }
                  }
              })
          }else{
              layui.each(tableCols, function(index, item){
                  if(item.field && showList.indexOf(item.field) != -1){
                      if(item.field&&item.field!==''&&item.field!='right'&&item.field!='left'){
                          exportHead[item.field] = item.title;
                      }
                  }
              })
          }
          _this.renderTable();
          _this.bindTableEvents();
      }
    });
  }
  List.prototype.renderTable =  function(){
    var _this = this;
    mainTable = table.render({
        elem: '#' + tableKey
        , url: layui.edipao.API_HOST+'/admin/order/list'
        , title: '订单列表'
        , method: "get" // 请求方式  默认get
        , page: true //开启分页
        , limit: 10  //每页显示条数
        , limits: [10, 20, 50, 100] //每页显示条数可选择
        , request: {
            pageName: 'pageNo' //页码的参数名称，默认：page
            , limitName: 'pageSize' //每页数据量的参数名，默认：limit
        }
        , where: { loginStaffId: user.staffId }
        , height: 'full'
        , autoSort: true
        , id: tableKey
        , parseData: function (res) {
          if(res.code != 0){
            layer.close(loadLayer);
          }
          res.data = res.data || {};
          orderDTOList = JSON.parse(JSON.stringify(res.data.orderDTOList || []));
          return {
              "code": res.code, //解析接口状态
              "msg": res.message, //解析提示文本
              "count": res.data.totalSize, //解析数据长度
              "data": res.data.orderDTOList || [], //解析数据列表
          }
        }
        , done: function (res) {
            layer.close(loadLayer);
            _this.bindEvents();
            if(!res.data || res.data == null || res.data.length < 1){
                $('.layui-table-header').css('overflow-x','scroll');
            }else{
                $('.layui-table-header').css('overflow','hidden');
            }
            if(reloadOption) {
                mainTable.reload(JSON.parse(JSON.stringify(reloadOption)));
                reloadOption = false;
            }
            tableFilterIns && tableFilterIns.reload();
        },
        text: {none: "暂无数据"}
        , cols: [tableCols]
    });
  }
  List.prototype.bindEvents = function () {
    $(".href_order_no").unbind().on("click", function (e) {
      var orderNo = e.target.dataset.orderno;
      var pid = 200;
      top.xadmin.open('查看订单', '/orderMessage/order-view.html?orderNo=' + orderNo + "&action=view&perssionId=" + pid);
    });
  }
  List.prototype.bindTableEvents = function(){
    var _this = this;
    $(".top_tool_bar").unbind().on("click", function (e) {
      var event = e.target.dataset.event;
      switch(event){
        case "add":
          _this.addOrder();
          break;
        case "reset_search":
          edipao.resetSearch(tableKey, function(){
            location.reload();
          });
          break;
      }
    });
    table.on('checkbox(' + tableKey + ')', function(obj){
      if(obj.data.orderType == 1) return;
      var orderNo = obj.data.orderNo, flag = obj.checked;
      var $tr = obj.tr, $prev = $tr.prev(), $next = $tr.next();
      if($prev.length){
        if($prev.find("td[data-field=orderNo]").data("content") == orderNo){
          if(flag){
            $prev.find('.layui-form-checkbox').addClass('layui-form-checked');
          }else{
            $prev.find('.layui-form-checkbox').removeClass('layui-form-checked');
          }
        }
      }
      if($next.length){
        if($next.find("td[data-field=orderNo]").data("content") == orderNo){
          if(flag){
            $next.find('.layui-form-checkbox').addClass('layui-form-checked');
          }else{
            $next.find('.layui-form-checkbox').removeClass('layui-form-checked');
          }
        }
      }
    });
  }
  List.prototype.addOrder = function () {
    var checkStatus = table.checkStatus(tableKey), orderNoList = [], orderList = [];
    if(!checkStatus.data.length) return layer.msg("请选择订单", {icon: 2});
    checkStatus.data.forEach(function (item) {
      orderNoList.push(item.orderNo);
    });
    orderDTOList.forEach(function (item) {
      if(orderNoList.indexOf(item.orderNo) > -1) orderList.push(item);
    });
    window.parent.postMessage({
      type: "addOrder",
      data: orderList,
    });
  }
  new List().init();
});