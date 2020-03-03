layui.use(['table', 'layer'], function(table, layer) {
    xadmin = layui.xadmin;
    edipao = layui.edipao;
    
    table.render({
        elem: '#staffList',
        url: 'http://www.d.edipao.cn/admin/staff/list',
        request: {
            pageName: 'pageNumber',
            limitName: 'pageSize'
        },
        where: {
            loginStaffId: edipao.getLoginStaffId()
        },
        parseData: function(res) { //res 即为原始返回的数据
            return {
                code: res.code, //解析接口状态
                msg: res.message, //解析提示文本
                count: res.data.totalSize, //解析数据长度
                data: res.data.staffDtoList //解析数据列表
            };
        },
        page: true,
        cols: [
            [ //表头
                { checkbox: true },
                { field: 'name', title: '员工姓名' },
                { field: 'phone', title: '员工手机' },
                { field: 'idCard', title: '身份证号码' },
                { field: 'dept', title: '所属部门' },
                { field: 'cardNo', title: '员工工号' },
                { field: 'positions', title: '员工职位' },
                { field: 'roleNames', title: '拥有权限' },
                { field: 'status', title: '状态' },
                { title: '操作', toolbar: '#rowBtns', width: 350 }
            ]
        ],
        toolbar: '#headerBtns',
        defaultToolbar: []
    });

    table.on('tool(staffList)', function(obj) {
        let data = obj.data
        switch (obj.event) {
            case 'permission':

                break;
            case 'edit':
                xadmin.open('修改员工', './edit.html?id=' + data.staffId, 600, 600)
                break;
            case 'preview':

                break;
            case 'delete':
                layer.confirm('确定删除吗？', {icon: 3, title:'提示'}, function(index){
                  
                  edipao.request({})

                });
                break;
            case 'log':
              
                break;
        };
    });

    table.on('toolbar(staffList)', function(obj) {
        switch (obj.event) {
            case 'add':
                xadmin.open('添加员工', './add.html', 600, 600)
                break;
            case 'export':
                layer.msg('删除');
                break;
            case 'tableSet':
                layer.msg('编辑');
                break;
        };
    });

    table.on('checkbox(staffList)', function(obj) {
        console.log(obj)
    });

})