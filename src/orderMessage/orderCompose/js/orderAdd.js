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
}).use(['form', 'jquery', 'layer', 'upload', 'table','laytpl', 'tableFilter', 'excel'], function () {
    var tableName = "orderCompose-order-add-list";
    var mainTable,
      table = layui.table,
      $ = layui.jquery,
      excel = layui.excel,
      form = layui.form;
    var layer = layui.layer,edipao = layui.edipao,tableFilter = layui.tableFilter;
    var orderDTOList = [];
    window.form = form;
    var dataPermission = edipao.getDataPermission();
    window.dataPermission = dataPermission;
    var permissionList = edipao.getPermissionIdList();
    window.permissionList = permissionList;
    var loadLayer = layer.load(1);
    var exportHead = {};
    var initWhere = where = {
			loginStaffId: edipao.getLoginStaffId(),
    };
    var filters = [
			{ field: 'orderNo', type: 'input' },
			{ field: 'warehouseNo', type: 'input' },
			{ field: 'vinCode', type: 'input' },
			{ field: 'tempLicense', type: 'input' },
			{ field: 'orderType', type: 'checkbox', data:orderTypeData },
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
			{ field: 'openOperator', type: 'contract' },
			{ field: 'deliveryOperator', type: 'contract' },
			{ field: 'dispatchOperator', type: 'contract' },
			{ field: 'dispatchMode', type: 'checkbox', data: dispatchModeData },
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
    });
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
				if(d.masterFlag != "是") return "";
				return d.transportMode ? d.transportMode : '- -';
			}},
			{field: 'transportAssignTime', title: '运输商指派时间', sort: false,width: 200, templet: function(d){
				if(d.masterFlag != "是") return "";
				return d.transportAssignTime ? d.transportAssignTime : '- -';
			}},
			{field: 'income', title: '收入金额', sort: false,width: 150, templet: function(d){
				if(d.masterFlag != "是") return "";
				if(dataPermission.canViewOrderCost != "Y") return "****";
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
			{field: 'prePayOil', title: '油升数', sort: false,width: 200, hide: false, templet: function (d) {
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
			{field: 'kilometreFee', title: '公里运费', sort: false,width: 200, hide: false, templet: function (d) {
				if(d.masterFlag != "是") return "";
				return d.kilometreFee ? (d.kilometreFee + "元") : "- -";
			}},
    ];
    var showList = [], exportHead = {};
    tableCols.forEach(function (item) {
      showList.push(item.field);
    });
		
  function List(){
    var qs = edipao.urlGet();
    this.action = qs.action || "new";
    this.combinationOrderName = qs.combinationOrderName || "- -";
		this.combinationOrderNo = qs.combinationOrderNo || "";
		this.orderTotal = 0;
  }
  List.prototype.init = function () {
    var _this = this;
    var config = {
			tableKey: {
				new: "orderCompose-add-order-list",
				all: "orderCompose-all-order-list",
				add: "orderCompose-add-order-list",
				remove: "orderCompose-add-order-list",
				noDispatch: "orderCompose-noDispatch-order-list",
			},
			url: {
				noDispatch: "/admin/grab/combination-order/combination-order-no/no-dispatch/order-list",
				remove: "/admin/grab/combination-order/combination-order-no/order-list",
				all: "/admin/grab/combination-order/combination-order-no/order-list",
				add: "/admin/grab/combination-order/no-combination/order-list",
				new: "/admin/grab/combination-order/no-combination/order-list",
			},
			dataKey: {
				new: "orderList",
				remove: "orderList",
				add: "orderList",
				all: "orderList",
				noDispatch: "orderList",
			},
			title: {
				new: "添加订单",
				remove: "减少订单",
				add: "添加订单",
				all: "查看订单",
				noDispatch: "查看订单",
			}
    }
    if(_this.action == "remove"){
      $("#remove_btn").removeClass("hide");
    }
    if(_this.action == "add" || _this.action == "remove" || _this.action == "noDispatch" || _this.action == "all"){
      $("#composeTitle").removeClass("hide").find("#composeName").text(_this.combinationOrderName);
    }
    if(_this.action == "new" || _this.action == "add"){
			$("#add_btn").removeClass("hide");
    }
    if(_this.action == "all" || _this.action == "noDispatch"){
			$("#table_set_btn").removeClass("hide");
			$("#export_data_btn").removeClass("hide");
    }
    if(_this.action == "remove" || _this.action == "all" || _this.action == "noDispatch"){
			initWhere["searchFieldDTOList[0].fieldName"] = "combinationOrderNo";
			initWhere["searchFieldDTOList[0].fieldValue"] = _this.combinationOrderNo;
		}
		_this.logRemark = "导出组合订单";
		_this.logKey = "";
    _this.url = config.url[_this.action];
    _this.dataKey = config.dataKey[_this.action];
		_this.tableKey = config.tableKey[_this.action];
    $("#doc-content").html(`<table id="${_this.tableKey}" lay-filter="${_this.tableKey}"></table>`);
    $("#head_title").text(config.title[_this.action]);
    _this.initTableFilter();
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
  List.prototype.initTableFilter = function () {
    var _this = this;
    tableFilterIns = tableFilter.render({
			'elem' : '#' + _this.tableKey,//table的选择器
			'mode' : 'self',//过滤模式
			'filters' : filters,//过滤项配置
			'done': function(filters, reload){
				filters = $.extend({},filters);
				where = JSON.parse(JSON.stringify(initWhere));
				var index = 0;
				if(_this.action == "remove" || _this.action == "all" || _this.action == "noDispatch") index = 1;
				if(filters.deliveryOperator){
					filters.deliveryOperatorPhone =  filters.deliveryOperator[1];
					filters.deliveryOperator =  filters.deliveryOperator[0];
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
  List.prototype.renderTable =  function(){
		var _this = this;
    mainTable = table.render({
			elem: '#' + _this.tableKey
			, url: layui.edipao.API_HOST + _this.url
			, title: '订单列表'
			, method: "get" // 请求方式  默认get
			, page: true //开启分页
			, limit: 10  //每页显示条数
			, limits: [10, 20, 50, 100] //每页显示条数可选择
			, request: {
				pageName: 'pageNo' //页码的参数名称，默认：page
				, limitName: 'pageSize' //每页数据量的参数名，默认：limit
			}
			, where: where
			, height: 'full'
			, autoSort: true
			, id: _this.tableKey
			, parseData: function (res) {
				if(res.code != 0){
					layer.close(loadLayer);
				}
				res.data = res.data || {};
				orderDTOList = JSON.parse(JSON.stringify(res.data[_this.dataKey] || "[]"));
				_this.orderTotal = res.data.totalSize;
				return {
					"code": res.code, //解析接口状态
					"msg": res.message, //解析提示文本
					"count": res.data.totalSize, //解析数据长度
					"data": res.data[_this.dataKey] || [], //解析数据列表
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
        case "export_data":
					_this.exportData();
					break;
        case "add":
					_this.addOrder();
					break;
        case "remove":
					_this.removeOrder();
					break;
        case "table_set":
					xadmin.open("表格设置", "./table-set.html?tableKey=" + _this.tableKey, 600, 500);
					break;
        case "reset_search":
					edipao.resetSearch(_this.tableKey, function(){
						location.reload();
					});
					break;
      }
    });
    table.on('checkbox(' + _this.tableKey + ')', function(obj){
			if(_this.action == "all" || _this.action == "noDispatch") return;
      if(obj.data.orderType == 1) return;
      var orderNo = obj.data.orderNo, flag = obj.checked;
			var $tr = obj.tr, $prev = $tr.prev(), $next = $tr.next();
			console.log(table)
			if(flag){
				table.cache[_this.tableKey].forEach(function(item){
					if(item.orderNo == orderNo){
						item["LAY_CHECKED"] = true;
					}
				});
			}else{
				table.cache[_this.tableKey].forEach(function(item){
					if(item.orderNo == orderNo){
						delete item["LAY_CHECKED"];
					}
				});
			}
      if($prev.length){
        if($prev.find("td[data-field=orderNo]").data("content") == orderNo){
          if(flag){
            $prev.find('.layui-form-checkbox').addClass('layui-form-checked').prev().attr("checked", "checked");
          }else{
            $prev.find('.layui-form-checkbox').removeClass('layui-form-checked').prev().removeAttr("checked");
          }
        }
      }
      if($next.length){
        if($next.find("td[data-field=orderNo]").data("content") == orderNo){
          if(flag){
            $next.find('.layui-form-checkbox').addClass('layui-form-checked').prev().attr("checked", "checked");
          }else{
            $next.find('.layui-form-checkbox').removeClass('layui-form-checked').prev().removeAttr("checked");
          }
        }
      }
    });
	}
	List.prototype.removeOrder = function () {
		var _this = this;
    var checkStatus = table.checkStatus(_this.tableKey), removeOrderNoList = [];
		if(!checkStatus.data.length) return layer.msg("请选择订单", {icon: 2});
		checkStatus.data.forEach(function (item) {
      if(removeOrderNoList.indexOf(item.orderNo) < 0){
				removeOrderNoList.push(item.orderNo);
			}
		});
		if(removeOrderNoList.length >= _this.orderTotal) return layer.msg("需要至少保留一个订单！", {icon: 2});
		layer.confirm("确认移除这些订单？", {icon: 3}, function (index) {
			edipao.request({
				url: "/admin/grab/combination-order/del-order",
				data: {
					combinationOrderNo: _this.combinationOrderNo,
					orderNoList: removeOrderNoList.join(","),
				}
			}).done(function (res) {
				layer.close(index);
				if(res.code == 0){
					layer.msg("移除成功！", {icon: 1});
					mainTable.reload( { where: where, page: { curr: 1 }});
				}
			});
		});
	}
  List.prototype.addOrder = function () {
		var _this = this;
    var checkStatus = table.checkStatus(_this.tableKey), orderNoList = [], orderList = [], addOrderNoList = [];
    if(!checkStatus.data.length) return layer.msg("请选择订单", {icon: 2});
    checkStatus.data.forEach(function (item) {
      orderNoList.push(item.orderNo);
    });
    orderDTOList.forEach(function (item) {
      if(orderNoList.indexOf(item.orderNo) > -1) orderList.push(item);
		});
		if(_this.action == "add"){
			layer.confirm("确认添加这些订单？", {icon: 3, title:'提示'}, function (index) {
				orderList.forEach(function (item) {
					if(addOrderNoList.indexOf(item.orderNo) < 0){
						addOrderNoList.push(item.orderNo);
					}
				});
				_this.addExist(addOrderNoList, index);
				layer.close(index);
			});
		}else{
			window.parent.postMessage({
				type: "addOrder",
				data: orderList,
			}, "*");
		}
	}
	List.prototype.addExist = function (orderNoList, index) {
		var _this = this;
		edipao.request({
			url: "/admin/grab/combination-order/add-order",
			data: {
				combinationOrderNo: _this.combinationOrderNo,
				orderNoList: orderNoList.join(","),
			}
		}).done(function (res) {
			layer.close(index);
			if(res.code == 0){
				layer.msg("添加成功！", {icon: 1});
				mainTable.reload( { where: where, page: { curr: 1 }});
			}
		});
	}
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
  List.prototype.exportData = function () {
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
						exportObj[index] = _this.getTableColData(index, v);
					}
				});
				exportData.push(exportObj);
			});
			// 导出
			excel.exportExcel(
				{
					sheet1: exportData,
				},
				_this.logRemark + ".xlsx",
				"xlsx"
			);
			//exportLog();
		}
		// 导出日志
		function exportLog() {
			var params = {
				operationModule: _this.logKey,
				dataPk: _this.combinationOrderNo,
				operationRemark: _this.logRemark,
			};
			edipao.exportLog(params);
		}
	}
	List.prototype.getTableColData = function (key, d) {
		var res = "- -";
		if(key == "orderNo"){
			if(d.masterFlag == "否"){
				res = "";
			}else{
				res = d.orderNo;
			}
			return res;
		}
		tableCols.some(function (item) {
			if(item.field == key){
				if(typeof item.templet == "function"){
					res = item.templet(d);
				}
				return true;
			}
		});
		return res;
	}
  new List().init();
});