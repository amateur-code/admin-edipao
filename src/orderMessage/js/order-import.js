layui.use(['form', 'table', 'jquery','layer', 'upload', 'laytpl'], function () {
    var table = layui.table;
    var $ = layui.jquery;
    var form = layui.form;
    var layer = layui.layer;
    var upload = layui.upload;
    var laytpl = layui.laytpl;

  function renderTable(data){
    table.render({
        elem: '#importOrderList'
        , title: '导入结果'
        , method: "get" // 请求方式  默认get
        , height: 'full'
        , autoSort: true
        , id: 'importOrderList'
        , data: data
        , done: function () {//表格渲染完成的回调
        
        },
        text: {
            none: "暂无数据"
        }
        , cols: [[
            {field: 'orderNo', title: '业务单号', sort: false,minWidth:100, templet: function(d){
                return d.orderNo ? d.orderNo : '- -';
            }},
            {field: 'createTime', title: '导入时间', sort: false,width:200,templet:function(d){
              return d.importTime ? d.importTime : '- -';
            }},
            {field: 'staff', title: '操作人', sort: false,width:120,templet:function(d){
                return d.operator ? d.operator : '- -';
            }},
            {field: 'orderStatusDesc', title: '状态', sort: false,width:100, templet:function(d){
                return d.orderStatusDesc ? d.orderStatusDesc : '- -';
            }},
            {field: 'updateTime', title: '更新时间', sort: false,minWidth:300, templet:function(d){
                return d.updateTime ? d.updateTime : '- -';
            }},
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
  $("#download_tpl").attr("href", layui.edipao.API_HOST + "/admin/page/order/download");
  var uploadInst = upload.render({
    elem: '#btn_select_document' //绑定元素
    , url: layui.edipao.API_HOST + '/admin/page/order/fileUpload' //上传接口
    , accept: 'file'
    , field: 'file'
    , data: {
        loginStaffId: layui.edipao.getLoginStaffId()
    }
    , done: function (res) {
        //上传完毕回调
        if (res) {
            if(res.message != "success"){
                layer.msg(res.message, {icon: 2});
                if(res.data && res.data.length){
                    res.data.forEach(function (item, index) {
                        var obj = [];
                        Object.keys(item).forEach(function (item2) {
                            var data = {};
                            data.key = item2;
                            data.value = item[item2];
                            obj.push(data);
                        });
                        res.data[index] = obj;
                    });
                    laytpl($("#import_result").html()).render({list: res.data}, function (html) {
                        layer.open({
                            type: 1,
                            title: "导入结果",
                            area: "600px",
                            content: html,
                            success: function () {  }
                        });
                    });
                }
            }else{
                layer.alert("导入成功");
                if(!res.data.excelImportResultList) res.data.excelImportResultList = [];
                renderTable(res.data.excelImportResultList);
            }
            //展示已知数据
        }
    }
    , error: function () {
        //请求异常回调
    }
});
});