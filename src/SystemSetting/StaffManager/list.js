layui.use(['table'],function(table) {
    xadmin = layui.xadmin;
    edipao = layui.edipao;

    table.render({
      elem: '#staffList',
      height: 'full-60',
      width: document.body.clientWidth,
      url: 'http://www.d.edipao.cn/admin/staff/list',
      request:{
        pageName: 'pageNumber',
        limitName: 'pageSize' 
      },
      where: {
        staffId: '17701035267'
      },
      parseData:function(res){ //res 即为原始返回的数据
        return {
          code: res.code, //解析接口状态
          msg: res.message, //解析提示文本
          count: res.data.totalSize, //解析数据长度
          data: res.data.staffDtoList //解析数据列表
        };
      },
      page: true, 
      cols: [[ //表头
        {checkbox: true},
        {field: 'name',  title: '员工姓名'},
        {field: 'phone',  title: '员工手机'},
        {field: 'idCard',  title: '身份证号码'},
        {field: 'dept',  title: '所属部门'},
        {field: 'cardNo',  title: '员工工号'},
        {field: 'positions',  title: '员工职位'},
        {field: 'roleNames',  title: '拥有权限'},
        {field: 'status',  title: '状态'},
        {title:'操作', toolbar: '#rowBtns', width: 350}
      ]],
      toolbar: '#headerBtns'
    });

    table.on('tool(staffList)', function(obj){
      console.log(obj)
    });

    table.on('toolbar(staffList)', function(obj){
      console.log(obj)
    });

    table.on('checkbox(staffList)', function(obj){
      console.log(obj)
    });

})