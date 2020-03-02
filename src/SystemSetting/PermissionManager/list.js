layui.use(['table'],function(table) {
    xadmin = layui.xadmin;
    edipao = layui.edipao;


    table.render({
        elem: '#demo'
        ,height: 312
        ,url: '/demo/table/user/' //数据接口
        ,page: true //开启分页
        ,cols: [[ //表头
          {field: 'id', title: 'ID', width:80, sort: true, fixed: 'left'}
          ,{field: 'username', title: '用户名', width:80}
          ,{field: 'sex', title: '性别', width:80, sort: true}
          ,{field: 'city', title: '城市', width:80} 
          ,{field: 'sign', title: '签名', width: 177}
          ,{field: 'experience', title: '积分', width: 80, sort: true}
          ,{field: 'score', title: '评分', width: 80, sort: true}
          ,{field: 'classify', title: '职业', width: 80}
          ,{field: 'wealth', title: '财富', width: 135, sort: true}
        ]]
      });


    edipao.request({
        url: '/admin/permission/role/list',
        page: 1,

    })

})