layui.use(['jquery', 'upload','form','laydate'], function(){
    var $ = layui.jquery,
        laydate = layui.laydate,
        upload = layui.upload;
    form = layui.form;
    // 自定义验证规则
    form.verify({
        nameVerify: function(value) {
            if(value==''){
                return '请输入司机姓名';
            }
        },
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
        idNumVerify: function(value) {
            if(value!=''){
                var reg = /(^\d{15}$)|(^\d{17}(x|X|\d)$)/;
                var flag = reg.test(value);
                if(!flag){
                    return '请输入正确的身份证号';
                }
            }else{
                return '请输入身份证号';
            }
        },
        drivingAgeVerify: function(value) {
            if(value!=''){
                var reg = /^[+]{0,1}(\d+)$/;
                var flag = reg.test(value);
                if(!flag){
                    return '请输入正整数';
                }
            }
        },
        idLicenceValidityVerify: function(value) {
            if(value==''){
                return '请选择司机身份证有效期';
            }
        },
        driveLicenceValidityVerify: function(value) {
            if(value==''){
                return '请选择司机驾照有效期';
            }
        },
        qualificationsValidityVerify: function(value) {
            if(value==''){
                return '请选择司机从业资格证有效期';
            }
        },
        addressVerify: function(value) {
            if(value==''){
                return '请输入司机当前住址';
            }
        },
        depositVerify: function(value) {
            if(value!=''){
                var reg = /^[+]{0,1}(\d+)$/;
                var flag = reg.test(value);
                if(!flag){
                    return '请输入正整数';
                }
            } else {
                return '请输入押金金额';
            }
        },
        depositStatusVerify: function(value) {
            if(value==''){
                return '请选择押金状态';
            }
        },
        accountNumberVerify: function(value) {
            if(value!=''){
                var reg = /^[+]{0,1}(\d+)$/;
                var flag = reg.test(value);
                if(!flag){
                    return '请输入正整数';
                }
            }
        },
        idLicenceFrontImgVerify:function(value) {
            if (value == '') {
                return '请上传司机身份证正面图片';
            }
        },
        idLicenceBackImgVerify:function(value) {
            if (value == '') {
                return '请上传司机身份证背面图片';
            }
        },
        driveLicenceFrontImgVerify:function(value) {
            if (value == '') {
                return '请上传司机驾照正面图片';
            }
        },
        driveLicenceBackImgVerify:function(value) {
            if (value == '') {
                return '请上传司机驾照背面图片';
            }
        },
        qualificationsFrontImgVerify:function(value) {
            if (value == '') {
                return '请上传机从业资格证正面图片';
            }
        },
        qualificationsBackImgVerify:function(value) {
            if (value == '') {
                return '请上传机从业资格证背面图片';
            }
        }
    });
    // 监听提交
    form.on('submit(add)',
        function(data) {
            var wishJourneyVal = []
            $('.wishJourney').each(function () {
                var startVal = $(this).find('.start input').eq(1).val();
                var endVal = $(this).find('.end input').eq(1).val();
                if(startVal!=''&&startVal!='请选择市级'&&endVal!=''&&endVal!='请选择市级'){
                    wishJourneyVal.push({
                        "start":startVal,
                        "end":endVal
                    })
                }
            })
            var param ={
                'name':data.name,
                'phone':data.phone,
                'idNum':data.idNum,
                'drivingAge':data.drivingAge,
                'driverType':data.driverType,
                'driveLicenceType':data.driveLicenceType,
                'idLicenceValidity':data.idLicenceValidity,
                'driveLicenceValidity':data.driveLicenceValidity,
                'qualificationsValidity':data.qualificationsValidity,
                'status':data.status,
                'address':data.address,
                'avatarImg':data.avatarImg,
                'idLicenceFrontImg':data.idLicenceFrontImg,
                'idLicenceBackImg':data.idLicenceBackImg,
                'driveLicenceFrontImg':data.driveLicenceFrontImg,
                'driveLicenceBackImg':data.driveLicenceBackImg,
                'qualificationsFrontImg':data.qualificationsFrontImg,
                'qualificationsBackImg':data.qualificationsBackImg,
                'transportProtocolImg1':data.transportProtocolImg1,
                'transportProtocolImg2':data.transportProtocolImg2,
                'wishJourney':wishJourneyVal,
                'deposit':data.deposit,
                'depositStatus':data.depositStatus,
                'accountBank':data.accountBank,
                'accountBankAddress':data.accountBankAddress,
                'accountNumber':data.accountNumber,
                'accountName':data.accountName,
                'staffId':17718571615
            }

            $.ajax({
                type: "POST",
                dataType: "JSON",
                url: ipUrl+'/admin/driver/info/save',
                data:param,
                success: function (data){
                    debugger
                    var code = data.code;
                    if(code=='0'){
                        layer.alert("增加成功", {icon: 6},
                            function() {
                                //关闭当前frame
                                xadmin.close();
                                // 可以对父窗口进行刷新
                                xadmin.father_reload();
                            });
                    }else{
                        layer.msg(data.message, {icon: 5,anim: 6});
                    }
                },
                error: function (data) {

                }
            });
            return false;
        });
    // 身份证-正
    uploadImg('idLicenceFrontImg');
    // 身份证-反
    uploadImg('idLicenceBackImg');
    // 驾驶证-正
    uploadImg('driveLicenceFrontImg');
    // 驾驶证-反
    uploadImg('driveLicenceBackImg');
    // 从业资格证-正
    uploadImg('qualificationsFrontImg');
    // 从业资格证-反
    uploadImg('qualificationsBackImg');
    // 运输协议1
    uploadImg('transportProtocolImg1');
    // 运输协议2
    uploadImg('transportProtocolImg2');
    // 头像
    uploadImg('avatarImg');

    // 图片上传
    function uploadImg(id){
        upload.render({
            elem: '#'+id+'Div'
            ,url: ipUrl+'/admin/driver/info/uploadImg?staffId=17718571615'
            ,size: 1024*5
            ,accept: 'images' //只允许上传图片
            ,acceptMime: 'image/*' //只筛选图片
            ,done: function(res){
                if(res.code=='0'){
                    layer.msg('上传成功', {icon: 6,anim: 6});
                    $('#'+id+'Div').children('i').hide();
                    $('#'+id+'Div').children('p').hide();
                    $('#'+id+'View').removeClass('layui-hide').find('img').attr('src', res.data);
                    $('#'+id).val(res.data)
                }else{
                    layer.msg(data.message, {icon: 5,anim: 6});
                }
            }
        });
    }
    // 身份证有效期
    laydateRender('idLicenceValidity')
    // 驾驶证有效期
    laydateRender('driveLicenceValidity')
    // 从业资格证有效期
    laydateRender('qualificationsValidity')
    // 日期
    function laydateRender(id){
        laydate.render({
            elem: '#'+id
        });
    };
    // 获取所有司机状态
    $.ajax({
        type: "GET",
        dataType: "JSON",
        url: ipUrl+'/admin/driver/info/driverStatus?staffId=17718571615',
        success: function (data){
            var code = data.code;
            if(code=='0'){
            }else{
                layer.msg(data.message, {icon: 5,anim: 6});
            }
        },
        error: function (data) {

        }
    });
    // 	获取所有司机类型
    $.ajax({
        type: "GET",
        dataType: "JSON",
        url: ipUrl+'/admin/driver/info/driverTypes?staffId=17718571615',
        success: function (data){
            var code = data.code;
            if(code=='0'){
            }else{
                layer.msg(data.message, {icon: 5,anim: 6});
            }
        },
        error: function (data) {

        }
    });
    // 	获取所有驾照类型
    $.ajax({
        type: "GET",
        dataType: "JSON",
        url: ipUrl+'/admin/driver/info/licenceType?staffId=17718571615',
        success: function (data){
            var code = data.code;
            if(code=='0'){
            }else{
                layer.msg(data.message, {icon: 5,anim: 6});
            }
        },
        error: function (data) {

        }
    });
    // 添加心愿路线
    $('#addWishJourney').click(function () {
        $('.no-data').hide()
        var startId = guid();
        var endId = guid();
        var wishJourneyHtml = ` <div class="layui-form wishJourney layui-clear">
                <div class="x-city start" id="${startId}">
                    <label class="layui-form-label" style="width: 50px">始发地：</label>
                    <div class="layui-input-inline">
                        <select name="province" lay-filter="province">
                            <option value="">请选择省</option>
                        </select>
                    </div>
                    <div class="layui-input-inline">
                        <select name="city" lay-filter="city">
                            <option value="">请选择市</option>
                        </select>
                    </div>
                </div>
                <div class="x-city end" id="${endId}">
                    <label class="layui-form-label">目的地：</label>
                    <div class="layui-input-inline">
                        <select name="province" lay-filter="province">
                            <option value="">请选择省</option>
                        </select>
                    </div>
                    <div class="layui-input-inline">
                        <select name="city" lay-filter="city">
                            <option value="">请选择市</option>
                        </select>
                    </div>
                </div>
                <diav class="remove-btn" onclick="removeWishJourney(this)">-移除</diav>
            </div>`
        $('#wishJourney').append(wishJourneyHtml);
        $('#'+startId).xcity();
        $('#'+endId).xcity();
    });
    //监听取消
    $('#addCancel').click(function () {
        //关闭当前frame
        xadmin.close();
        return false;
    });

    showImg =function(t) {
        var src = $(t).attr('data-src');
        //页面层
        layer.open({
            type: 1,
            title: false,
            closeBtn: 0,
            area: ['216px', '156px'], //宽高
            shadeClose: true,
            content: '<div style="overflow: hidden;background: url(' + src +' ) no-repeat center;width:216px;height: 156px;background-size: 216px 200px;"></div>'
        });
    }
});
// 移除
function removeWishJourney (_this) {
    $(_this).parent().remove();
    var len = $('.wishJourney').length;
    if(len == 0){
        $('.no-data').show()
    }
}
// 获取随机id
function guid() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
        return v.toString(16);
    });
}
