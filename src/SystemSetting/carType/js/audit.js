layui.use(['jquery', 'upload','form','laydate'], function(){
    var $ = layui.jquery,
        edipao = layui.edipao;
        form = layui.form;
    var params = edipao.urlGet();
    //自定义验证规则
    form.verify({
        checkRemarkVerify: function (value) {
            var result = $("input[name=checkResult]:checked").val();
            if(result == 'reject' && value == ''){
                return '审核结果为驳回时，审核备注必填';
            }
            if(value.length > 300){
                return '审核备注不能超过300个字符'
            }
        }
    });
    // 监听提交
    form.on('submit(add)',
        function(data) {
            var auditParams = data.field;
            auditParams['dataPk'] = params.id;
            edipao.request({
                type: 'POST',
                url: '/admin/sys/truckModel/approval/result/save',
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
    // 监听取消
    $('#addCancel').click(function () {
        //关闭当前frame
        xadmin.close();
        return false;
    });
});
