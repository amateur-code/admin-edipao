layui.use(['form', 'table', 'jquery','layer', 'upload', 'laytpl'], function () {
    var table = layui.table;
    var $ = layui.jquery;
    var form = layui.form;
    var layer = layui.layer;
    var upload = layui.upload;
    var laytpl = layui.laytpl;

    // 批量导入
    table.render({
        elem: '#importOrderList',
        url: ipUrl+'admin/order/list',
        title: '订单列表',
        method: "get", // 请求方式  默认get
        page: true, //开启分页
        limit: 20,  //每页显示条数
        limits: [20, 40], //每页显示条数可选择
        request: {
            pageName: 'pageNumber', //页码的参数名称，默认：page
            limitName: 'pageSize' //每页数据量的参数名，默认：limit
        },
        where:{ loginStaffId: 17718571615 },
        height: 'full',
        autoSort: true,
        id: 'importOrderList',
        parseData: function (res) {
            return {
                "code": res.code, //解析接口状态
                "msg": res.message, //解析提示文本
                "count": res.data.totalSize, //解析数据长度
                "data": res.data.orderDTOList //解析数据列表
            }
        },
        done: function () {//表格渲染完成的回调
            
        },
        text: {
            none: "暂无数据"
        },
        cols: [[
            {field: 'updateTime', title: '导入时间', sort: false,width:200,templet:function(d){
                return '2020.01.02 12:24:00'
            }},
            {field: 'updateTime', title: '操作人', sort: false,width:120, templet:function(d){
                return '张三'
            }},
            {field: 'updateTime', title: '状态', sort: false,width:100, templet:function(d){
                return '处理中'
            }},
            {field: 'updateTime', title: '备注', sort: false,minWidth:300, templet:function(d){
                return '第1行，客户名称为空，导入失败；第5行，归属人员为空，导入失败；第129行，车辆vin码为空'
            }},

            {title: '导入文件', toolbar: '#download', align: 'center', fixed: 'right', width: 300}
        ]]
    });

    //监听行工具事件
    table.on('tool(importOrderList)', function (obj) {
        var data = obj.data; //获得当前行数据
        var layEvent = obj.event; //获得 lay-event 对应的值（也可以是表头的 event 参数对应的值）
        var tr = obj.tr; //获得当前行 tr 的DOM对象
        if (layEvent === 'downLoad') { //下载
            console.log(0)
        }
    });

    // 第三方订单
    table.render({
        elem: '#importThirdOrderList',
        url: ipUrl+'admin/order/list',
        title: '订单列表',
        method: "get", // 请求方式  默认get
        page: true, //开启分页
        limit: 20,  //每页显示条数
        limits: [20, 40], //每页显示条数可选择
        request: {
            pageName: 'pageNumber', //页码的参数名称，默认：page
            limitName: 'pageSize' //每页数据量的参数名，默认：limit
        },
        where:{ loginStaffId: 17718571615 },
        height: 'full',
        autoSort: true,
        id: 'importThirdOrderList',
        parseData: function (res) {
            return {
                "code": res.code, //解析接口状态
                "msg": res.message, //解析提示文本
                "count": res.data.totalSize, //解析数据长度
                "data": res.data.orderDTOList //解析数据列表
            }
        },
        done: function () {//表格渲染完成的回调
            
        },
        text: {
            none: "暂无数据"
        },
        cols: [[
            {type: 'checkbox'},
            {field: 'updateTime', title: '接受时间', sort: false,width:200,templet:function(d){
                return '2020.01.02 12:24:00'
            }},
            {field: 'updateTime', title: '来源', sort: false,width:120, templet:function(d){
                return '一汽解放'
            }},
            {field: 'updateTime', title: '仓库单号', sort: false,width:150, templet:function(d){
                return 'CK000000001'
            }},
            {field: 'updateTime', title: '车辆vin码', sort: false,minWidth:200, templet:function(d){
                return 'v00000000001'
            }},
            {title: '操作', toolbar: '#produceOrder', align: 'center', fixed: 'right', width: 200}
        ]]
    });

    //头工具栏事件
    table.on('toolbar(importThirdOrderList)', function (obj) {
        var checkStatus = table.checkStatus(obj.config.id);
        switch (obj.event) {
            case 'getCheckData':
                var data = checkStatus.data;
                layer.alert(JSON.stringify(data));
                break;
            case 'getCheckLength':
                var data = checkStatus.data;
                layer.msg('选中了：' + data.length + ' 个');
                break;
            case 'isAll':
                layer.msg(checkStatus.isAll ? '全选' : '未全选');
                break;
        }
        ;
    });

    //监听行工具事件
    table.on('tool(importThirdOrderList)', function (obj) {
        var data = obj.data; //获得当前行数据
        var layEvent = obj.event; //获得 lay-event 对应的值（也可以是表头的 event 参数对应的值）
        var tr = obj.tr; //获得当前行 tr 的DOM对象
        if (layEvent === 'product') { //下载
            console.log(0)
        }
    });

    // 多选生成订单
    $('.produceOrders').click(function(){
        layer.open({
            type: 1,
            title: '生成订单',
            content: $('#productOrderModal'),
            area: '90%',
            offset: 'auto',
            btn: ['取消', '确认'],
            yes: function(index, layero){
                //按钮【按钮一】的回调
            },
            btn2: function(){

            },
            btnAlign: 'c',

        })
    })
});