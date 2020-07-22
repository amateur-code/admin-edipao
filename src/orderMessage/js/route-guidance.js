layui.config({
    base: '../lib/'
}).extend({
    excel: 'layui_exts/excel.min',
    tableFilter: 'TableFilter/tableFiltercopy'
}).use(['jquery', 'table','layer','excel', 'tableFilter', 'laytpl', 'laypage'], function () {
    var table = layui.table,
        $ = layui.jquery,
        layer = layui.layer,
        edipao = layui.edipao,
        excel = layui.excel,
        laytpl = layui.laytpl;
        laypage = layui.laypage;
        tableFilter = layui.tableFilter,
        permissionList = edipao.getMyPermission(),
        reloadOption = null;

    function _tableClass(){
        this.user = JSON.parse(sessionStorage.user);
        this.request = { loginStaffId: this.user.staffId };
        this.pageNo = 1;
        this.pageSize = 10;
        this.exportSize = 100000;
        this.exportHead = [];
        this.showList = ['startWarehouse', 'startAddress', 'endPark', 'endAddress','orderType', 'reportToAudit','lineSource', 'updateTime'];
        // 接口
        this.cols = [
            {field: 'startWarehouse', title: '出发仓库/网点名称', sort: false, hide: false, width:300, templet: function (d) {
                return d.startWarehouse || "- -";
            }},
            {field: 'startAddress', title: '出发地', sort: false, hide: false, width:300, templet: function (d) {
                return d.startAddress || "- -";
            }},
            {field: 'endPark', title: '目的仓库/网点名称', sort: false, hide: false, width:300, templet: function (d) {
                return d.endPark || "- -";
            }},
            {field: 'endAddress', title: '目的地', sort: false, hide: false, width:300, templet: function (d) {
                return d.endAddress || "- -";
            }},
            {field: 'transportOrderNum', title: '发运趟数', sort: false, hide: false, width:100},
            {field: 'orderType', title: '适用类型', sort: false, hide: false, width:120, templet:function(d){
                switch(d.orderType){
                    case 1:
                        return '单车单';
                    case 2:
                        return '背车单';
                    default:
                        return "- -";
                }
            }},
            {field: 'reportToAudit', title: '上报待审', sort: false, hide: false, width:120},
            {field: 'lineSource', title: '线路规划', sort: false ,hide: false, width:120, templet:function(d){
                switch(d.lineSource){
                    case 1:
                        return '订单轨迹';
                    case 2:
                        return '导入轨迹';
                    case 3:
                        return '地图规划';
                    default:
                        return "- -";
                }
            }},
            {field: 'updateTime', title: '更新时间', sort: false, hide: false,width:200}
        ];
        this.toolField = {field: 'operation', title: '操作', toolbar: '#edit', align: 'center', fixed: 'right', width: 100};
        this.tableFilterIns = null;
        this.tableIns = null;
        this.where = Object.assign({},this.request);
    }

    

    _tableClass.prototype = {
        // 初始化
        init: function(){
            this.tableColsSetting();
        },
        // 表格设置
        tableColsSetting: function(){
            var _t = this;
            var exportHead={};// 导出头部
            edipao.request({
                type: 'GET',
                url: '/admin/table/show-field/get',
                data: {
                    tableName: 'route-guidance-list'
                }
            }).done(function(res) {
                if (res.code == 0) {
                    if(res.data){
                        _t.showList = [];
                        try{
                            _t.showList = JSON.parse(res.data);
                        }catch(e){}
                        layui.each(_t.cols, function(index, item){
                            if(item.field && _t.showList.indexOf(item.field) < 0){
                                item.hide = true;
                            }else{
                                if(item.field&&item.field!==''&&item.field!='right'&&item.field!='left'){
                                    exportHead[item.field] = item.title;
                                }
                            }
                        })
                    }else{
                        layui.each(_t.cols, function(index, item){
                            if(item.field && _t.showList.indexOf(item.field) != -1){
                                if(item.field&&item.field!==''&&item.field!='right'&&item.field!='left'){
                                    exportHead[item.field] = item.title;
                                }
                            }
                        })
                    }
                    _t.cols.push(_t.toolField);
                }

                _t.exportHead = exportHead;
                _t.tableRender();
                _t.filterData();
                _t.bindToolEvent();
            });
            
            
        },
        // 渲染数据
        tableRender: function(){
            var _t = this;
            // 批量导入
            _t.tableIns = table.render({
                elem: '#routeList',
                url: layui.edipao.API_HOST+'/admin/line/list',
                title: '订单列表',
                method: "get",
                limits: [10, 20, 50, 100],
                page: true,
                request: {
                    pageName: 'pageNo',
                    limitName: 'pageSize'
                },
                where: _t.where,
                height: 'full',
                autoSort: false,
                id: 'routeList',
                parseData: function (res) {
                    return {
                        "code": res.code, //解析接口状态
                        "msg": res.message, //解析提示文本
                        "count": res.data.totalSize, //解析数据长度
                        "data": res.data.dataList //解析数据列表
                    }
                },
                response: {
                    countName: 'count',
                    dataName: 'data'
                },
                done: function (res) {//表格渲染完成的回调
                    if(_t.pageNo == 1){
                    }
                    if(reloadOption) {
                        _t.tableIns.reload(JSON.parse(JSON.stringify(reloadOption)));
                        reloadOption = false;
                    }
                    _t.tableFilterIns && _t.tableFilterIns.reload() // 搜索
                },
                text: {
                    none: "暂无数据"
                },
                toolbar: '#exportBtn',
                defaultToolbar: [],
                cols: [_t.cols]
            });
            
        },
        // 设置分页
        // setLayPage: function(total){
        //     var _t = this;
        //     laypage.render({
        //         elem: 'footer-laypage',
        //         count: total,
        //         layout: ['count', 'prev', 'page', 'next'],
        //         limit: _t.pageSize,
        //         jump: function(obj, first){
        //             _t.pageNo = obj.curr;
        //             _t.where = Object.assign(_t.request, {
        //                 pageNo: obj.curr,
        //                 pageSize: _t.pageSize
        //             });
        //             if(first) return;
        //             _t.tableRender();
        //         }
        //     });
        // },
        // 过滤
        filterData: function(){
            var _t = this;
            _t.tableFilterIns = tableFilter.render({
                'elem' : '#routeList',//table的选择器
                'mode' : 'self',//过滤模式
                'filters' : [
                    {
                        field: 'startWarehouse',
                        type: 'input'
                    },
                    {
                        field: 'startAddress',
                        type: 'input'
                    },
                    {
                        field: 'endPark',
                        type: 'input'
                    },
                    {
                        field: 'endAddress',
                        type: 'input'
                    },
                    {
                        field: 'transportOrderNum',
                        type: 'numberslot'
                    },
                    {
                        field: 'orderType',
                        type: 'checkbox',
                        data: [
                            { "key":"1", "value":"单车单"},
                            { "key":"2", "value":"背车单"}
                        ]
                    },
                    {
                        field: 'reportToAudit',
                        type: 'numberslot'
                    },
                    {
                        field: 'lineSource',
                        type: 'checkbox',
                        data: [
                            { "key":"1", "value":"订单轨迹"},
                            { "key":"2", "value":"导入轨迹"},
                            { "key":"3", "value":"地图规划"}
                        ]
                    }

                ],//过滤项配置
                'done': function(filters, reload){
                    console.log(filters)
                    //结果回调
                    var where = {},
                        index = 0;
                    layui.each(filters, function(key, value){
                        if(key == 'lineSource' || key == "orderType"){
                            where['searchFieldDTOList[' + index + '].fieldName'] = key;
                            where['searchFieldDTOList['+ index +'].fieldListValue'] = value.join(',');
                        } else if(key == "reportToAudit" || key == "transportOrderNum") {
                            where['searchFieldDTOList[' + index + '].fieldName'] = key;
                            where['searchFieldDTOList[' + index + '].fieldMinValue'] = value[0];
                            where['searchFieldDTOList[' + index + '].fieldMaxValue'] = value[1];
                        }else{
                            where['searchFieldDTOList[' + index + '].fieldName'] = key;
                            where['searchFieldDTOList[' + index + '].fieldValue'] = value;
                        }
                        index ++;
                    })

                    _t.where = $.extend({}, _t.request, where)
                    if(reload){
                        reloadOption = { where: _t.where, page: { curr: 1 }};
                    }else{
                        _t.tableIns.reload( { where: _t.where, page: { curr: 1 }});
                    }
                }
            })

        },
        getExportData(cb){
            var _t = this;
            var checkStatus = table.checkStatus("routeList");
            if (checkStatus.data.length > 0) {
                cb(checkStatus.data);
                return;
            }
            edipao.request({
                type: 'GET',
                url: '/admin/line/list',
                data: Object.assign({}, _t.where, {
                    pageNo: 1,
                    pageSize: this.exportSize
                })
            }).done(function(res) {
                if (res.code == 0) {
                    if(res.data){
                        var data = res.data.dataList;
                        cb(data);
                    }
                }
            });
        },
        // 导出
        exportData(){
            var _t = this;
            _t.getExportData(function (data) {
                var exportData = [];
                // 添加头部
                exportData.push(_t.exportHead);
                layui.each(data, function(index, item){
                    var newObj = {};
                    for(var i in item){
                        if(_t.showList.indexOf(i) > -1){
                            var value = item[i];
                            switch(i){
                                case 'orderType':
                                    value = value == 1 ? '单车单' : '背车单';
                                    break
                                case 'lineSource':
                                    switch(item[i]){
                                        case 1:
                                            value = '订单轨迹';
                                            break;
                                        case 2:
                                            value = '导入轨迹';
                                            break;
                                        case 3:
                                            value = '地图规划';
                                            break;
                                    }
                                    break;
                                default:
                                    value = item[i]
                                    break;
                            }
                            newObj[i] = value;
                        }
                    }
                    exportData.push(newObj);
                })
                edipao.exportLog({
                    operationModule: 24,
                    operationRemark: "导出线路指引",
                });
                // 导出
                excel.exportExcel({
                    sheet1: exportData
                }, '线路指引.xlsx', 'xlsx');
            });
        },
        // 绑定工具栏事件
        bindToolEvent: function(){
            var _t = this;
            //监听行工具事件
            table.on('tool(routeList)', function (obj) {
                var data = obj.data;
                obj.event == "edit" && permissionList.indexOf("修改") == -1 && (obj.event = "reject");
                if (obj.event === 'edit') { 
                    xadmin.open('线路规划', './route-plan.html?lineId=' + data.lineId)
                }else if(obj.event === 'reject'){
                    layer.alert("你没有访问权限", { icon: 2 });
                }
            });
            table.on('toolbar(routeList)', function (obj) {
                obj.event == "edit" && permissionList.indexOf("导出") == -1 && (obj.event = "reject");
                switch(obj.event){
                    case "reject":
                        layer.alert("你没有访问权限", { icon: 2 });
                        break;
                    case "export":
                        _t.exportData();
                        break;
                    case "reset_search":
                        edipao.resetSearch("routeList", function(){
                            location.reload();
                        });
                        break;
                    case "exportLog":
                        xadmin.open('导出日志', '../../OperateLog/log.html?type=24&action=exportLog');
                        break;
                }
            });
        }
     
    }



    var tableObj = new _tableClass();
    tableObj.init();

});