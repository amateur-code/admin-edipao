layui.use(['form', 'table', 'jquery','layer', 'upload', 'laytpl'], function () {
    var table = layui.table;
    var $ = layui.jquery;
    var form = layui.form;
    var layer = layui.layer;
    var upload = layui.upload;
    var laytpl = layui.laytpl;

  function renderTable(){
    table.render({
        elem: '#importOrderList'
        , url: ipUrl+'admin/order/list'
        , title: '订单列表'
        , method: "get" // 请求方式  默认get
        , page: true //开启分页
        , limit: 20  //每页显示条数
        , limits: [20, 40] //每页显示条数可选择
        , request: {
            pageName: 'pageNumber' //页码的参数名称，默认：page
            , limitName: 'pageSize' //每页数据量的参数名，默认：limit
        }
        , where:{ loginStaffId: 17718571615 }
        , height: 'full'
        , autoSort: true
        , id: 'importOrderList'
        , parseData: function (res) {
            return {
                "code": res.code, //解析接口状态
                "msg": res.message, //解析提示文本
                "count": res.data.totalSize, //解析数据长度
                "data": res.data.orderDTOList //解析数据列表
            }
        }
        , done: function () {//表格渲染完成的回调
            $(".list_picture").unbind().on("click", function(e){
                var field = e.target.dataset.field;
                var truckId = e.target.dataset.truck;
                $.ajax({
                    url: ipUrl + 'admin/truck/getById',
                    method: "get",
                    data: {truckId: truckId}
                }).done(function(data){
                    var code = data.code;
                    if(code=='0'){
                        layer.open({
                            type: 1, 
                            content: $("#uploadPic").html(), //这里content是一个普通的String,
                            btn: ["取消", "确定"],
                            success: function () {
                                var uploadInst = upload.render({
                                    elem: '#uploadPicBtn' //绑定元素
                                    ,url: '/upload/' //上传接口
                                    ,done: function(res){
                                        //上传完毕回调
                                    }
                                    ,error: function(){
                                        //请求异常回调
                                    }
                                    });
                            }
                        });
                    }else{
                        layer.msg(data.message, {icon: 5,anim: 6});
                    }
                });
            });
        },
        text: {
            none: "暂无数据"
        }
        , cols: [[
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
  
            {title: '导入文件', toolbar: '#barDemo', align: 'center', fixed: 'right', width: 300}
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
  }
  $("#download_tpl").attr("href", ipUrl + "admin/page/order/download");
  var uploadInst = upload.render({
    elem: '#btn_select_document' //绑定元素
    , url: ipUrl + 'admin/page/order/fileUpload' //上传接口
    , accept: 'file'
    , field: 'file'
    , done: function (res) {
        //上传完毕回调
        if (res) {
            //展示已知数据
            renderTable();
        }
    }
    , error: function () {
        //请求异常回调
    }
});
});