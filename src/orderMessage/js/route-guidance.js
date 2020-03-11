layui.config({
    base: '../../lib/'
}).extend({
    excel: 'layui_exts/excel',
    tableFilter: 'TableFilter/tableFilter'
}).use(['jquery', 'table','layer','excel','tableFilter','form', 'upload', 'laytpl'], function () {
    var table = layui.table;
    var $ = layui.jquery;
    var form = layui.form;
    var layer = layui.layer;
    var upload = layui.upload;
    var laytpl = layui.laytpl;
    var edipao = layui.edipao;
    var excel = layui.excel;

    function _tableClass(){
        this.user = JSON.parse(sessionStorage.user);
        this.request = { loginStaffId: this.user.staffId };
        this.pageNumber = 1,
        this.pageSize = 20;
        this.exportSize = 100000;
        this.cols = {};
        this.exportHead = [];
        this.showEngList = ['startAddress', 'endAddress','orderType', 'reportToAudit','lineSource', 'updateTime'];
    }

    _tableClass.prototype = {
        // 初始化
        init: function(){
            this.tableColsSetting();
        },
        // 表格设置
        tableColsSetting: function(){
            // 接口
            this.cols = [
                {field: 'startAddress', title: '出发地', sort: false,width:300},
                {field: 'endAddress', title: '目的地', sort: false,minWwidth:200},
                {field: 'orderType', title: '适用类型', sort: false,width:80, templet:function(d){
                    switch(d.orderType){
                        case 1:
                            return '单车单';
                        case 2:
                            return '背车单';
                    }
                }},
                {field: 'reportToAudit', title: '上报待审', sort: false,width:80},
                {field: 'lineSource', title: '线路规划', sort: false,width:80},
                {field: 'updateTime', title: '更新时间', sort: false,width:200},
                {title: '操作', toolbar: '#edit', align: 'center', fixed: 'right', width: 300}
            ]

            var exportHead = {};
            // 设置导出表头
            layui.each(this.cols, function(i, v){
                exportHead[v.field] = v.title;
            })
            this.exportHead = exportHead;
            this.tableRender();
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
                pageName: 'pageNumber', //页码的参数名称，默认：page
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
                done: function () {//表格渲染完成的回调
                    _t.bindEvents();
                },
                text: {
                    none: "暂无数据"
                },
                cols: [this.cols]
            });

            this.bindToolEvent();
        },
        // 导出
        exportData(){
            var _t = this;
            edipao.request({
                type: 'GET',
                url: '/admin/line/list',
                data: $.extend({}, _t.request, {
                    pageNumber: _t.pageNumber,
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
                                if(_t.showEngList.indexOf(i) > -1){
                                    var value = item[i];
                                    switch(i){
                                        case 'orderType':
                                            value = value == 1 ? '单车单' : '背车单';
                                            break
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
            //监听行工具事件
            table.on('tool(routeList)', function (obj) {
                var data = obj.data; //获得当前行数据
                var layEvent = obj.event; //获得 lay-event 对应的值（也可以是表头的 event 参数对应的值）
                if (layEvent === 'edit') { //下载
                    top.xadmin.add_tab('线路规划', 'orderMessage/route-plan.html?guideLineId=' + data.guideLineId);
                }
            });
        },
        // 绑定页面事件
        bindEvents: function(){
            var _t = this;
            $('#exportExcel').off('click').on('click', function(){
                _t.exportData();
            })
        }
     
    }



    var tableObj = new _tableClass();
    tableObj.init();

});