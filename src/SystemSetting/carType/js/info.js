layui.use(['jquery','form','laytpl'], function() {
    var $ = layui.jquery,
        laytpl = layui.laytpl,
        edipao = layui.edipao,
        detail = {},
        check = {};
    // 是否背车
    var orderTypeData={
        '0':'不背车',
        '1':'背车'
    }
    // 状态
    var statusData={
        '1':'有效',
        '2':'失效'
    }

    var params = edipao.urlGet();

    // 打开审核页面获取最近一次修改的数据
    function waitCheck() {
        edipao.request({
            type: 'GET',
            url: '/admin/log/last-modify/get',
            data: {
                dataPk: params.id,
                operationModule: '9'
            }
        }).done(function (res) {
            if(res.code == 0){
                if(res.data){
                    var editData = JSON.parse(res.data.modifyAfterJson)
                    check = editData.newMap;
                    layui.each(check,function(key, value) {
                        if(key == 'status'){
                            check.status = statusData[check.status]
                        }else if(key == 'orderType'){
                            check.orderType = orderTypeData[check.orderType]
                        }else if(key =='remark'&&value==''){
                            check[key] = '- -'
                        }
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
        url: '/admin/sys/truckModel/detail',
        data: {
            id: params.id
        }
    }).done(function(res) {
        if (res.code == 0) {
            res.data.status = statusData[res.data.status]
            res.data.orderType = orderTypeData[res.data.orderType]
            res.data.remark = res.data.remark!=''? res.data.remark:'- -'
            detail = res.data;
            if(detail.needApproval){
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
        })
    }
})
// 查看车型代码对照表
function modelCodeLook () {
    xadmin.open('车型代码', './modelCode.html', 600);
}

// 查看驱动形式代码对照表
function driveWayCodeLook () {
    xadmin.open('驱动形式代码', './driveWayCode.html', 600);
}

// 查看功率代码对照表
function powerCodeLook () {
    xadmin.open('功率代码', './powerCode.html');
}
