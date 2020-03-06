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
var driveLicenceTypeData = {};
layui.config({
    base: '../../lib/TableFilter/'
}).use(['jquery', 'table', 'tableFilter','layer'], function () {
    var $ = layui.jquery,
        table = layui.table,
        layer = layui.layer,
        tableFilter = layui.tableFilter,
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

    var driverList = table.render({
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
        cols: [[
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
            { field: 'idNum', title: '司机身份证号',width: 150,
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
                    if(val!=''&&val!=null){
                        return val+'年'
                    }else{
                        return '--'
                    }
                }
            },
            {
                field: 'wishJourney', title: '意向线路',
                templet: function (data) {
                    var val = data.wishJourney;
                    if(val!=null&&val!=''){
                        return JSON.parse(val).length
                    }else{
                        return '--'
                    }
                }
            },
            { field: 'wishJourney1', title: '常跑线路',
                templet: function (data) {
                    var val = data.wishJourney1 || ''
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
                    var val = JSON.parse(data.licenceWarn)
                    if(val!=''&&val!=null){
                        var html='';
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
                    if(val=='0'){
                        return '未审核'
                    }else if(val=='1'){
                        return '已审核'
                    }else{
                        return '--'
                    }
                }
            },
            {
                field: 'approvalDisplay',title: '操作', width: 300,
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
        ]],
        done: function (res, curr, count) {
            console.log("监听where:", this.where);

            // driverListFilterIns.reload() // 搜索
        }
    });
    function DataNull (data) {
        if(data == null||data == ''){
            return '--'
        }else{
            return  data
        }
    }
   /* var driverListFilterIns = tableFilter.render({
        'elem': '#driverList',
        // 'parent' : '#doc-content',
        'mode': 'local',
        'filters': [
            { field: 'name', type: 'input' },
            { field: 'phone', type: 'input' },
            { field: 'idNum', type: 'input' },
            { field: 'drivingAge', type: 'input' },
            {
                field: 'driverType',
                type: 'radio',
                data: [{ "key": "1", "value": "外调" }, { "key": "2", "value": "自营" }, { "key": "3", "value": "合同" }]
            },
            {
                field: 'driveLicenceType',
                type: 'radio',
                data: [{ "key": "1", "value": "A1" }, { "key": "2", "value": "A2" }, {
                    "key": "3",
                    "value": "A3"
                }, { "key": "4", "value": "B1" }, { "key": "5", "value": "B2" }, {
                    "key": "6",
                    "value": "C1"
                }, { "key": "7", "value": "C2" }, { "key": "8", "value": "C3" }]
            },
            { field: 'idLicenceValidity', type: 'date' },
            { field: 'driveLicenceValidity', type: 'input' },
            { field: 'qualificationsValidity', type: 'input' },
            { field: 'status', type: 'input' },
            { field: 'address', type: 'input' },
            { field: 'wishJourney', type: 'input' },
            { field: 'wishJourney1', type: 'input' },
            { field: 'deposit', type: 'input' },
            { field: 'accountBank', type: 'input' },
            { field: 'accountBankAddress', type: 'input' },
            { field: 'accountNumber', type: 'input' },
            { field: 'accountName', type: 'input' }
        ],
        'done': function (filters) {

        }
    })*/


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
                xadmin.open('新增司机', './add.html')
                break;
            case 'warn':
                xadmin.open('预警设置', './warn.html', 345,370)
                break;
            case 'export':
               layer.msg('导出');
                break;
            case 'tableSet':
                layer.msg('设置');
                break;
        };
    });

});
