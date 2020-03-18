layui.use(['jquery','form','laytpl'], function() {
    var $ = layui.jquery,
        laytpl = layui.laytpl,
        edipao = layui.edipao,
        detail = {},
        check = {},
        form = layui.form;

    // 获取所有司机状态
    var driverStatusData = parent.driverStatusData;
    // 	获取所有司机类型
    var driverTypesData = parent.driverTypesData;
    // 获取押金状态
    var depositStatusData = parent.depositStatusData;

    var params = edipao.urlGet();

    // 打开审核页面获取最近一次修改的数据
    function waitCheck() {
        edipao.request({
            type: 'GET',
            url: '/admin/log/last-modify/get',
            data: {
                dataPk: params.id,
                operationModule: '3'
            }
        }).done(function (res) {
            if(res.code == 0){
                if(res.data){
                    var editData = JSON.parse(res.data.modifyAfterJson)
                    if(editData.newMap&&editData.newMap.driverType!=null){
                        editData.newMap.driverType = driverTypesData[editData.newMap.driverType]
                    }
                    if(editData.newMap&&editData.newMap.status!=null){
                        editData.newMap.status = driverStatusData[editData.newMap.status]
                    }
                    if(editData.newMap&&editData.newMap.depositStatus!=null){
                        editData.newMap.depositStatus = depositStatusData[editData.newMap.depositStatus]
                    }
                   if(editData.newMap&&editData.newMap.wishJourney!=null){
                       editData.newMap.wishJourney = JSON.parse(editData.newMap.wishJourney)
                   }
                    if(editData.newMap&&editData.newMap.accountCity!=null){
                        editData.newMap.accountCity = (editData.newMap.accountCity).replace(/\-/g,'')
                    }
                    check = editData.newMap;
                    layui.each(check,function(key, value) {
                        check[key] = value || '--'
                    });
                }
                render()
            } else {
                layer.msg(res.message, { icon: 5, anim: 6 });
            }
        })
    }
    // 获取详情
    edipao.request({
        type: 'GET',
        url: '/admin/driver/info/getDriver',
        data: {
            driverId: params.id
        }
    }).done(function(res) {
        if (res.code == 0) {
            res.data.wishJourney = JSON.parse(res.data.wishJourney);
            if(res.data.accountCity!=null&&res.data.accountCity!=''){
                res.data.accountCity = (res.data.accountCity).replace(/\-/g,'')
            }

            detail = res.data;
            if(detail.approvalFlag == 0){
                waitCheck();
            }else{
                render();
            }
        } else {
            layer.msg(res.message, {icon: 5,anim: 6});
        }
    })

    function render(){
        laytpl(preview.innerHTML).render({detail: detail, check: check}, function(html) {
            document.getElementById('info').innerHTML = html;
            zoomImg ()
        })
    }
})
