layui.use(['form', 'table', 'jquery','layer', 'upload', 'laytpl'], function () {
  var table = layui.table;
  var $ = layui.jquery;
  var form = layui.form;
  var layer = layui.layer;
  var upload = layui.upload;
  var laytpl = layui.laytpl;

  // 批量导入
  table.render({
      elem: '#routeList',
      url: layui.edipao.API_HOST+'/admin/order/list',
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
      id: 'routeList',
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
          {field: 'updateTime', title: '出发地', sort: false,width:200,templet:function(d){
              return '长春市绿园区解放路10000号（一汽仓库'
          }},
          {field: 'updateTime', title: '目的地', sort: false,minWwidth:200, templet:function(d){
              return '广州是海珠区海珠大道20号（广州一汽4S店）'
          }},
          {field: 'updateTime', title: '适用类型', sort: false,width:80, templet:function(d){
              return '单车单'
          }},
          {field: 'updateTime', title: '上报待审', sort: false,width:80, templet:function(d){
              return '1'
          }},
          {field: 'updateTime', title: '线路规划', sort: false,width:80, templet:function(d){
              return '导航规划'
          }},
          {field: 'updateTime', title: '更新时间', sort: false,width:200, templet:function(d){
              return '2020-02-20 09:00:20'
          }},
          {title: '操作', toolbar: '#edit', align: 'center', fixed: 'right', width: 300}
      ]]
  });

  //监听行工具事件
  table.on('tool(routeList)', function (obj) {
      var data = obj.data; //获得当前行数据
      var layEvent = obj.event; //获得 lay-event 对应的值（也可以是表头的 event 参数对应的值）
      var tr = obj.tr; //获得当前行 tr 的DOM对象
      if (layEvent === 'edit') { //下载
          console.log(0)
      }
  });

});