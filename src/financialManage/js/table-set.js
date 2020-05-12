layui.use(['table', 'layer','laytpl', 'form'], function(table, layer, laytpl, form) {
  var xadmin = layui.xadmin,
      edipao = layui.edipao,
      tableKey = edipao.urlGet().tableKey;
  var dotTableHeaderList = [
    { field: 'depositTradeNumber', title: '支付流水号' },
    { field: 'orderNo', title: '业务单号' },
    { field: 'warehouseNo', title: '仓库作业单号' },
    { field: 'vinCode', title: '车辆vin码' },
    { field: 'transportAssignTime', title: '运输商指派时间' },
    { field: 'signTime', title: '扫码签收时间' },
    { field: 'returnAuditTime', title: '回单审核时间' },
    { field: 'feeType', title: '费用类型' },
    { field: 'feeName', title: '费用名称' },
    { field: 'feeAmount', title: '金额' },
    { field: 'receiver', title: '业务方' },
    { field: 'receiverIdNum', title: '身份证号码' },
    { field: 'receiverBankName', title: '银行开户行' },
    { field: 'receiverAccountName', title: '银行账户名' },
    { field: 'accountNumber', title: '银行账号' },
    { field: 'payTime', title: '支付完成时间' },
    { field: 'withdrawTime', title: '提现发起时间' },
    { field: 'withdrawStatus', title: '银行支付状态' },
    { field: 'remark', title: '银行备注' },
    { field: 'toAccountTime', title: '提现到账时间' },
    { field: 'thirdFlowNo', title: '银行支付流水号' },
    { field: 'bankReceipt', title: '银行回单' }
  ];
  var tableHeaderList = dotTableHeaderList;
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
