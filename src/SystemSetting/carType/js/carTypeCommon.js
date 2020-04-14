layui.use(['jquery', 'form'], function () {
    var $ = layui.jquery,
        edipao = layui.edipao;
    form = layui.form;
    // 获取所有驾照类型
    var driveLicenceTypeData = parent.driveLicenceTypeData;
    var optionLicence = "<option value=''>请选择</option>";
    for (var i in driveLicenceTypeData) {
        optionLicence += "<option value='" + driveLicenceTypeData[i] + "'>" + driveLicenceTypeData[i] + "</option>";
    }
    $("#certificateCode").html(optionLicence);
    form.render('select');


    // 车型代码
    var modelCodeData = [];
    edipao.request({
        type: 'GET',
        url: '/admin/sys/dict/getDictItemList',
        data: { dictType: 'sys.truckType.refenceTable' },
    }).done(res => {
        if (res.code == 0) {
            if (res.data) {
                var dictItemRespList = res.data.dictItemRespList || [];
                layui.each(dictItemRespList, function (index, item) {
                    modelCodeData.push(item.dictValue)
                })
            }
        } else {
            layer.msg(res.message, { icon: 5, anim: 6 });
        }
    });

    //驱动形式
    var driveWayCodeData = [];
    edipao.request({
        type: 'GET',
        url: '/admin/sys/dict/getDictItemList',
        data: { dictType: 'sys.driveWayCode.refenceTable' },
    }).done(res => {
        if (res.code == 0) {
            if (res.data) {
                var dictItemRespList = res.data.dictItemRespList || [];
                layui.each(dictItemRespList, function (index, item) {
                    driveWayCodeData.push(item.dictValue)
                })
            }
        } else {
            layer.msg(res.message, { icon: 5, anim: 6 });
        }
    });

    //功率代码
    var powerData = []

    function getPowerData(type){
        edipao.request({
            type: 'GET',
            url: '/admin/sys/dict/getDictItemList',
            data: { dictType: type },
        }).done(res => {
            if (res.code == 0) {
                if (res.data) {
                    var dictItemRespList = res.data.dictItemRespList || [];
                    layui.each(dictItemRespList, function (index, item) {
                        powerData.push(item.dictValue)
                    })
                }
            } else {
                layer.msg(res.message, { icon: 5, anim: 6 });
            }
        });
    }
    // 大柴
    getPowerData('sys.dachai.refenceTable')
    // 锡柴
    getPowerData('sys.xichai.refenceTable')
    // 潍柴
    getPowerData('sys.weichai.refenceTable')
    // 东风康明斯
    getPowerData('sys.dongfengkangmingsi.refenceTable')
    // 玉柴
    getPowerData('sys.yuchai.refenceTable')

    // 自定义验证规则
    form.verify({
        modelNameVerify: function (value) {
            if (value == '') {
                return '请输入车型名称';
            } else {
                if (value.length > 50) {
                    return '车型名称不能超过50个字符';
                }
            }
        },
        certificateCodeVerify: function (value, elem) {
            var inputVal = $(elem).parent().find("input").val();
            if (value == '' && inputVal == '') {
                return '请选择要求驾照';
            }
        },
        orderTypeVerify: function (value) {
            if (value == '') {
                return '请选择是否背车';
            }
        },
        modelCodeVerify: function (value) {
            if (value == '') {
                return '请输入车型代码';
            }else{
                var arr = value.split(',');
                var val = getCompVerify(arr,modelCodeData)
                if(!val){
                    return '车型代码输入有误'
                }
            }
        },
        driveWayCodeVerify: function (value) {
            if (value == '') {
                return '请输入驱动形式代码';
            }else{
                var arr = value.split(',');
                var val = getCompVerify(arr,driveWayCodeData)
                if(!val){
                    return '驱动形式代码输入有误'
                }
            }
        },
        powerCodeVerify: function (value) {
            if (value == '') {
                return '请输入功率代码';
            }else{
                var arr = value.split(',');
                var val = getCompVerify(arr,powerData)
                if(!val){
                    return '功率代码输入有误'
                }
            }
        },
        remarkVerify: function (value) {
            if (value != '' && value.length > 300) {
                return '备注不能超过300个字符'
            }
        }
    });
    function getCompVerify(val,arr){
        var flag = true
        // 验证是否有重复数据
        var hash = {};
        layui.each(val, function (index, item) {
            if(hash[item]) {
                flag = false
                return
            }
            hash[item] = true;
        })

        // 和对照表数据进行对比
        layui.each(val, function (index, item) {
            if(arr.indexOf(item)=='-1'){
                flag = false
                return
            }
        })
        return flag
    }

    // 监听取消
    $('#addCancel').click(function () {
        //关闭当前frame
        xadmin.close();
        return false;
    });
});

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
