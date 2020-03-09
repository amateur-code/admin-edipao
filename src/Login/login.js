$(function  () {
    layui.use(['form'], function(){
        var form = layui.form,
        $ = layui.$,
        edipao = layui.edipao;
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
        });
        //监听提交
        form.on('submit(login)', function(data){
            //登陆
            edipao.request({
                url: '/admin/staff/login',
                data: data.field,
            }).done(function(res){
                if(res.code == 0){
                    layui.each(res.data,function(item){
                        layui.sessionData('user', {key:item, value: res.data[item]})
                    })
                    layui.xadmin.clear_tab_data()
                    location.href='../index.html'
                }else{
                    layer.msg(res.message, {icon: 5,anim: 6});
                }
            })
        });
    });
})
