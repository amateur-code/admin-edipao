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
// 审核状态
var approvalFlagData={
    '0':'未审核',
    '1':'已审核'
}
var driveLicenceTypeData = {};
layui.config({
    base: '../../lib/layui_exts/'
}).use(['jquery', 'table','layer','excel'], function () {
    var $ = layui.jquery,
        table = layui.table,
        layer = layui.layer,
        excel = layui.excel,
        edipao = layui.edipao;

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
        url: '/admin/driver/info/licenceType',
    }).done(res=>{
        if(res.code == 0){
            driveLicenceTypeData = res.data;
        }else{
            layer.msg(res.message, {icon: 5,anim: 6});
        }
    });


    var tableKey = 'DriverManager-DriverArchives-list';
    var tableCols = [
        { checkbox: true },
        {
            field: 'name', title: '司机姓名',
            templet: function (data) {
                var val = data.name;
                return DataNull(val)
            }
        },
        { field: 'phone', title: '司机手机',
            templet: function (data) {
                var val = data.phone;
                return DataNull(val)
            }
        },
        { field: 'idNum', title: '司机身份证号',width: 155,
            templet: function (data) {
                var val = data.idNum;
                return DataNull(val)
            }
        },
        {
            field: 'driverType', title: '司机类型',width: 80,
            templet: function (data) {
                var val = data.driverType;
                return val || '--'
            }
        },
        { field: 'driveLicenceType', title: '驾照类型',width: 80,
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
            field: 'wishJourney', title: '意向线路',
            templet: function (data) {
                var val = data.wishJourney;
                return wishJourneyNull(val)
            }
        },
        { field: 'oftenJourney', title: '常跑线路',
            templet: function (data) {
                var val = data.oftenJourney;
                return wishJourneyNull(val)
            }
        },
        { field: 'location', title: '位置',
            templet: function (data) {
                var val = data.location;
                return DataNull(val)
            }
        },
        { field: 'deposit', title: '押金', width: 120,
            templet: function (data) {
                var val = data.deposit;
                if(val == null||val == ''){
                    return '--'
                }else{
                    var depositStatusVal = data.depositStatus;
                    if(depositStatusVal=='未支付'){
                        return val+'元<span style="margin-left: 10px;color: #EE5B22;">未支付</span>'
                    }else  if(depositStatusVal=='已支付'){
                        return val+'元<span style="margin-left: 10px;color: #3490E9;">已支付</span>'
                    }else{
                        return  val
                    }
                }
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
                        html+='<p style="color: #EE5B22;">'+warnData[i]+(val[i]>0?''+val[i]+'天后到期':'已过期')+'</p>';
                    }
                    return html;
                }else{
                    return '--'
                }
            }
        },
        {
            field: 'status', title: '司机状态',
            templet: function (data) {
                var val = data.status;
                return  val || '--'
            }
        },
        {
            field: 'approvalFlag', title: '审核状态',
            templet: function (data) {
                var val = data.approvalFlag;
                return approvalFlagData[val] || '--'
            }
        },
        {
            title: '操作', width: 300, fixed: '',
            templet: function (data) {
                var val = data.approvalDisplay;
                var html = '';
                html += '<a class="layui-btn layui-btn-xs layui-bg-blue" lay-event="edit">修改</a>';
                if (val) {
                    html += '<a class="layui-btn layui-btn-xs layui-bg-orange" lay-event="audit">审核</a>';
                }
                html += '<a class="layui-btn layui-btn-xs layui-bg-blue" lay-event="info">查看</a>';
                html += '<a class="layui-btn layui-btn-danger layui-btn-xs" lay-event="del">删除</a>';
                html += '<a class="layui-btn layui-bg-blue layui-btn-xs" lay-event="log">日志</a>';
                return html
            }
        }
    ];
    var showList = [];
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
                    if(item.field && showList.indexOf(item.field) == -1){
                        item.hide = true;
                    }else{
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
        table.render({
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
                if (res.code == 0) {
                    return {
                        "code": res.code,
                        "msg": res.message,
                        "count": res.data.totalSize,
                        "data": res.data.driverInfoListDtoList
                    };
                }
            },
            toolbar: '#headerBtns',
            defaultToolbar: [],
            cols: [tableCols],
            done: function (res, curr, count) {
                // console.log("监听where:", this.where);

            }
        });
    };

    function DataNull (data) {
        if(data == null||data == ''){
            return '--'
        }else{
            return  data
        }
    }
    // 意向线路-常跑线路
    function wishJourneyNull(val){
        if(val!=null&&val!=''&&val!='null'){
            var newVal = JSON.parse(val);
            if(newVal){
                return newVal.length || '--'
            }else{
                return '--'
            }
        }else{
            return '--'
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
            return  '--';
        }
    }
    // 驾龄
    function drivingAgeNull(val){
        if(val!=''&&val!=null){
            return val+'年'
        }else{
            return '--'
        }
    }
    // 押金
    function depositNull(deposit,depositStatus){
        var val = deposit;
        if(val != null||val != ''){
            var depositStatusVal = depositStatus;
            if(depositStatusVal=='未支付'){
                return val+'元未支付'
            }else  if(depositStatusVal=='已支付'){
                return val+'元已支付'
            }else{
                return  val
            }
        }else{
            return '--'
        }
    }
    table.on('tool(driverList)', function(obj) {
        let data = obj.data
        switch (obj.event) {
            case 'edit':
                xadmin.open('修改司机', './edit.html?id=' + data.id)
                break;
            case 'audit':
                xadmin.open('审核司机', './audit.html?id=' + data.id)
                break;
            case 'info':
                xadmin.open('查看司机', './info.html?id=' + data.id)
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
        };
    });

    table.on('toolbar(driverList)', function(obj) {
        switch (obj.event) {
            case 'add':
                xadmin.open('新增司机', './add.html');
                break;
            case 'warn':
                xadmin.open('预警设置', './warn.html', 345,370);
                break;
            case 'export':
                exportExcel();
                break;
            case 'tableSet':
                xadmin.open('表格设置', './table-set.html', 600, 600);
                break;
        };
    });
    // 导出
    function exportExcel() {
        edipao.request({
            type: 'GET',
            url: '/admin/driver/info/list',
            data: {
                pageNumber: 1,
                pageSize:100000,
            }
        }).done(function(res) {
            if (res.code == 0) {
                if(res.data){
                    var data = res.data.driverInfoListDtoList;
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
                                        exportObj[index] = depositNull(item,v.depositStatus)
                                        break;
                                    case 'licenceWarn':
                                        // 证件预警-处理数据
                                        exportObj[index] = licenceWarnNull(item)
                                        break;
                                    case 'approvalFlag':
                                        // 审核状态-处理数据
                                        exportObj[index] = approvalFlagData[item]
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
                }
            }
        })
    }
});
