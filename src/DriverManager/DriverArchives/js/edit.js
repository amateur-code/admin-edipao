layui.use(['jquery', 'upload','form','laydate','autocomplete'], function(){
    var $ = layui.jquery,
        edipao = layui.edipao;
    form = layui.form;

    var driver = {};
    // 获取所有司机状态  key和val交换
    var driverStatusData = parent.driverStatusData;
    var driverStatusVal = {};
    for (let k in driverStatusData) {
        let value = driverStatusData[k];
        driverStatusVal[value] = k;
    }
    // 	获取所有司机类型
    var driverTypesData = parent.driverTypesData;
    var driverTypesVal = {};
    for (let k in driverTypesData) {
        let value = driverTypesData[k];
        driverTypesVal[value] = k;
    }
    // 获取押金状态
    var depositStatusData = parent.depositStatusData;
    var depositStatusVal = {};
    for (let k in depositStatusData) {
        let value = depositStatusData[k];
        depositStatusVal[value] = k;
    }
    // 获取详情
    var params = edipao.urlGet();
    edipao.request({
        type: 'GET',
        url: '/admin/driver/info/getDriver',
        data: {
            driverId: params.id
        }
    }).done(function(res) {
        if (res.code == 0) {
            initData(res.data)
        } else {
            layer.msg(res.message, {icon: 5,anim: 6});
        }
    })

    var depositStatusRecord = ''
    function initData(data){
        driver = data;
        data.depositStatus = depositStatusVal[data.depositStatus];
        data.driverType = driverTypesVal[data.driverType];
        data.status = driverStatusVal[data.status];
        if(data.idLicenceValidity == "长期"){
            data.idLicenceValidity = "";
            data.idLicenceValidityCheck = "on";
            $("#idLicenceValidity").val("").attr("disabled", "disabled");
        }
        form.val("driverEdit", data);
        // 开户省市
        if(data.accountCity!=null&&data.accountCity!=''){
            var province = data.accountCity.split('-')[0];
            var city = data.accountCity.split('-')[1];
            $('#accountCity').xcity(province,city);
        }
        // 显示押金支付流水
        depositStatusRecord =data.depositStatus;
        if(depositStatusRecord=='1'||depositStatusRecord=='已支付'){
            $('#depositTradeNumberDiv').removeClass('layui-hide');
            // $('#deposit').attr("disabled","disabled");
            // $('#deposit').addClass("layui-disabled");
            // $('#depositTradeNumber').attr("disabled","disabled");
            // $('#depositTradeNumber').addClass("layui-disabled");
            // $('#depositStatus').attr("disabled","disabled");
            // $('#depositStatus').addClass("layui-disabled");
            form.render();
        }


        // 显示图片
        if(data.idLicenceFrontImg!=''&&data.idLicenceFrontImg!=null){
            $('#idLicenceFrontImgDiv').children('i').hide();
            $('#idLicenceFrontImgView').removeClass('layui-hide').find('img').attr('src', data.idLicenceFrontImg);
        }
        if(data.idLicenceBackImg!=''&&data.idLicenceBackImg!=null){
            $('#idLicenceBackImgDiv').children('i').hide();
            $('#idLicenceBackImgView').removeClass('layui-hide').find('img').attr('src', data.idLicenceBackImg);
        }
        if(data.driveLicenceFrontImg!=''&&data.driveLicenceFrontImg!=null){
            $('#driveLicenceFrontImgDiv').children('i').hide();
            $('#driveLicenceFrontImgView').removeClass('layui-hide').find('img').attr('src', data.driveLicenceFrontImg);
        }
        if(data.driveLicenceBackImg!=''&&data.driveLicenceBackImg!=null){
            $('#driveLicenceBackImgDiv').children('i').hide();
            $('#driveLicenceBackImgView').removeClass('layui-hide').find('img').attr('src', data.driveLicenceBackImg);
        }
        if(data.avatarImg!=''&&data.avatarImg!=null){
            $('#avatarImgDiv').children('i').hide();
            $('#avatarImgView').removeClass('layui-hide').find('img').attr('src', data.avatarImg);
        }
        if(data.qualificationsFrontImg!=''&&data.qualificationsFrontImg!=null){
            $('#qualificationsFrontImgDiv').children('i').hide();
            $('#qualificationsFrontImgView').removeClass('layui-hide').find('img').attr('src', data.qualificationsFrontImg);
        }
        if(data.qualificationsBackImg!=''&&data.qualificationsBackImg!=null){
            $('#qualificationsBackImgDiv').children('i').hide();
            $('#qualificationsBackImgView').removeClass('layui-hide').find('img').attr('src', data.qualificationsBackImg);
        }
        if(data.transportProtocolImg1!=''&&data.transportProtocolImg1!=null){
            $('#transportProtocolImg1Div').children('i').hide();
            $('#transportProtocolImg1View').removeClass('layui-hide').find('img').attr('src', data.transportProtocolImg1);
        }
        if(data.transportProtocolImg2!=''&&data.transportProtocolImg2!=null){
            $('#transportProtocolImg2Div').children('i').hide();
            $('#transportProtocolImg2View').removeClass('layui-hide').find('img').attr('src', data.transportProtocolImg2);
        }
        // 心愿路线
        var wishJourney = JSON.parse(data.wishJourney);
        if(wishJourney&&wishJourney.length>0){
            for(var i=0 ;i<wishJourney.length;i++){
                $('.no-data').hide();
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
                var start1 = wishJourney[i]['start']['province'];
                var start2 = wishJourney[i]['start']['city'];
                $('#'+startId).xcity(start1,start2);
                var end1 = wishJourney[i]['end']['province'];
                var end2 = wishJourney[i]['end']['city'];
                $('#'+endId).xcity(end1,end2);
            }
        }
    }

    // 监听提交
    form.on('submit(add)',
        function(data) {
            if(data.field.idLicenceValidityCheck == "on"){
                data.field.idLicenceValidity = $("#idLicenceValidityCheck")[0].title;
            }
            var wishJourneyVal = []
            $('.wishJourney').each(function () {
                var startVal1 = $(this).find('.start select[name="province"]').val();
                var startVal2 = $(this).find('.start select[name="city"]').val();
                var endVal1 = $(this).find('.end select[name="province"]').val();
                var endVal2 = $(this).find('.end select[name="city"]').val();
                if(startVal2!=''&&startVal2!='请选择市级'&&endVal2!=''&&endVal2!='请选择市级'){
                    var startCode='';
                    if(startVal2=='全部'){
                        startCode = cityCode[startVal1]
                    }else{
                        startCode = cityCode[startVal2]
                    }

                    var endCode='';
                    if(endVal2=='全部'){
                        endCode = cityCode[endVal1]
                    }else{
                        endCode = cityCode[endVal2]
                    }
                    wishJourneyVal.push({
                        'start': {
                            "code": startCode,
                            "province": startVal1,
                            "city": startVal2
                        },
                        'end': {
                            "code": endCode,
                            "province": endVal1,
                            "city": endVal2
                        }
                    })
                }
            })
            // 开户省市
            var province = $("#accountCity select[name='province']").val();
            var city = $("#accountCity select[name='city']").val();
            var accountCity ='';
            if(province!='请选择省份'&&city!='请选择市级'){
                accountCity = province+'-'+city;
            }
            console.log($(".driveLicenceTypeClass").find("input").val())
            // 证件类型
            data.field.driveLicenceType = $(".driveLicenceTypeClass").find("input").val();
            if(!data.field.driveLicenceType) {
                layer.msg("请选择驾照类型", {icon: 2});
                return false;
            }
            // 押金状态
            if(data.field.depositStatus=='1'&&data.field.depositTradeNumber==''){
                $('#depositTradeNumber').focus();
                layer.msg('请输入押金支付流水号', {icon: 5,anim: 6});
                return false
            }
            if(data.field.depositStatus=='0'){
                data.field.depositTradeNumber = '';
            }

            var tipsHtml = '';
            if(idLicenceFrontImgFlag&&driverNameVal!=data.field.name){
                tipsHtml+='司机姓名、'
            }

            if(idLicenceFrontImgFlag&&idNumVal!=data.field.idNum){
                tipsHtml+='身份证号、'
            }
            if(idLicenceFrontImgFlag&&addressVal!=data.field.address){
                tipsHtml+='当前住址、'
            }
            if(idLicenceBackImgFlag&&idLicenceValidityVal!=data.field.idLicenceValidity){
                tipsHtml+='身份证有效期、'
            }
            if(driveLicenceFrontImgFlag&&driveLicenceTypeVal!=data.field.driveLicenceType){
                tipsHtml+='驾照类型、'
            }
            if(driveLicenceFrontImgFlag&&drivingAgeVal!=data.field.drivingAge){
                tipsHtml+='驾龄、'
            }
            if(driveLicenceFrontImgFlag&&driveLicenceValidityVal!=data.field.driveLicenceValidity){
                tipsHtml+='驾驶证有效期、'
            }
            if(tipsHtml!=''){
                tipsHtml = tipsHtml.substring(0,tipsHtml.length-1);
                layer.confirm(tipsHtml+'与识别信息不一致，确定提交？', {
                    btn: ['确定','取消'] //按钮
                }, function(index){
                    layer.close(index)
                    saveData ()
                }, function(index){
                    layer.close(index)
                    return false;
                });

            }else{
                saveData ()
            }


            function saveData () {
                var param ={
                    'id': params.id,
                    'name':data.field.name,
                    'phone':data.field.phone,
                    'idNum':data.field.idNum,
                    'drivingAge':data.field.drivingAge,
                    'driverType':data.field.driverType,
                    'driveLicenceType':data.field.driveLicenceType,
                    'idLicenceValidity':data.field.idLicenceValidity,
                    'driveLicenceValidity':data.field.driveLicenceValidity,
                    'qualificationsValidity':data.field.qualificationsValidity,
                    'status':data.field.status,
                    'address':data.field.address,
                    'avatarImg':data.field.avatarImg,
                    'idLicenceFrontImg':data.field.idLicenceFrontImg,
                    'idLicenceBackImg':data.field.idLicenceBackImg,
                    'driveLicenceFrontImg':data.field.driveLicenceFrontImg,
                    'driveLicenceBackImg':data.field.driveLicenceBackImg,
                    'qualificationsFrontImg':data.field.qualificationsFrontImg,
                    'qualificationsBackImg':data.field.qualificationsBackImg,
                    'transportProtocolImg1':data.field.transportProtocolImg1,
                    'transportProtocolImg2':data.field.transportProtocolImg2,
                    'wishJourney':JSON.stringify(wishJourneyVal).trim(),
                    'deposit':data.field.deposit,
                    'depositStatus':data.field.depositStatus,
                    'depositTradeNumber':data.field.depositTradeNumber,
                    'accountBank':data.field.accountBank,
                    'accountBankAddress':data.field.accountBankAddress,
                    'accountNumber':data.field.accountNumber,
                    'accountName':data.field.accountName,
                    'emergencyRelation':data.field.emergencyRelation,
                    'emergencyContact':data.field.emergencyContact,
                    'emergencyPhone':data.field.emergencyPhone,
                    'accountCity':accountCity,
                    'loginStaffId':edipao.getLoginStaffId(),

                }
                edipao.request({
                    type: 'POST',
                    url: '/admin/driver/info/update',
                    data:param,
                }).done(res=>{
                    if(res.code == 0){
                        layer.alert("修改成功", {icon: 6},
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
            }
            return false;
        });


    // 押金状态控制支付流水显示隐藏
    form.on('select(depositStatusFilter)', function(data){
        if(depositStatusRecord=='1'||depositStatusRecord=='已支付'){
            if(data.value =='0'||data.value ==''){
                $("#depositTradeNumberDiv").addClass('layui-hide');
            }else{
                $("#depositTradeNumberDiv").removeClass('layui-hide');
            }
        }else{
            if(data.value =='0'||data.value ==''){
                $("#depositTradeNumberDiv").addClass('layui-hide');
            }else{
                $("#depositTradeNumberDiv").removeClass('layui-hide');
            }
        }
    });
    setTimeout(function () {
        $(".driveLicenceTypeClass").find("input").removeAttr("readonly").val(driver.driveLicenceType);;
    },200);
});
