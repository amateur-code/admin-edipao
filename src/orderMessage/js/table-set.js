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
      { field: "masterFlag", title: "上下车" },
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
      { field: "deliveryOperator", title: "发运经理" },
      { field: "dispatchOperator", title: "调度员" },
      { field: "dispatchMode", title: "调度方式" },
      { field: "driverName", title: "司机姓名" },
      { field: "driverPhone", title: "司机手机" },
      { field: "driverIdCard", title: "司机身份证" },
      { field: "customerMileage", title: "收入里程" },
      { field: "pricePerMeliage", title: "收入单价" },
      { field: "income", title: "收入金额" },
      { field: "driverMileage", title: "承运里程" },
      { field: "prePayTime", title: "预付款支付时间" },
      { field: "arrivePayTime", title: "到付款支付时间" },
      { field: "tailPayTime", title: "尾款支付时间" },
      { field: "prePayAmount", title: "预付款金额" },
      { field: "arrivePayAmount", title: "到付款金额" },
      { field: "tailPayAmount", title: "尾款金额" },
      { field: "tailPayStatus", title: "尾款状态", },
      { field: "feeName", title: "费用模板", },
      { field: "carModel", title: "费用车型", },
      { field: "fetchTruckTime", title: "提车时间" },
      { field: "startTruckTime", title: "发车时间" },
      { field: "returnAuditStatus", title: "回单审核" },
      { field: "carDamageCount", title: "车损/报备" },
      { field: "dealerSignTime", title: "经销商签收时间" },
      { field: "dealerEval", title: "经销商评价" },
      { field: "certificateSignTime", title: "合格证签收时间" },
      { field: "dealerRemark", title: "经销商备注" },
    ];
    routeTableHeaderList = [
      {field: 'startWarehouse', title: '出发仓库/网点名称'},
      {field: 'startAddress', title: '出发地'},
      {field: 'endPark', title: '目的仓库/网点名称'},
      {field: 'endAddress', title: '目的地'},
      {field: 'transportOrderNum', title: '发运趟数'},
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
                $('#itemList').find('.checkbox_show').prop("checked", true);
                $('#itemList').find('.checkbox_fixed').prop("checked", false);
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
            $(data.elem).closest('.layui-form').find('.checkbox_show').prop("checked", true);
            form.render();
        }else{
            $(data.elem).closest('.layui-form').find('.checkbox_show').prop("checked", false);
            form.render();
        }
    });
    form.on('checkbox(fixed)', function (data) {
        console.log(data)
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
  