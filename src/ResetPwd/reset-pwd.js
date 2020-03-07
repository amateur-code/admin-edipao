layui.config({
    base:'../lib/step/'
}).use([ 'form', 'step','layer'], function () {
    var $ = layui.jquery
        , form = layui.form
        , step = layui.step,
        layer = layui.layer,
       edipao = layui.edipao;
    step.render({
        elem: '#stepForm',
        filter: 'stepForm',
        width: '100%', //设置容器宽度
        stepWidth: '940px',
        height: '500px',
        stepItems: [{
            title: '验证账号'
        }, {
            title: '设置新密码'
        }, {
            title: '完成'
        }]
    });
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
        },
        idcodeVerify: function(value) {
            if(value!=''){

            }else{
                return '请输入验证码';
            }
        },
        passVerify: function(value) {
            if(value!=''){
               /* var reg = /^[0-9a-zA-Z_]{6,18}$/;
                var flag = reg.test(value);
                if(!flag){
                    return '密码不合规，必须由6~18位数字、字母或者数字与字母组合构成';
                }*/
            }else{
                return '请输入新密码';
            }
        },
        repassVerify: function(value) {
            if(value!=''){
                if ($('#L_pass').val() != $('#L_repass').val()) {
                    return '两次输入的密码不一致';
                }
            }else{
                return '请再次输入新密码';
            }
        }
    });

    form.on('submit(formStep)', function (data) {
        checkCode();
        return false;
    });

    form.on('submit(formStep2)', function (data) {
        newPassSet()
        return false;
    });
    function checkCode () {
        var phoneVal = $('#phone').val();
        var verifyCode = $('#verifyCode').val();
        var param = {
            'phone':phoneVal,
            'verifyCode':verifyCode
        }
        edipao.request({
            url: '/forget-pass/verify-code/check',
            data: param,
        }).done(function(res){
            if(res.code == 0){
                step.next('#stepForm');
            }else{
                layer.msg(res.message, {icon: 5,anim: 6});
            }
        })
    }
    function newPassSet() {
        var phoneVal = $('#phone').val();
        var newPassVal = $('#L_pass').val();
        var newPassAgainVal = $('#L_repass').val();
        var param = {
            'phone':phoneVal,
            'newPass':newPassVal,
            'newPassAgain':newPassAgainVal
        }
        //获取验证码
        edipao.request({
            type: "POST",
            url: '/admin/staff/forget-pass/new-pass/set',
            data:param,
        }).done(function(res){
            if(res.code == 0){
                step.next('#stepForm');
            }else{
                layer.msg(res.message, {icon: 5,anim: 6});
            }
        })
    }
    $('.pre').click(function () {
        step.pre('#stepForm');
    });

    $('.next').click(function () {
        step.next('#stepForm');
    });
    // 获取手机验证码
    var InterValObj; //timer变量，控制时间
    var count = 60; //间隔函数，1秒执行
    var curCount;//当前剩余秒数
    var curFlag = true;//禁止触发点击事件
    function sendMessage() {
        curCount = count;
        //设置button效果，开始计时
        curFlag = false;
        $("#btnSendCode").addClass("layui-btn-disabled");
        $("#btnSendCode").val("" + curCount + "秒后重新获取");
        InterValObj = window.setInterval(SetRemainTime, 1000); //启动计时器，1秒执行一次
        var val = $('#phone').val();
        //获取验证码
        edipao.request({
            type: "POST",
            url: '/admin/staff/forget-pass/verify-code/get',
            data:{'phone':val} ,
        }).done(function(res){
            if(res.code == 0){
                layer.msg('发送成功', {icon: 6,anim: 6});
            }else{
                layer.msg(res.message, {icon: 5,anim: 6});
            }
        })
    }

    //timer处理函数
    function SetRemainTime() {
        if (curCount == 0) {
            window.clearInterval(InterValObj);//停止计时器
            $("#btnSendCode").removeClass("layui-btn-disabled");//启用按钮
            $("#btnSendCode").val("重新获取验证码");
            curFlag = true;
        }
        else {
            curCount--;
            $("#btnSendCode").val("" + curCount + "秒后重新获取");
        }
    }
    $('#btnSendCode').click(function () {
        var val = $('#phone').val();
        if(val!=''){
            var reg = /^1\d{10}$/;
            var flag = reg.test(val);
            if(!flag){
                layer.msg('请输入正确的手机号', {icon: 5,anim: 6});
                $('#phone').addClass('layui-form-danger');
                $('#phone').focus();
                return false;
            }
        }else{
            layer.msg('请输入手机号', {icon: 5,anim: 6});
            $('#phone').addClass('layui-form-danger');
            $('#phone').focus();
            return false;
        }
        $('#phone').removeClass('layui-form-danger');
        if(curFlag){
            sendMessage()
        }
    })
})
