layui.config({
    base: '../lib/'
}).extend({
    excel: 'layui_exts/excel',
    tableFilter: 'TableFilter/tableFilter'
}).use(['jquery', 'table','layer','excel','tableFilter', 'laytpl'], function () {
    var table = layui.table,
        $ = layui.jquery,
        layer = layui.layer,
        edipao = layui.edipao,
        excel = layui.excel,
        laytpl = layui.laytpl;
        tableFilter = layui.tableFilter,
        permissionList = edipao.getMyPermission();

    function _tableClass(){
        this.user = JSON.parse(sessionStorage.user);
        this.request = { loginStaffId: this.user.staffId };
        this.pageNumber = 1,
        this.pageSize = 10;
        this.exportSize = 100000;
        this.exportHead = [];
        this.showList = ['startAddress', 'endAddress','orderType', 'reportToAudit','lineSource', 'updateTime'];
        // 接口
        this.cols = [
            {field: 'startAddress', title: '出发地', sort: false, hide: false, minWidth:200},
            {field: 'endAddress', title: '目的地', sort: false, hide: false, minWidth:200},
            {field: 'orderType', title: '适用类型', sort: false, hide: false, width:120, templet:function(d){
                switch(d.orderType){
                    case 1:
                        return '单车单';
                    case 2:
                        return '背车单';
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
                }
            }},
            {field: 'updateTime', title: '更新时间', sort: false, hide: false,width:200}
        ];
        this.toolField = {field: 'operation', title: '操作', toolbar: '#edit', align: 'center', fixed: 'right', width: 200}
    }

    

    _tableClass.prototype = {
        // 初始化
        init: function(){
            // var _t = this;
            // laytpl(exportBtn.innerHTML).render({
            //     permissionList: _t.permissionList
            // }, function(html){
            //     document.getElementById('headerBtns').innerHTML = html;
            // });
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
            });
            
            
        },
        // 渲染数据
        tableRender: function(){
            var _t = this;
            // 批量导入
            table.render({
                elem: '#routeList',
                url: layui.edipao.API_HOST+'/admin/line/list',
                title: '订单列表',
                method: "get", // 请求方式  默认get
                page: true, //开启分页
                limit: this.pageSize,  //每页显示条数
                limits: [20, 40], //每页显示条数可选择
                request: {
                    pageName: 'pageNo', //页码的参数名称，默认：page
                    limitName: 'pageSize' //每页数据量的参数名，默认：limit
                },
                where: this.request,
                height: 'full',
                autoSort: true,
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
                done: function () {//表格渲染完成的回调
                    _t.bindToolEvent();
                    _t.filterData();
                },
                text: {
                    none: "暂无数据"
                },
                toolbar: '#exportBtn',
                defaultToolbar: [],
                cols: [_t.cols]
            });
            
        },
        // 过滤
        filterData: function(){
            var tableFilterIns = tableFilter.render({
                'elem' : '#routeList',//table的选择器
                'mode' : 'api',//过滤模式
                'filters' : [
                    {
                        field: 'startAddress',
                        name: 'startAddress',
                        type: 'input'
                    },
                    {
                        field: 'endAddress',
                        name: 'endAddress',
                        type: 'input'
                    },
                    {
                        field: 'orderType',
                        name: 'orderType',
                        type: 'checkbox',
                        data: [
                            { "key":"0", "value":"全部"},
                            { "key":"1", "value":"单车单"},
                            { "key":"2", "value":"背车单"}
                        ]
                    },
                    {
                        field: 'reportToAudit',
                        name: 'reportToAudit',
                        type: 'numberslot'
                    },
                    {
                        field: 'lineSource',
                        name: 'lineSource',
                        type: 'checkbox',
                        data: [
                            { "key":"0", "value":"全部"},
                            { "key":"1", "value":"订单轨迹"},
                            { "key":"2", "value":"导入轨迹"},
                            { "key":"3", "value":"地图规划"}
                        ]
                    }

                ],//过滤项配置
                'done': function(filters){
                    //结果回调
                }
            })


        },
        // 导出
        exportData(){
            var _t = this;
            edipao.request({
                type: 'GET',
                url: '/admin/line/list',
                data: $.extend({}, _t.request, {
                    pageNo: _t.pageNumber,
                    pageSize: _t.exportSize
                })
            }).done(function(res) {
                if (res.code == 0) {
                    if(res.data){
                        var data = res.data.dataList;
                        var exportData = [];
                        // 添加头部
                        exportData.push(_t.exportHead);
                        layui.each(data, function(index, item){
                            let newObj = {};
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

                        // 导出
                        excel.exportExcel({
                            sheet1: exportData
                        }, '线路指引.xlsx', 'xlsx');
                    }
                }
            })
        },
        // 绑定工具栏事件
        bindToolEvent: function(){
            var _t = this;
            //监听行工具事件
            table.on('tool(routeList)', function (obj) {
                var data = obj.data;
                var layEvent = obj.event; 
                if (layEvent === 'edit') { 
                    xadmin.open('线路规划', './route-plan.html?guideLineId=' + data.guideLineId, 1400, 700)
                }
            });
            table.on('toolbar(routeList)', function (obj) {
                var data = obj.data;
                var layEvent = obj.event; 
                console.log(111)
                if (layEvent === 'export') { 
                    _t.exportData();
                }
            });
        }
     
    }



    var tableObj = new _tableClass();
    tableObj.init();

});