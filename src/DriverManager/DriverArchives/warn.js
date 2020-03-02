layui.use(['form', 'layer'],
    function() {
        $ = layui.jquery;
        var form = layui.form,
            layer = layui.layer;
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

        //监听提交
        form.on('submit(add)',
            function (data) {
                console.log(data);
                //发异步，把数据提交给php
                layer.alert("增加成功", {
                        icon: 6
                    },
                    function () {
                        //关闭当前frame
                        xadmin.close();

                        // 可以对父窗口进行刷新
                        xadmin.father_reload();
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
