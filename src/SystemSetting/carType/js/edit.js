layui.use(['jquery', 'form'], function () {
    var $ = layui.jquery,
        edipao = layui.edipao;
    form = layui.form;

    // 获取所有驾照类型
    edipao.request({
        type: 'GET',
        dataType: "JSON",
        url: '/admin/driver/info/licenceType',
    }).done(res => {
        if (res.code == 0) {
            var driveLicenceTypeData = res.data.sort();
            var optionLicence = "<option value=''>请选择</option>";
            for (var i in driveLicenceTypeData) {
                optionLicence += "<option value='" + driveLicenceTypeData[i] + "'>" + driveLicenceTypeData[i] + "</option>";
            }
            $("#certificateCode").html(optionLicence);
            form.render('select');
            getDetail()
        } else {
            layer.msg(res.message, { icon: 5, anim: 6 });
        }
    });
    // 获取详情
    var params = edipao.urlGet();

    function getDetail () {
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
    }

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
