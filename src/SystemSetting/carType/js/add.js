layui.use(['jquery','form'], function(){
    var $ = layui.jquery,
        edipao = layui.edipao;
       form = layui.form;
    // 监听提交
    form.on('submit(add)',
        function(data) {
            edipao.request({
                type: 'POST',
                url: '/admin/sys/truckModel/add',
                data:data.field,
            }).done(res=>{
                if(res.code == 0){
                    layer.alert("增加成功", {icon: 6},
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
});
