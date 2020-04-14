layui.use(['jquery', 'form'], function () {
    var $ = layui.jquery,
        edipao = layui.edipao;
    form = layui.form;

    // 获取详情
    var params = edipao.urlGet();
    edipao.request({
        type: 'GET',
        url: '/admin/sys/truckModel/detail',
        data: {
            id: params.id
        }
    }).done(function (res) {
        if (res.code == 0) {
            form.val("carTypeEdit", res.data);
        } else {
            layer.msg(res.message, { icon: 5, anim: 6 });
        }
    })


    // 监听提交
    form.on('submit(add)',
        function (data) {
            data.field.id = params.id;
            edipao.request({
                type: 'POST',
                url: '/admin/sys/truckModel/update',
                data: data.field,
            }).done(res => {
                if (res.code == 0) {
                    layer.alert("修改成功", { icon: 6 },
                        function () {
                            //关闭当前frame
                            xadmin.close();
                            // 可以对父窗口进行刷新
                            xadmin.father_reload();
                        });
                } else {
                    layer.msg(res.message, { icon: 5, anim: 6 });
                }
            });
            return false;
        });
});
