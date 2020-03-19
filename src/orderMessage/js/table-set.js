layui.use(['table', 'layer','laytpl', 'form'], function(table, layer, laytpl, form) {
  var xadmin = layui.xadmin,
      edipao = layui.edipao,
      tableKey = edipao.urlGet().tableKey;
  orderTableHeaderList = [
    { field: "orderNo", title: "业务单号" },
    { field: "warehouseNo", title: "仓库单号" },
    { field: "vinCode", title: "VIN码" },
    { field: "tempLicense", title: "临牌号" },
    { field: "orderStatus", title: "状态" },
    { field: "orderType", title: "订单类型" },
    { field: "customerFullName", title: "客户全称" },
    { field: "startWarehouse", title: "发车仓库" },
    { field: "startPark", title: "发车停车场" },
    { field: "startProvince", title: "发车省" },
    { field: "startCity", title: "发车城市" },
    { field: "startAddress", title: "发车地址" },
    { field: "endPark", title: "收车网点" },
    { field: "endProvince", title: "收车省" },
    { field: "endCity", title: "收车城市" },
    { field: "endAddress", title: "收车地址" },
    { field: "transportAssignTime", title: "运输商指派时间" },
    { field: "dispatchTime", title: "调度时间" },
    { field: "openOperator", title: "开单员" },
    { field: "dispatchOperator", title: "调度员" },
    { field: "fetchOperator", title: "提车员" },
    { field: "deliveryOperator", title: "发运员" },
    { field: "driverName", title: "司机姓名" },
    { field: "driverPhone", title: "司机手机" },
    { field: "driverIdCard", title: "司机身份证" },
    { field: "prePayAmount", title: "预付款金额" },
    { field: "arrivePayAmount", title: "到付款金额" },
    { field: "tailPayAmount", title: "尾款金额" },
    { field: "settleWay", title: "结算方式" },
    { field: "fetchStatus", title: "提车照片" },
    { field: "startAuditStatus", title: "发车单审核状态" },
    { field: "returnAuditStatus", title: "交车单审核状态" },
  ];
  routeTableHeaderList = [
    {field: 'startAddress', title: '出发地'},
    {field: 'endAddress', title: '目的地'},
    {field: 'orderType', title: '适用类型'},
    {field: 'reportToAudit', title: '上报待审'},
    {field: 'lineSource', title: '线路规划'},
    {field: 'updateTime', title: '更新时间'}
  ]
  var tableHeaderList = orderTableHeaderList;
  switch(tableKey){
    case 'orderMessage-order-list':
        tableHeaderList = orderTableHeaderList;
        break;
    case 'route-guidance-list':
        tableHeaderList = routeTableHeaderList;
        break;
  }
  laytpl(itemListTpl.innerHTML).render({list:tableHeaderList}, function(html){
      document.getElementById('itemList').innerHTML = html;
      form.render();
  });
  edipao.request({
      type: 'GET',
      url: '/admin/table/show-field/get',
      data: {
          tableName: tableKey
      }
  }).done(function(res) {
      if (res.code == 0) {
          if(!res.data){
              $('#itemList').find('input').prop("checked", true);
          }else{
              var showList = [];
              try{
                  showList = JSON.parse(res.data);
              }catch(e){}
              layui.each(showList, function(index, item){
                  $('input[name='+ item +']').prop("checked", true);
              })
          }
          form.render();
      }
  })

  form.on('checkbox(father)', function(data,e){
      if(data.elem.checked){
          $(data.elem).closest('.layui-form').find('input').prop("checked", true);
          form.render();
      }else{
          $(data.elem).closest('.layui-form').find('input').prop("checked", false);
          form.render();
      }
  });

  form.on('submit(update)', function(data) {
      let list = [];
      $('#itemList').find('input').each(function(index, el) {
          if($(this).prop('checked')) list.push($(this).val())

      });

      edipao.request({
          url: '/admin/table/show-field/save',
          data: {
              tableName: tableKey,
              showFieldJson: JSON.stringify(list)
          }
      }).then(function(res){
          if(res.code == 0){
              layer.alert("修改表格成功", { icon: 6 }, function() {
                  xadmin.close();
                  xadmin.father_reload();
              });
          }
      })
      return false
  });

})
