layui.use(['jquery', 'upload','form','laydate'], function(){
    var $ = layui.jquery,
        laydate = layui.laydate,
        upload = layui.upload,
        edipao = layui.edipao;
    form = layui.form;
    // 押金状态控制支付流水显示隐藏
    form.on('select(depositStatusFilter)', function(data){
        if(data.value =='0'||data.value ==''){
            $("#depositTradeNumberDiv").addClass('layui-hide');
        }else{
            $("#depositTradeNumberDiv").removeClass('layui-hide');
        }
    });
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
            // 证件类型
            data.field.driveLicenceType = $(".driveLicenceTypeClass").find("input").val() || data.field.driveLicenceType;
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
                   'loginStaffId':edipao.getLoginStaffId()
               }
               edipao.request({
                   type: 'POST',
                   url: '/admin/driver/info/save',
                   data:param,
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
           }
            return false;
        });
    setTimeout(function () {
        $(".driveLicenceTypeClass").find("input").removeAttr("readonly");
    },200);
});
