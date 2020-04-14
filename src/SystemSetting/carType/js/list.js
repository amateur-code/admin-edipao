var verifyFilter = false;

// 是否背车
var orderTypeData={
    '1':'背车',
    '0':'不背车'
}
// 状态
var statusData={
    '1':'有效',
    '2':'失效'
}
// 驾照类型
var driveLicenceTypeData = {};

//config的设置是全局的
layui.config({
    base: '../../lib/'
}).extend({
    excel: 'layui_exts/excel.min',
    tableFilter: 'TableFilter/tableFilter'
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


    var tableKey = 'SystemSetting-carType-list';
    var tableCols = [
        { checkbox: true },
        {
            field: 'modelName', title: '车型名称',width: 100,
            templet: function (data) {
                var val = data.modelName;
                return DataNull(val)
            }
        },
        { field: 'certificateCode', title: '要求驾照',width: 100,
            templet: function (data) {
                var val = data.certificateCode;
                return DataNull(val)
            }
        },
        { field: 'orderType', title: '是否背车',width: 100,
            templet: function (data) {
                var val = data.orderType;
                return orderTypeData[val] || '--'
            }
        },
        {
            field: 'modelCode', title: '车型代码',width: 200,
            templet: function (data) {
                var val = data.modelCode;
                if(val==''){
                    return '--'
                }else{
                    return '<span title="'+val+'">'+val+'</span>'
                }
            }
        },
        { field: 'driveWayCode', title: '驱动形式代码',width: 200,
            templet: function (data) {
                var val = data.driveWayCode;
                if(val==''){
                    return '--'
                }else{
                    return '<span title="'+val+'">'+val+'</span>'
                }
            }
        },
        { field: 'powerCode', title: '功率代码',width: 200,
            templet: function (data) {
                var val = data.powerCode;
                if(val==''){
                    return '--'
                }else{
                    return '<span title="'+val+'">'+val+'</span>'
                }
            }
        },
        {
            field: 'remark', title: '备注',width: 400,
            templet: function (data) {
                var val = data.remark;
                if(val==''){
                    return '--'
                }else{
                    return '<span title="'+val+'">'+val+'</span>'
                }
            }
        },
        { field: 'status', title: '状态',width: 100,
            templet: function (data) {
                var val = data.status;
                return statusData[val] || '--'
            }
        },
        {
            title: '操作',field: "operation", width: 320, fixed: 'right',toolbar: '#rowBtns'
        }
    ];


    var showList = [ "modelName", "certificateCode","orderType","modelCode","driveWayCode", "powerCode","remark","status"];
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
    function renderTable(){
        tableIns = table.render({
            elem: '#carTypeList',
            url: edipao.API_HOST + '/admin/sys/truckModel/list',
            page: true,
            where: {
                loginStaffId: edipao.getLoginStaffId()
            },
            request: {
                pageName: 'pageNo', //页码的参数名称
                limitName: 'pageSize' //每页数据量的参数名
            },
            parseData: function (res) {
                edipao.codeMiddleware(res);
                if (res.code == 0) {
                    return {
                        "code": res.code,
                        "msg": res.message,
                        "count": res.data.totalSize,
                        "data": res.data.truckModelRespList
                    };
                }
            },
            toolbar: '#headerBtns',
            defaultToolbar: [],
            cols: [tableCols],
            done: function (res, curr, count) {
                $(window).unbind("resize");
                resizeTable();
                if(res.data== null){
                    $('.layui-table-header').css('overflow-x','scroll')
                }else{
                    $('.layui-table-header').css('overflow','hidden')
                }
                tableFilterIns&&tableFilterIns.reload() // 搜索
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


    var driveLicenceTypeFilter = [];
    layui.each(driveLicenceTypeData,function (index,item) {
        driveLicenceTypeFilter.push({
            'key':item,
            'value':item
        });
    });
    var orderTypeFilter = [];
    layui.each(orderTypeData,function (index,item) {
        orderTypeFilter.push({
            'key':index,
            'value':item
        });
    });

    var  statusFilter = [];
    layui.each(statusData,function (index,item) {
        statusFilter.push({
            'key':index,
            'value':item
        });
    });
    var filters = [
        { field: 'modelName', type: 'input' },
        { field: 'certificateCode', type: 'checkbox', data: driveLicenceTypeFilter},
        { field: 'orderType',type: 'checkbox', data: orderTypeFilter},
        { field: 'modelCode', type: 'input' },
        { field: 'driveWayCode', type: 'input' },
        { field: 'powerCode', type: 'input' },
        { field: 'remark', type: 'input' },
        { field: 'status',type: 'checkbox', data: statusFilter }
    ]
    var where = {};
    tableFilterIns = tableFilter.render({
        'elem' : '#carTypeList',//table的选择器
        'mode' : 'self',//过滤模式
        'filters' : filters,//过滤项配置
        'done': function(filters){
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
                where['searchFieldDTOList['+ index +'].fieldName'] = key;
                if( key == 'status'||key == 'orderType'||key == 'certificateCode'){
                    where['searchFieldDTOList['+ index +'].fieldListValue'] = value.join(',');
                }else{
                    where['searchFieldDTOList['+ index +'].fieldValue'] = value;
                }
                index++;
            })
            tableIns.reload( { where: where, page: { curr: 1 }});
        }
    });
    function DataNull (data) {
        if(data == null||data == ''){
            return '--'
        }else{
            return  data
        }
    }

    table.on('tool(carTypeList)', handleEvent);
    table.on('toolbar(carTypeList)', handleEvent);
    table.on('checkbox(carTypeList)', handleEvent);
    function handleEvent (obj) {
        var data = obj.data;
        obj.event == 'add' && permissionList.indexOf('新增') == -1 && (obj.event = 'reject');
        obj.event == 'edit' && permissionList.indexOf('修改') == -1 && (obj.event = 'reject');
        obj.event == 'del' && permissionList.indexOf('删除') == -1 && (obj.event = 'reject');
        obj.event == 'export' && permissionList.indexOf('导出') == -1 && (obj.event = 'reject');


        switch (obj.event) {
            case 'reject':
                layer.alert('你没有访问权限', {icon: 2});
                break;
            case 'add':
                xadmin.open('新增车型配置', './add.html');
                break;
            case 'export':
                exportExcel();
                break;
            case 'tableSet':
                xadmin.open('表格设置', './table-set.html', 600, 600);
                break;
            case 'edit':
                xadmin.open('修改车型配置', './edit.html?id=' + data.id)
                break;
            case 'audit':
                xadmin.open('审核车型配置', './audit.html?id=' + data.id)
                break;
            case 'info':
                xadmin.open('查看车型配置', './info.html?id=' + data.id)
                break;
            case 'del':
                layer.confirm('确定删除吗？', { icon: 3, title: '提示' }, function(index) {
                    edipao.request({
                        url: '/admin/sys/truckModel/del',
                        type: 'post',
                        data: {
                            id:data.id
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
                xadmin.open('操作日志', '../../OperateLog/log.html?id=' + data.id + '&type=9');
                break;
        };

    }
    // 导出
    function exportExcel() {
        var checkStatus = table.checkStatus('carTypeList');
        if(checkStatus.data.length > 0){
            exportXlsx(checkStatus.data);
            return;
        }
        var param = where;
        param['pageNo']= 1;
        param['pageSize'] =10000;
        edipao.request({
            type: 'GET',
            url: '/admin/sys/truckModel/list',
            data: param
        }).done(function(res) {
            if (res.code == 0) {
                if(res.data){
                    res.data = res.data || {};
                    res.data.truckModelRespList = res.data.truckModelRespList || [];
                    var data = res.data.truckModelRespList;
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
                        case 'orderType':
                            exportObj[index] = orderTypeData[item]
                            break;
                        case 'status':
                            exportObj[index] = statusData[item]
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
        }, '车型配置.xlsx', 'xlsx');
        var ids = [];
        data.forEach(function(item){ids.push(item.id)});
        exportLog(ids.join(","));
    }
    // 导出日志
    function exportLog(ids){
        var params = {
            operationModule: 9,
            operationRemark: "导出车型配置"
        }
        if(ids) params.dataPkList = ids;
        edipao.exportLog(params);
    }
});
