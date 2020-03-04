layui.config({
    base: '../../lib/TableFilter/'
}).use(['jquery', 'table', 'tableFilter','layer'], function () {
    var $ = layui.jquery,
        table = layui.table,
        layer = layui.layer,
        tableFilter = layui.tableFilter,
        edipao = layui.edipao;
    // 获取所有司机状态 --同步
    var driverStatusData = {};

    edipao.request({
        type: 'GET',
        dataType: "JSON",
        async: false,
        url: '/admin/driver/info/driverStatus',
    }).done(res=>{
        if(res.code == 0){
            driverStatusData = res.data;;
        }else{
            layer.msg(res.message)
        }
    })

    // 	获取所有司机类型 -- 同步
    var driverTypesData = {};

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

    var driverList = table.render({
        elem: '#driverList',
        height: 'full-60',
        url: ipUrl + '/admin/driver/info/list',
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
                    var val = data.name
                    return DataNull(val)
                }
            },
            { field: 'phone', title: '司机手机',
                templet: function (data) {
                    var val = data.phone
                    return DataNull(val)
                }
            },
            { field: 'idNum', title: '司机身份证号',
                templet: function (data) {
                    var val = data.idNum
                    return DataNull(val)
                }
            },
            { field: 'drivingAge', title: '驾龄',
                templet: function (data) {
                    var val = data.drivingAge
                    return DataNull(val)
                }
            },
            {
                field: 'driverType', title: '司机类型',
                templet: function (data) {
                    var val = data.driverType
                    return driverTypesData[val] || '--'
                }
            },
            { field: 'driveLicenceType', title: '驾照类型',
                templet: function (data) {
                    var val = data.driveLicenceType
                    return DataNull(val)
                }
            },
            { field: 'idLicenceValidity', title: '身份证有效期',
                templet: function (data) {
                    var val = data.idLicenceValidity
                    return DataNull(val)
                }
            },
            { field: 'driveLicenceValidity', title: '驾照有效期',
                templet: function (data) {
                    var val = data.driveLicenceValidity
                    return DataNull(val)
                }
            },
            { field: 'qualificationsValidity', title: '从业资格证有效期',
                templet: function (data) {
                    var val = data.qualificationsValidity
                    return DataNull(val)
                }
            },
            {
                field: 'status', title: '司机状态',
                templet: function (data) {
                    var val = data.status
                    return  driverStatusData[val] || '--'
                }
            },
            { field: 'address', title: '司机当前住址',
                templet: function (data) {
                    var val = data.address
                    return DataNull(val)
                }
            },
            {
                field: 'wishJourney', title: '意向线路',
                templet: function (data) {
                    var val = JSON.parse(data.wishJourney).length;
                    return val
                }
            },
            { field: 'wishJourney1', title: '常跑线路',
                templet: function (data) {
                    var val = data.wishJourney1 || ''
                    return DataNull(val)
                }
            },
            { field: 'deposit', title: '押金',
                templet: function (data) {
                    var val = data.deposit;
                    if(val == null||val == ''){
                        return '--'
                    }else{
                        var depositStatusVal = data.depositStatus;
                        if(depositStatusVal=='0'){
                            return val+'<span style="margin-left: 10px;color: #EE5B22;">未支付</span>'
                        }else  if(depositStatusVal=='1'){
                            return val+'<span style="margin-left: 10px;color: #3490E9;">已支付</span>'
                        }else{
                            return  val
                        }
                    }
                }
            },
            // { field: 'depositStatus', title: '押金状态',
            //     templet: function (data) {
            //         var val = data.depositStatus
            //         return DataNull(val)
            //     }
            // },
            // {field: 'accountBank', title: '开户行',
            //     templet: function (data) {
            //         var val = data.accountBank
            //         return DataNull(val)
            //     }
            // },
            // {field: 'accountBankAddress', title: '开户行地址',
            //     templet: function (data) {
            //         var val = data.accountBankAddress
            //         return DataNull(val)
            //     }
            // },
            // {field: 'accountNumber', title: '账号号码',
            //     templet: function (data) {
            //         var val = data.accountNumber
            //         return DataNull(val)
            //     }
            // },
            // {field: 'accountName', title: '账号姓名',
            //     templet: function (data) {
            //         var val = data.accountName
            //         return DataNull(val)
            //     }
            // },
            { title: '操作', toolbar: '#barDemo' }
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
            debugger

        }
    })*/
});

/*用户-停用*/
function member_stop (obj, id) {
    layer.confirm('确认要停用吗？', function (index) {

        if ($(obj).attr('title') == '启用') {

            //发异步把用户状态进行更改
            $(obj).attr('title', '停用')
            $(obj).find('i').html('&#xe62f;');

            $(obj).parents("tr").find(".td-status").find('span').addClass('layui-btn-disabled').html('已停用');
            layer.msg('已停用!', { icon: 5, time: 1000 });

        } else {
            $(obj).attr('title', '启用')
            $(obj).find('i').html('&#xe601;');

            $(obj).parents("tr").find(".td-status").find('span').removeClass('layui-btn-disabled').html('已启用');
            layer.msg('已启用!', { icon: 5, time: 1000 });
        }

    });
}

/*用户-删除*/
function member_del (obj, id) {
    layer.confirm('确认要删除吗？', function (index) {
        //发异步删除数据
        $(obj).parents("tr").remove();
        layer.msg('已删除!', { icon: 1, time: 1000 });
    });
}


function delAll (argument) {

    var data = tableCheck.getData();

    layer.confirm('确认要删除吗？' + data, function (index) {
        //捉到所有被选中的，发异步进行删除
        layer.msg('删除成功', { icon: 1 });
        $(".layui-form-checked").not('.header').parents('tr').remove();
    });
}
