layui.use(['jquery', 'upload','form','laydate'], function(){
    var $ = layui.jquery,
        laydate = layui.laydate,
        upload = layui.upload,
        edipao = layui.edipao;
    form = layui.form;
    // 自定义验证规则
    form.verify({
        nameVerify: function(value) {
            if(value==''){
                return '请输入司机姓名';
            }else {
                if (value.length > 15) {
                    return '司机姓名不能能超过15个字符';
                }
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
                var reg = /^(?!0+(?:\.0+)?$)(?:[1-9]\d*|0)(?:\.\d{1,2})?$/;
                var flag = reg.test(value);
                if(!flag){
                    return '请输入正数可以保留2位小数';
                }
            }
        },
        driverTypeVerify: function(value) {
            if(value==''){
                return '请选择司机类型';
            }
        },
        driveLicenceTypeVerify: function(value) {
            if(value==''){
                return '请选择驾照类型';
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
        statusVerify: function(value) {
            if(value==''){
                return '请选择司机状态';
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
    // 身份证-正
    uploadImg('idLicenceFrontImg',{'imgType':1,'side':'face'},function (data) {
        var val = data.data.ocrData;
        $('#name').val(val.name); // 司机姓名
        $('#accountName').val(val.name); //银行账户名
        $('#idNum').val(val.idNum); // 身份证号码
        $('#address').val(val.address);  // 住址
    });
    // 身份证-反
    uploadImg('idLicenceBackImg',{'imgType':1,'side':'back'},function (data) {
        var endDate = data.data.ocrData.endDate;
        if(endDate!=null&&endDate!=''){
            var dateFormat = getFormatDate(endDate);
            $('#idLicenceValidity').val(dateFormat); // 身份证有效期
        }
    });
    // 驾驶证-正
    uploadImg('driveLicenceFrontImg',{'imgType':2,'side':'face'},function (data) {
        var val = data.data.ocrData;
        var vehicleType = val.vehicleType; //驾照类型
        $('#driveLicenceType').val(vehicleType);
        form.render('select');
        var issueDate = val.issueDate; // 驾龄计算
        if(issueDate!=null&&issueDate!=''){
            var startDateStr = getFormatDate(issueDate);
            var endDateStr = getNowFormatDate();//当前时间
            var year = getDateYearSub(startDateStr, endDateStr);// 驾龄计算差值
            $('#drivingAge').val(year);
        }
        var endDate = val.endDate; // 驾照有效期
        if(endDate!=null&&endDate!=''){
            var dateFormat = getFormatDate(endDate);
            $('#driveLicenceValidity').val(dateFormat); // 驾照有效期
        }
    });
    // 驾驶证-反
    uploadImg('driveLicenceBackImg',{'imgType':2,'side':'back'});
    // 从业资格证-正
    uploadImg('qualificationsFrontImg',{'imgType':3,'side':'face'});
    // 从业资格证-反
    uploadImg('qualificationsBackImg',{'imgType':3,'side':'back'});
    // 运输协议1
    uploadImg('transportProtocolImg1',{'imgType':4});
    // 运输协议2
    uploadImg('transportProtocolImg2',{'imgType':4});
    // 头像
    uploadImg('avatarImg',{'imgType':5});

    // 图片上传
    function uploadImg(id,options,callback){
        options.loginStaffId = edipao.getLoginStaffId();
        upload.render({
            elem: '#'+id+'Div'
            ,url: edipao.API_HOST+'/admin/driver/info/uploadImg'
            ,size: 1024*5
            ,data:options
            ,accept: 'images' //只允许上传图片
            ,acceptMime: 'image/*' //只筛选图片
            ,done: function(res){
                edipao.codeMiddleware(res);
                if(res.code=='0'){
                    layer.msg('上传成功', {icon: 6,anim: 6});
                    $('#'+id+'Div').children('i').hide();
                    $('#'+id+'Div').children('p').hide();
                    $('#'+id+'View').removeClass('layui-hide').find('img').attr('src', res.data.imgUrl);
                    $('#'+id).val(res.data.imgUrl);

                    if (callback && typeof(callback) === "function") {
                        callback(res);
                    }
                }else{
                    layer.msg(res.message, {icon: 5,anim: 6});
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
    var driverStatusData = parent.driverStatusData;
    var optionStatus = "<option value=''>请选择状态</option>";
    for(var i in driverStatusData){
        if(driverStatusData[i] =='待命中'){
            optionStatus+="<option value='"+i+"' selected='''>"+driverStatusData[i]+"</option>";
        }else{
            optionStatus+="<option value='"+i+"'>"+driverStatusData[i]+"</option>";
        }
    }
    $("#status").html(optionStatus);
    form.render('select');
    // 	获取所有司机类型
    var driverTypesData = parent.driverTypesData;

    var optionType = "<option value=''>请选择司机类型</option>";
    for(var i in driverTypesData){
        if(driverTypesData[i] =='外调'){
            optionType+="<option value='"+i+"' selected='''>"+driverTypesData[i]+"</option>";
        }else{
            optionType+="<option value='"+i+"'>"+driverTypesData[i]+"</option>";
        }
    }
    $("#driverType").html(optionType);
    form.render('select');

    // 获取所有驾照类型
     var driveLicenceTypeData = parent.driveLicenceTypeData;
    var optionLicence = "<option value=''>请选择驾照类型</option>";
    for(var i in driveLicenceTypeData){
        optionLicence+="<option value='"+driveLicenceTypeData[i]+"'>"+driveLicenceTypeData[i]+"</option>";
    }
    $("#driveLicenceType").html(optionLicence);
    form.render('select');


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
    // 监听取消
    $('#addCancel').click(function () {
        //关闭当前frame
        xadmin.close();
        return false;
    });
    // 查看图例
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
    };

    // 押金状态控制支付流水显示隐藏
    form.on('select(depositStatusFilter)', function(data){
        if(data.value =='0'||data.value ==''){
            $("#depositTradeNumberDiv").addClass('layui-hide');
            $('#deposit').attr("disabled",false);
        }else{
            $("#depositTradeNumberDiv").removeClass('layui-hide');
        }
    });

    // 开户省市初始化
    $('#accountCity').xcity();

    // 司机姓名和银行账户保持一致
    $('#name').blur(function () {
        $('#accountName').val($(this).val());
    });
    // 初始化图片放大
    zoomImg ()
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
//计算年份
function getDateYearSub(startDateStr, endDateStr) {
    var day = 24 * 60 * 60 *1000;
    var sDate = new Date(Date.parse(startDateStr.replace(/-/g, "/")));
    var eDate = new Date(Date.parse(endDateStr.replace(/-/g, "/")));

    //得到前一天
    sDate = new Date(sDate.getTime() - day);

    //获得各自的年、月、日
    var sY  = sDate.getFullYear();
    var sM  = sDate.getMonth();
    var sD  = sDate.getDate();
    var eY  = eDate.getFullYear();
    var eM  = eDate.getMonth();
    var eD  = eDate.getDate();
    var year = eY - sY;
    var month = eM - sM;
    if (month < 0) {
        year--;
        month = eM + (12 - sM);
    }
    var data = (year + parseFloat(month/12)).toFixed(2)
    return data
}
//获取当前时间
function getNowFormatDate() {
    var date = new Date();
    var seperator1 = "-";
    var year = date.getFullYear();
    var month = date.getMonth() + 1;
    var strDate = date.getDate();
    if (month >= 1 && month <= 9) {
        month = "0" + month;
    }
    if (strDate >= 0 && strDate <= 9) {
        strDate = "0" + strDate;
    }
    var currentdate = year + seperator1 + month + seperator1 + strDate;
    return currentdate;
}
// 转化日期为xxxx-xx-xx
function getFormatDate(data) {
    var seperator1 = "-";
    var year = data.substring(0,4);
    var month = data.substring(4,6);
    var day = data.substring(6,8);
    return year+seperator1+month+seperator1+day;
}
