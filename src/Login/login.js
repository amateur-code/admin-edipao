$(function  () {
    layui.use(['form','jquery'], function(){
        var form = layui.form,$ = layui.$;
        $.idcode.setCode();
        //自定义验证规则
        form.verify({
            phoneVerify: function(value) {
                if(value!=''){
                    var reg = /^1\d{10}$/;
                    var flag = reg.test(value);
                    if(!flag){
                        return '请输入正确的手机号';
                    }
                }else{
                    return '请输入手机号';
                }
            }
            ,passVerify: function(value) {
                if(value==''){
                    return '请输入密码';
                }
            }
            ,idcodeVerify: function(value) {
                if(value!=''){
                    var IsBy = $.idcode.validateCode();
                    if(!IsBy){
                        return '验证码不正确';
                    }
                }else{
                    return '请输入验证码';
                }
            }
        });
        //监听提交
        form.on('submit(login)', function(data){
            //登陆
            var param = {
                phone:data.field.phone,
                pass:data.field.pass
            }
            $.ajax({
                type: "POST",
                dataType: "JSON",
                url: ipUrl+'/admin/staff/login',
                data: param,
                success: function (data){
                    var code = data.code;
                    if(code=='0'){
                        var staffId = data.data.staffId
                        sessionStorage.setItem("staffId", staffId);
                        location.href='../index.html'
                    }else{
                        layer.msg(data.message, {icon: 5,anim: 6});
                    }
                },
                error: function (data) {

                }
            });
            return false;
        });
    });
})
