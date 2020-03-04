layui.use(['jquery', 'table','layer'], function () {
    var $ = layui.jquery,
        table = layui.table,
        edipao = layui.edipao;
    var params = edipao.urlGet();
    var logList = table.render({
        elem: '#logList',
        url: edipao.API_HOST + '/admin/log/list',
        page: true,
        where: {
            loginStaffId: edipao.getLoginStaffId(),
            dataPk:params.id,
            operationModule:'3'
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
        cols: [[
            {
                field: 'operationTime', title: '操作时间',
                templet: function (data) {
                    var val = data.operationTime;
                    return DataNull(val)
                }
            },
            { field: 'operationStaffName', title: '操作人',
                templet: function (data) {
                    var val = data.operationStaffName;
                    return DataNull(val)
                }
            },
            { field: 'operationType', title: '操作类型',
                templet: function (data) {
                    var val = data.operationType;
                    return DataNull(val)
                }
            },
            { field: 'modifyBeforeJson', title: '操作前数据',
                templet: function (data) {
                    var val = data.modifyBeforeJson;
                    return DataNull(val)
                }
            },
            {
                field: 'modifyAfterJson', title: '操作后数据',
                templet: function (data) {
                    var val = data.modifyAfterJson;
                    return DataNull(val)
                }
            },
            { field: 'operationRemark', title: '备注',
                templet: function (data) {
                    var val = data.operationRemark;
                    return DataNull(val)
                }
            }
        ]],
        done: function (res, curr, count) {

        }
    });
    function DataNull (data) {
        if(data == null||data == ''){
            return '--'
        }else{
            return  data
        }
    }
});
