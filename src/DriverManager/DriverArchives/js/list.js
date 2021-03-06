var verifyFilter = false;
// 获取所有司机状态 --同步
var driverStatusData = {};
// 	获取所有司机类型 -- 同步
var driverTypesData = {};
// 押金状态
var depositStatusData = {
    '0':'未支付',
    '1':'已支付'
};
// 预警状态
var warnData = {
    'idLicenceWarn':'身份证',
    'driveLicenceWarn':'驾驶证',
    'qualificationsWarn':'从业资格证',
}
// 预警值
var warnDataVal = {};
// 审核状态
var approvalFlagData={
    '0':'未审核',
    '1':'已审核'
}
var operationData = [
    {key: 1, value: "待审核"},
]
var driveLicenceTypeData = {};
// 获取城市数据
var provinceList = [];
var cityCode = {};
var reloadOption = null;
//config的设置是全局的
layui.config({
    base: '../../lib/'
}).extend({
    excel: 'layui_exts/excel.min',
    tableFilter: 'TableFilter/tableFiltercopy'
}).use(['jquery', 'table','layer','excel','tableFilter','form'], function () {
    var $ = layui.jquery,
        table = layui.table,
        layer = layui.layer,
        excel = layui.excel,
        tableFilter = layui.tableFilter,
        edipao = layui.edipao,
        tableIns,tableFilterIns;
        permissionList = edipao.getMyPermission();
    form = layui.form;

    // 获取所有司机状态
    edipao.request({
        type: 'GET',
        dataType: "JSON",
        async: false,
        url: '/admin/driver/info/driverStatus',
    }).done(res=>{
        if(res.code == 0){
            driverStatusData = res.data;
        }else{
            layer.msg(res.message)
        }
    })
    // 获取所有司机类型
    edipao.request({
        type: 'GET',
        dataType: "JSON",
        async: false,
        url: '/admin/driver/info/driverTypes',
    }).done(res=>{
        if(res.code == 0){
            driverTypesData = res.data;;
        }else{
            layer.msg(res.message)
        }
    })
    // 获取所有驾照类型
    edipao.request({
        type: 'GET',
        dataType: "JSON",
        async: false,
        url: '/admin/driver/info/licenceType',
    }).done(res=>{
        if(res.code == 0){
            driveLicenceTypeData = res.data.sort();
        }else{
            layer.msg(res.message, {icon: 5,anim: 6});
        }
    });
    // 获取预警
    edipao.request({
        type: 'GET',
        url: '/admin/driver/info/warn/get',
    }).done(function(res) {
        if (res.code == 0) {
            var data = JSON.parse(res.data);
            warnDataVal = data;
        } else {
            layer.msg(res.message, {icon: 5,anim: 6});
        }
    })

    var tableKey = 'DriverManager-DriverArchives-list';
    var tableCols = [
        { checkbox: true },
        {
            field: 'name', title: '司机姓名',width: 100,
            templet: function (data) {
                var val = data.name;
                return DataNull(val)
            }
        },
        { field: 'phone', title: '司机手机',width: 120,
            templet: function (data) {
                var val = data.phone;
                return DataNull(val)
            }
        },
        { field: 'idNum', title: '身份证号',width: 160,
            templet: function (data) {
                var val = data.idNum;
                return DataNull(val)
            }
        },
        { field: 'address', title: '当前住址',width: 300,
            templet: function (data) {
                var val = data.address;
                return DataNull(val)
            }
        },
        {
            field: 'driverType', title: '司机类型',width: 100,
            templet: function (data) {
                var val = data.driverType;
                return val || '- -'
            }
        },
        { field: 'driveLicenceType', title: '驾照类型',width: 100,
            templet: function (data) {
                var val = data.driveLicenceType;
                return DataNull(val)
            }
        },
        { field: 'drivingAge', title: '驾龄',width: 100,
            templet: function (data) {
                var val = data.drivingAge;
                return drivingAgeNull(val)
            }
        },
        {
            field: 'wishJourney', title: '意向线路',width: 100,
            templet: function (data) {
                var val = data.wishJourney;
                return wishJourneyNullHtml(val)
            }
        },
        { field: 'oftenJourney', title: '常跑线路',width: 100,
            templet: function (data) {
                var val = data.oftenJourney;
                return oftenJourneyNullHtml(val)
            }
        },
        { field: 'location', title: '位置',width: 100,
            templet: function (data) {
                var val = data.location;
                return DataNull(val);
            }
        },
        { field: 'deposit', title: '押金',width: 100,
            templet: function (data) {
                var val = data.deposit;
               return depositNull(val)
            }
        },
        { field: 'depositStatus', title: '押金状态',width: 100,
            templet: function (data) {
                var val = data.depositStatus;
                if(val == null||val == ''){
                    return '- -'
                }else{
                    if(val=='未支付'||val=='0'){
                        return '<span style="margin-left: 10px;color: #EE5B22;">未支付</span>'
                    }else  if(val=='已支付' || val=='1'){
                        return '<span style="margin-left: 10px;color: #3490E9;">已支付</span>'
                    }
                }
            }
        },
        { field: 'depositTradeNumber', title: '押金付流水',width: 150,
            templet: function (data) {
                var val = data.depositTradeNumber;
               return DataNull(val)
            }
        },
        { field: 'idLicenceValidity', title: '身份证有效期',width: 150,
            templet: function (data) {
                var val = data.idLicenceValidity;
               return DataNull(val)
            }
        },
        { field: 'driveLicenceValidity', title: '驾驶证有效期',width: 150,
            templet: function (data) {
                var val = data.driveLicenceValidity;
               return DataNull(val)
            }
        },
        { field: 'qualificationsValidity', title: '从业资格证有效期',width: 150,
            templet: function (data) {
                var val = data.qualificationsValidity;
               return DataNull(val)
            }
        },
        {
            field: 'licenceWarn', title: '证件预警',width: 160,
            templet: function (data) {
                var licenceWarn = data.licenceWarn;
                if(licenceWarn!=''&&licenceWarn!=null&&licenceWarn!='{}'){
                    var html='';
                    var val = JSON.parse(licenceWarn);
                    for(var i in val){
                        html+='<span style="color: #EE5B22;">'+warnData[i]+(val[i]>0?''+val[i]+'天后到期':'已过期')+'</span>，';
                    }
                    html = html.substring(0,html.length-1);
                    return html;
                }else{
                    return '- -'
                }
            }
        },
        {
            field: 'emergencyPhone', title: '紧急联系人',width: 200,
            templet: function (data) {
                var arr = [];
                if(data.emergencyRelation && data.emergencyRelation != "null") arr.push(data.emergencyRelation);
                if(data.emergencyContact && data.emergencyContact != "null") arr.push(data.emergencyContact);
                if(data.emergencyPhone && data.emergencyPhone != "null") arr.push(data.emergencyPhone);
                if(arr.length > 0){
                    return arr.join("-");
                }else{
                    return "- -";
                }
            }
        },
        { field: 'accountName', title: '银行卡账户', width: 150,
            templet: function (data) {
                var val = data.accountName;
                return DataNull(val)
        }
        },
        { field: 'accountNumber', title: '银行卡账号', width: 180,
            templet: function (data) {
                var val = data.accountNumber;
                return DataNull(val)
            }
        },
        { field: 'accountBank', title: '开户银行', width: 150,
            templet: function (data) {
                var val = data.accountBank;
                return DataNull(val)
            }
        },
        { field: 'accountCity', title: '开户省市', width: 150,
            templet: function (data) {
                var val = data.accountCity;
                return DataNull(val)
            }
        },
        { field: 'accountBankAddress', title: '开户支行', width: 150,
            templet: function (data) {
                var val = data.accountBankAddress;
                return DataNull(val)
            }
        },
        {
            field: 'status', title: '司机状态',width: 100,
            templet: function (data) {
                var val = data.status;
                return  val || '- -'
            }
        },
       /* {
            field: 'approvalFlag', title: '审核状态',
            templet: function (data) {
                var val = data.approvalFlag;
                return approvalFlagData[val] || '- -'
            }
        },*/
        {
            title: '操作',field: "operation", width: 320, fixed: 'right',toolbar: '#rowBtns'
        }
    ];


    var showList = [ "name", "phone","idNum","address","driverType","driveLicenceType", "drivingAge","wishJourney","oftenJourney","location","deposit","depositStatus","idLicenceValidity","driveLicenceValidity","qualificationsValidity","licenceWarn","emergencyPhone","status"];
    var exportHead={};// 导出头部
    edipao.request({
        type: 'GET',
        url: '/admin/table/show-field/get',
        data: {
            tableName: tableKey
        }
    }).done(function(res) {
        if (res.code == 0) {
            if(res.data){
                showList = [];
                try{
                    showList = JSON.parse(res.data);
                }catch(e){}
                layui.each(tableCols, function(index, item){
                    if(item.field == "operation") return;
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
            renderTable();
        }
    })
    var where = {};
    function renderTable(){
        tableIns = table.render({
            elem: '#driverList',
            url: edipao.API_HOST + '/admin/driver/info/list',
            page: true,
            where: {
                loginStaffId: edipao.getLoginStaffId()
            },
            request: {
                pageName: 'pageNumber', //页码的参数名称
                limitName: 'pageSize' //每页数据量的参数名
            },
            parseData: function (res) {
                edipao.codeMiddleware(res);
                var data = [];
                res.data = res.data || {};
                res.data.driverInfoListDtoList = res.data.driverInfoListDtoList || [];
                res.data.driverInfoListDtoList.forEach(function(item) {
                    if(verifyFilter){
                        if(item.approvalDisplay){
                            data.push(item);
                        }
                    }else{
                        data.push(item);
                    }
                });
                if (res.code == 0) {
                    return {
                        "code": res.code,
                        "msg": res.message,
                        "count": res.data.totalSize,
                        "data": data
                    };
                }
            },
            toolbar: '#headerBtns',
            defaultToolbar: [],
            cols: [tableCols],
            done: function (res, curr, count) {
                $(window).unbind("resize");
                resizeTable();
                if(!res.data || res.data== null||res.data.length == 0){
                    $('.layui-table-header').css('overflow-x','scroll')
                }else{
                    $('.layui-table-header').css('overflow','hidden')
                }
                if(reloadOption) {
                    tableIns.reload(JSON.parse(JSON.stringify(reloadOption)));
                    reloadOption = false;
                }
                tableFilterIns&&tableFilterIns.reload() // 搜索
            }
        });

        // 查询
        var driverTypeFilter = [];
        layui.each(driverTypesData,function (index,item) {
            driverTypeFilter.push({
                'key':index,
                'value':item
            })
        });

        var driveLicenceTypeFilter = [];
        layui.each(driveLicenceTypeData,function (index,item) {
            driveLicenceTypeFilter.push({
                'key':item,
                'value':item
            });
        });
        var depositStatusFilter = [];
        layui.each(depositStatusData,function (index,item) {
            depositStatusFilter.push({
                'key':index,
                'value':item
            })
        });
        var driverStatusFilter = [];
        layui.each(driverStatusData,function (index,item) {
            driverStatusFilter.push({
                'key':index,
                'value':item
            })
        });
        var approvalFlagFilter = [];
        layui.each(approvalFlagData,function (index,item) {
            approvalFlagFilter.push({
                'key':index,
                'value':item
            })
        });
        var licenceWarnFilter = [
            {'key': 'idLicenceWarn','value': '身份证预警'},{'key': 'driveLicenceWarn','value': '驾驶证预警'},{'key': 'qualificationsWarn','value': '从业资格证预警'}
        ];
        // 证件预警对应各个证件有效期
        var validityData = {
            'idLicenceWarn':'idLicenceValidity',
            'driveLicenceWarn':'driveLicenceValidity',
            'qualificationsWarn':'qualificationsValidity'
        }
        var filters = [
            { field: 'name', type: 'input' },
            { field: 'phone', type: 'input' },
            { field: 'idNum', type: 'input' },
            { field: 'address', type: 'input' },
            { field: 'driverType', type: 'radio', data: driverTypeFilter },
            { field: 'driveLicenceType', type: 'radio', data: driveLicenceTypeFilter },
            { field: 'drivingAge', type: 'numberslot' },
            { field: 'wishJourney', type: 'city' },
            { field: 'oftenJourney', type: 'city' },
            { field: 'location', type: 'input' },
            { field: 'deposit', type: 'numberslot' },
            { field: 'depositStatus', type: 'radio',data:depositStatusFilter },
            { field: 'depositTradeNumber', type: 'input' },
            { field: 'idLicenceValidity', type: 'timeslot' },
            { field: 'driveLicenceValidity', type: 'timeslot' },
            { field: 'qualificationsValidity', type: 'timeslot' },
            { field: 'licenceWarn', type: 'radio', data:licenceWarnFilter },
            { field: 'emergencyPhone', type: 'contract' },
            { field: 'accountName', type: 'input' },
            { field: 'accountNumber', type: 'input' },
            { field: 'accountBank', type: 'input' },
            { field: 'accountCity', type: 'input' },
            { field: 'accountBankAddress', type: 'input' },
            { field: 'status', type: 'radio',data:driverStatusFilter },
            { field: 'approvalFlag', type: 'radio',data:approvalFlagFilter },
        ]

        tableFilterIns = tableFilter.render({
            'elem' : '#driverList',//table的选择器
            'mode' : 'self',//过滤模式
            'filters' : filters,//过滤项配置
            'done': function(filters, reload){
                filters = $.extend({},filters);
                var index = 0;
                where = {
                    loginStaffId: edipao.getLoginStaffId()
                };
                if(!filters.operation) {
                    verifyFilter = false;
                }else{
                    // verifyFilter = true;
                    // where["pageSize"] = 60;
                }
                delete filters.operation;
                layui.each(filters,function(key, value){
                    if(key=='licenceWarn'){
                        // 证件预警 比如预警是30天, 今天是3月8号, 传值4月8日。
                        where['searchFieldDTOList['+ index +'].fieldName'] = validityData[value];
                        where['searchFieldDTOList['+ index +'].fieldMaxValue'] = getDay(warnDataVal[value]);
                    }else if(key=='idLicenceValidity'||key=='driveLicenceValidity'||key=='qualificationsValidity'){
                        where['searchFieldDTOList['+ index +'].fieldName'] = key;
                        value = value.split(" 至 ");
                        where['searchFieldDTOList['+ index +'].fieldMinValue'] = value[0];
                        where['searchFieldDTOList['+ index +'].fieldMaxValue'] = value[1];
                    }else if(key=='wishJourney'||key=='oftenJourney'){
                        // 意向线路、常跑线路
                        where['searchFieldDTOList['+ index +'].fieldName'] = key;
                        var startCode = '';
                        if(value[key+'Start-city']=='全部'){
                            startCode = cityCode[value[key+'Start-province']];
                        }else{
                            startCode = cityCode[value[key+'Start-city']];
                        };

                        var endCode = '';
                        if(value[key+'End-city']=='全部'){
                            endCode = cityCode[value[key+'End-province']];
                        }else{
                            endCode = cityCode[value[key+'End-city']];
                        };
                        var fieldValue = {};
                        if(value[key+'Start-province']!=""&&value[key+'Start-province']!="请选择省份"){
                            fieldValue.start = {
                                "code": startCode,
                                "province": value[key+'Start-province'],
                                "city": value[key+'Start-city']
                            }
                        }
                        if(value[key+'End-province']!=""&&value[key+'End-province']!="请选择省份"){
                            fieldValue.end = {
                                "code": endCode,
                                "province": value[key+'End-province'],
                                "city": value[key+'End-city']
                            }
                        }
                        where['searchFieldDTOList['+ index +'].fieldValue'] = JSON.stringify(fieldValue);
                    }else if(key == "emergencyPhone"){
                        if(value[0]){
                            where["searchFieldDTOList[" + index + "].fieldName"] = "emergencyContact";
                            where["searchFieldDTOList[" + index + "].fieldValue"] = value[0];
                        }
                        if(value[0] && value[1]) index++;
                        if(value[1]){
                            where["searchFieldDTOList[" + index + "].fieldName"] = "emergencyPhone";
                            where["searchFieldDTOList[" + index + "].fieldValue"] = value[1];
                        }
                    }else if(key == 'drivingAge'||key == 'deposit'){
                        // 驾龄、押金
                        where['searchFieldDTOList['+ index +'].fieldName'] = key;
                        where['searchFieldDTOList['+ index +'].fieldMinValue'] = value[0];
                        where['searchFieldDTOList['+ index +'].fieldMaxValue'] = value[1];
                    }else{
                        where['searchFieldDTOList['+ index +'].fieldName'] = key;
                        where['searchFieldDTOList['+ index +'].fieldValue'] = value;
                    }
                    index++;
                })
                if(reload){
                    reloadOption = { where: where, page: { curr: 1 }};
                }else{
                    tableIns.reload( { where: where, page: { curr: 1 }});
                }
            }
        });
    };
    var resizeTime = null;
    function resizeTable() {
        var w = "90px";
        var backw = "320px";
        var backl = "-1px";
        var l = "-215px";
        var dur = 500;
        $(".opeartion_icon").removeClass("layui-icon-next").addClass("layui-icon-prev");
        if(resizeTime) clearTimeout(resizeTime);
        resizeTime = setTimeout(function () {
            $(".layui-table-main td[data-field=operation]").css("border-color","#ffffff").css("background","#ffffff").find(".layui-table-cell").css("width", w).html("");
            $(".layui-table-box>.layui-table-header th[data-field=operation]").css("border", "none").css("color", "#f2f2f2");
            var $fixed = $(".layui-table-fixed.layui-table-fixed-r");
            $fixed.removeClass("layui-hide").find(".layui-table-body").css("height", "auto");
            $fixed.find(".layui-table-header").css("overflow", "visible")
            $fixed.find(".layui-table-filter").css("left","60px");
            $fixed.find("thead .layui-table-cell").css("position", "relative");
            if(!$fixed.find(".opeartion_icon").length) $fixed.find("thead .layui-table-cell").append("<i class='layui-icon opeartion_icon layui-icon-prev'></i>");
            $fixed.animate({"right": l}, dur, function () {
                $(".opeartion_icon").unbind().on("click", function (e) {
                    var $this = $(this);
                    if($this.hasClass("layui-icon-prev")){
                        $(".layui-table-main td[data-field=operation] .layui-table-cell").css("width", backw);
                        $this.removeClass("layui-icon-prev").addClass("layui-icon-next");
                        $fixed.animate({"right": backl}, dur);
                    }else{
                        $(".layui-table-main td[data-field=operation] .layui-table-cell").css("width", w);
                        $this.removeClass("layui-icon-next").addClass("layui-icon-prev");
                        $fixed.animate({"right": l}, dur);
                    }
                });
            });
        }, dur);
    }

    function DataNull (data) {
        if(data == null||data == ''){
            return '- -'
        }else{
            return  data
        }
    }
    // 意向线路-常跑线路
    function wishJourneyNullHtml(val){
        if(val!=null&&val!=''&&val!='null'){
            var newVal = JSON.parse(val);
            if(newVal){
                var len = newVal.length
                if(len>0){
                var html='<a lay-event="wishJourneyList" class="layui-table-link" style="text-decoration:underline; cursor: pointer;width: 100%;display: block">'+len+'</a>'
                 return html;
                }else{
                    return '- -';
                }
            }else{
                return '- -';
            }
        }else{
            return '- -';
        }
    }
    function oftenJourneyNullHtml(val){
        if(val!=null&&val!=''&&val!='null'){
            var newVal = JSON.parse(val);
            if(newVal){
                var len = newVal.length
                if(len>0){
                    var html='<a lay-event="oftenJourneyList" class="layui-table-link" style="text-decoration:underline; cursor: pointer;width: 100%;display: block">'+len+'</a>'
                    return html;
                }else{
                    return '- -';
                }
            }else{
                return '- -';
            }
        }else{
            return '- -';
        }
    }
    function wishJourneyNull(val){
        if(val!=null&&val!=''&&val!='null'){
            var newVal = JSON.parse(val);
            if(newVal){
                return newVal.length || '- -'
            }else{
                return '- -'
            }
        }else{
            return '- -'
        }
    }
    // 证件预警
    function licenceWarnNull(val){
        if(val!=''&&val!=null&&val!='{}'){
            var data='';
            var newVal = JSON.parse(val);
            for(var i in newVal){
                data += warnData[i]+(newVal[i]>0?" "+newVal[i]+"天后到期":"已过期")+"，"
            }
            data = data.substring(0, data.length - 1);
            return data;
        }else{
            return  '- -';
        }
    }
    // 驾龄
    function drivingAgeNull(val){
        if(val!=''&&val!=null){
            return val+'年';
        }else{
            return '- -';
        }
    }
    // 押金
    function depositNull(val){
        if(val != null||val != ''){
            return  val + '元';
        }else{
            return '- -';
        }
    }
    table.on('tool(driverList)', handleEvent);
    table.on('toolbar(driverList)', handleEvent);
    table.on('checkbox(driverList)', handleEvent);
    function handleEvent (obj) {
        var data = obj.data;
        obj.event == 'add' && permissionList.indexOf('新增') == -1 && (obj.event = 'reject');
        obj.event == 'warn' && permissionList.indexOf('预警设置') == -1 && (obj.event = 'reject');
        obj.event == 'edit' && permissionList.indexOf('修改') == -1 && (obj.event = 'reject');
        obj.event == 'del' && permissionList.indexOf('删除') == -1 && (obj.event = 'reject');
        obj.event == 'export' && permissionList.indexOf('导出') == -1 && (obj.event = 'reject');


        switch (obj.event) {
            case 'reject':
                layer.alert('你没有访问权限', {icon: 2});
                break;
            case 'add':
                xadmin.open('新增司机', './add.html');
                break;
            case 'warn':
                xadmin.open('预警设置', './warn.html', 345,370);
                break;
            case 'export':
                exportExcel();
                break;
            case 'exportRecruit':
                exportRecruit();
                break;
            case 'tableSet':
                xadmin.open('表格设置', './table-set.html', 600, 600);
                break;
            case 'edit':
                xadmin.open('修改司机', './edit.html?id=' + data.id)
                break;
            case 'audit':
                xadmin.open('审核司机', './audit.html?id=' + data.id)
                break;
            case 'info':
                xadmin.open('查看司机', './info.html?id=' + data.id)
                break;
            case 'wishJourneyList':
                xadmin.open('查看线路', './wishJourney-list.html?id=' + data.id+'&type=wishJourney')
                break;
            case 'oftenJourneyList':
                xadmin.open('查看线路', './wishJourney-list.html?id=' + data.id+'&type=oftenJourney')
                break;
            case 'del':
                layer.confirm('确定删除吗？', { icon: 3, title: '提示' }, function(index) {
                    edipao.request({
                        url: '/admin/driver/info/del',
                        type: 'GET',
                        dataType: "JSON",
                        data: {
                            driverId:data.id
                        }
                    }).then(function(res){
                        if(res.code == 0){
                            layer.msg('删除成功')
                            location.reload();
                        }else{
                            layer.msg(res.message)
                        }
                    })
                });
                break;
            case 'log':
                xadmin.open('操作日志', '../../OperateLog/log.html?id=' + data.id + '&type=3');
                break;
            case "reset_search":
                edipao.resetSearch("driverList", function(){
                    location.reload();
                });
                break;
            case "exportLog":
                xadmin.open('导出日志', '../../OperateLog/log.html?type=3&action=exportLog');
                break;
        };

    }
    function exportRecruit () {
        var exportData = [];
        exportData.push({
            name: "司机姓名",
            phone: "联系电话",
            driverLicenceType: "驾照类型",
            createTime: "填报时间"
        });
        edipao.request({
            url: "/admin/driver/info/recruit/exportList",
            method: "GET",
        }).done(function (res) {
            if(res.code == 0){
                res.data = res.data || [];
                res.data.forEach(function (item) {
                    var itemData = {};
                    for (var key in item) {
                        switch(key){
                            case "name":
                            case "phone":
                            case "driverLicenceType":
                                itemData[key] = item[key] || "- -";
                                break;
                            case "createTime":
                                itemData[key] = format(item[key]);
                                break;
                            default:
                                //do nothing
                        }
                    }
                    exportData.push(itemData);
                });
                excel.exportExcel({
                    sheet1: exportData
                }, '司机招募信息.xlsx', 'xlsx');
            }
        });
        function format(value) {
            value = value + "";
            if(!value) return "- -";
            var year = value.slice(0,4);
            var month = value.slice(4,6);
            var day = value.slice(6, 8);
            var h = value.slice(8, 10);
            var m = value.slice(10, 12);
            var s = value.slice(12, 14);
            return year + "-" + month + "-" + day + " " + h + ":" + m + ":" + s;
        }
    }
    // 导出
    function exportExcel() {
        var checkStatus = table.checkStatus('driverList');
        if(checkStatus.data.length > 0){
            exportXlsx(checkStatus.data);
            return;
        }
        var param = where;
        param['pageNumber']= 1;
        param['pageSize'] =10000;
        edipao.request({
            type: 'GET',
            url: '/admin/driver/info/list',
            data: param
        }).done(function(res) {
            if (res.code == 0) {
                if(res.data){
                    res.data = res.data || {};
                    res.data.driverInfoListDtoList = res.data.driverInfoListDtoList || [];
                    var data = res.data.driverInfoListDtoList;
                    exportXlsx(data)
                }
            }
        })
    }
    function exportXlsx (data) {
        var exportData = [];
        // 添加头部
        exportData.push(exportHead);
        // 过滤处理数据
        layui.each(data, function(k, v){
            var exportObj={};
            layui.each(v,function (index,item) {
                if(index && showList.indexOf(index) != -1){
                    switch(index) {
                        case 'drivingAge':
                            // 驾龄-处理数据
                            exportObj[index] = drivingAgeNull(item)
                            break;
                        case 'wishJourney':
                            // 意向线路-处理数据
                            exportObj[index] = wishJourneyNull(item)
                            break;
                        case 'oftenJourney':
                            // 常跑线路-处理数据
                            exportObj[index] = wishJourneyNull(item)
                            break;
                        case 'deposit':
                            // 押金-处理数据
                            exportObj[index] = depositNull(item)
                            break;
                        case 'licenceWarn':
                            // 证件预警-处理数据
                            exportObj[index] = licenceWarnNull(item)
                            break;
                        case 'approvalFlag':
                            // 审核状态-处理数据
                            exportObj[index] = approvalFlagData[item]
                            break;
                        case "emergencyPhone":
                            var arr = [];
                            if(v.emergencyRelation && v.emergencyRelation != "null") arr.push(v.emergencyRelation);
                            if(v.emergencyContact && v.emergencyContact != "null") arr.push(v.emergencyContact);
                            if(v.emergencyPhone && v.emergencyPhone != "null") arr.push(v.emergencyPhone);
                            if(arr.length > 0){
                                exportObj[index] = arr.join("-");
                            }else{
                                exportObj[index] = "- -";
                            }
                            break;
                        default:
                            exportObj[index] = DataNull(item);
                    }
                }
            })
            exportData.push(exportObj)
        })
        // 导出
        excel.exportExcel({
            sheet1: exportData
        }, '司机档案.xlsx', 'xlsx');
        exportLog();
    }
    // 导出日志
    function exportLog(){
        var params = {
            operationModule: 3,
            operationRemark: "导出司机档案"
        }
        edipao.exportLog(params);
    }

    // 获取今天之后几天的日期
    function getDay (val) {
        var today = new Date();
        var targetday_milliseconds=today.getTime() + 1000*60*60*24*val;
        today.setTime(targetday_milliseconds);
        var tYear = today.getFullYear();
        var tMonth = today.getMonth();
        var tDate = today.getDate();
        tMonth = doHandleMonth(tMonth + 1);
        tDate = doHandleMonth(tDate);
        return tYear+"-"+tMonth+"-"+tDate;
    }
    function doHandleMonth(month){
        var m = month;
        if(month.toString().length == 1){
            m = "0" + month;
        }
        return m;
    }

    // 自定义验证规则
    form.verify({
        provinceVerify: function(value, elem) {
            var end;
            var $form = $(elem.form);
            if(elem.name.indexOf("Start") > -1){
                end = $form.find("select[name=" + elem.name.replace("Start", "End") + "]").val();
            }else{
                end = $form.find("select[name=" + elem.name.replace("End", "Start") + "]").val();
            }
            if((value==''||value=='请选择省份')&&(end==''||end=='请选择省份')){
                return '请选择省份';
            }
        },
        cityVerify: function(value, elem) {
            var end;
            var $form = $(elem.form);
            if(elem.name.indexOf("Start") > -1){
                end = $form.find("select[name=" + elem.name.replace("Start", "End") + "]").val();
            }else{
                end = $form.find("select[name=" + elem.name.replace("End", "Start") + "]").val();
            }
            if((value==''||value=='请选择省份')&&(end==''||end=='请选择省份')){
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
            cityCode[v.name] = v.code;
            layui.each(level2,function (m,n) {
                if(v.name==n.province){
                    val[k]['cityList'].push({
                        name: n.city,
                        code:n.code,
                        areaList:[]
                    });
                    cityCode[n.city] = n.code;
                }
            })
        });
        return val;
    }
});
