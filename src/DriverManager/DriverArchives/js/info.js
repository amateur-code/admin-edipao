layui.use(['jquery','form'], function() {
    var $ = layui.jquery,
        edipao = layui.edipao,
        form = layui.form;
    // 获取所有司机状态
    var driverStatusData = parent.driverStatusData;
    // 	获取所有司机类型
    var driverTypesData = parent.driverTypesData;
    // 获取押金状态
    var depositStatusData = parent.depositStatusData;

    var params = edipao.urlGet();

    // 打开审核页面获取最近一次修改的数据
    edipao.request({
        type: 'GET',
        url: '/admin/log/last-modify/get',
        data: {
            dataPk: params.id,
            operationModule:'3'
        }
    }).done(function(res) {
        if (res.code == 0) {

        } else {
            layer.msg(res.message, {icon: 5,anim: 6});
        }
    })
    // 获取详情

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

    function initData(data){
        for(var i in data){
            $('#'+i).html(data[i]);
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
        // 日期格式转化
        var idLicenceValidity = data.idLicenceValidity;
        if(idLicenceValidity!=''&&idLicenceValidity!='0'&&idLicenceValidity!=null){
            idLicenceValidity = getFormatDate(JSON.stringify(data.idLicenceValidity));
        }else{
            idLicenceValidity = '';
        }
        $('#idLicenceValidity').html(idLicenceValidity);

        var driveLicenceValidity = data.driveLicenceValidity;
        if(driveLicenceValidity!=''&&driveLicenceValidity!='0'&&driveLicenceValidity!=null){
            driveLicenceValidity = getFormatDate(JSON.stringify(data.driveLicenceValidity));
        }else{
            driveLicenceValidity = '';
        }
        $('#driveLicenceValidity').html(driveLicenceValidity);

        var qualificationsValidity = data.qualificationsValidity;
        if(qualificationsValidity!=''&&qualificationsValidity!='0'&&qualificationsValidity!=null){
            qualificationsValidity = getFormatDate(JSON.stringify(data.qualificationsValidity));
        }else{
            qualificationsValidity = '';
        }
        $('#qualificationsValidity').html(qualificationsValidity);


        var status = driverStatusData[data.status]||'';
        $('#status').html(status);

        var driverType = driverTypesData[data.driverType]||'';
        $('#driverType').html(driverType);
        // 押金状态

        var depositStatusVal = depositStatusData[data.depositStatus]||'';
        $('#depositStatus').html(depositStatusVal)


        // 开户省市
        if(data.accountCity!=null&&data.accountCity!=''){
            var province = data.accountCity.split('-')[0];
            var city = data.accountCity.split('-')[1];
            $('#accountCity').html(province+city);
        }

        // 显示押金支付流水
        if(data.depositStatus=='1'){
            $('#depositTradeNumberDiv').removeClass('layui-hide');
        }else{
            $('#depositTradeNumberDiv').addClass('layui-hide');
        }



        // 心愿路线
        var wishJourney = JSON.parse(data.wishJourney);
        if(wishJourney.length>0){
            $('#wishJourney').html('')
            for(var i=0 ;i<wishJourney.length;i++){
                $('.no-data').hide();
                var start1 = wishJourney[i]['start'].split('-')[0]||'';
                var start2 = wishJourney[i]['start'].split('-')[1]||'';
                var start = start1 + start2;
                var end1 = wishJourney[i]['end'].split('-')[0]||'';
                var end2 = wishJourney[i]['end'].split('-')[1]||'';
                var end = end1 + end2;
                var wishJourneyHtml =` <div class="layui-row">
                                <div class="layui-col-md3">
                                    <div class="layui-form-item">
                                        <label class="layui-form-label">始发地：</label>
                                        <div class="layui-input-block">
                                            <span class="name-color">${start}</span>
                                        </div>
                                    </div>
                                </div>
                                <div class="layui-col-md3">
                                    <div class="layui-form-item">
                                        <label class="layui-form-label">目的地：</label>
                                        <div class="layui-input-block">
                                            <span class="name-color">${end}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>`;
                $('#wishJourney').append(wishJourneyHtml);
            }
        }
    }
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
})
// 转化日期为xxxx-xx-xx
function getFormatDate(data) {
    var seperator1 = "-";
    var year = data.substring(0,4);
    var month = data.substring(4,6);
    var day = data.substring(6,8);
    return year+seperator1+month+seperator1+day;
}
