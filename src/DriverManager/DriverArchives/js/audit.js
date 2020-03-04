layui.use(['jquery', 'upload','form','laydate'], function(){
    var $ = layui.jquery,
        edipao = layui.edipao;
        form = layui.form;
    var params = edipao.urlGet();
    // 监听提交
    form.on('submit(add)',
        function(data) {
            var auditParams = data.field;
            auditParams['dataPk'] = params.id;
            edipao.request({
                type: 'POST',
                url: '/admin/driver/info/audit',
                data:auditParams,
            }).done(res=>{
                if(res.code == 0){
                    layer.alert("审核成功", {icon: 6},
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
