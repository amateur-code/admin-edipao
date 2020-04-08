layui.use(['table', 'layer','laytpl', 'form'], function(table, layer, laytpl, form) {
  var xadmin = layui.xadmin,
      edipao = layui.edipao,
      tableKey = edipao.urlGet().tableKey;
  var dotTableHeaderList = [
    { field: 'name', title: '网点名称'},
    { field: 'name', title: '所在省市'},
    { field: 'name', title: '详细地址'},
    { field: 'name', title: '地址代码'},
    { field: 'name', title: '联系人'},
    { field: 'name', title: '备注'},
    { field: 'name', title: '发运趟数'},
    { field: 'name', title: '状态'},
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
