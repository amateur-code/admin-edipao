layui.use(['form', 'layer'],
    function() {
        $ = layui.jquery;
           var layer = layui.layer,
               form = layui.form,
            edipao = layui.edipao;
        //自定义验证规则
        form.verify({
            day: function (value) {
                if (value != '') {
                    var reg = /^[+]{0,1}(\d+)$/;
                    var flag = reg.test(value);
                    if (!flag) {
                        return '请输入正整数';
                    }
                } else {
                    return '请输入身份证预警失效前天数';
                }
            },
            day1: function (value) {
                if (value != '') {
                    var reg = /^[+]{0,1}(\d+)$/;
                    var flag = reg.test(value);
                    if (!flag) {
                        return '请输入正整数';
                    }
                } else {
                    return '请输入驾驶证预警失效前天数';
                }
            },
            day2: function (value) {
                if (value != '') {
                    var reg = /^[+]{0,1}(\d+)$/;
                    var flag = reg.test(value);
                    if (!flag) {
                        return '请输入正整数';
                    }
                } else {
                    return '请输入从业资格证预警失效前天数';
                }
            }
        });
        // 获取预警
        edipao.request({
            type: 'GET',
            url: '/admin/driver/info/warn/get',
        }).done(function(res) {
            if (res.code == 0) {
                var data = JSON.parse(res.data);
                $('#driveLicenceWarn').val(data.driveLicenceWarn);
                $('#idLicenceWarn').val(data.idLicenceWarn);
                $('#qualificationsWarn').val(data.qualificationsWarn);
            } else {
                layer.msg(res.message, {icon: 5,anim: 6});
            }
        })
        //监听提交
        form.on('submit(add)',
            function (data) {
                var param ={
                    'warnJson':JSON.stringify(data.field)
                }
                edipao.request({
                    type: 'POST',
                    url: '/admin/driver/info/warn/set',
                    data:param,
                }).done(res=>{
                    if(res.code == 0){
                        layer.alert("设置成功", {icon: 6},
                            function() {
                                //关闭当前frame
                                xadmin.close();
                                // 可以对父窗口进行刷新
                                xadmin.father_reload();
                            });
                    }else{
                        layer.msg(res.message, {icon: 5,anim: 6});
                    }
                });
                return false;
            });
        //监听取消
        $('#warnCancel').click(function () {
            //关闭当前frame
            xadmin.close();
            return false;
        });
    });
