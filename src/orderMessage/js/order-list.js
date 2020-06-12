var verifyFilter = false;
//过滤器数据
var orderStatusData = [
    {key: 1, value: "待调度"},
    {key: 2, value: "待发车"},
    {key: 3, value: "运输中"},
    {key: 44, value: "已收车未扫码"},
    {key: 4, value: "已收车"},
    {key: 5, value: "已完结"},
    {key: 6, value: "已取消"},
]
var orderTypeData = [
    {key: 1, value: "单车单"},
    {key: 2, value: "背车单"},
]
var operationData = [
    {key: 1, value: "待审核"},
]
var feeData = [
    {key: 1, value: "待支付"},
    {key: 2, value: "支付中"},
    {key: 3, value: "支付成功"}
]
var picData = [
    {key: 1, value: "未上传"},
    {key: 2, value: "已上传"},
]
var tailPayStatusData = [
    {key: 1, value: "待支付"},
    {key: 2, value: "支付中"},
    {key: 3, value: "支付成功"},
    {key: 4, value: "支付失败"},
    {key: 5, value: "未到期"},
]
var masterFlagData = [
    {key: "否", value: "上车"},
    {key: "是", value: "下车"},
]
var dispatchModeData = [
    {key: 1, value: "人工调度"},
    {key: 2, value: "抢单"},
    {key: 3, value: "抢单转人工"},
    {key: 4, value: "抢单变人工"},
    {key: 5, value: "短驳直发"},
]
var jingxiaoshangData = [
    {key: "未收迟到", value: "未收迟到"},
    {key: "未签收", value: "未签收"},
    {key: "签收迟到", value: "签收迟到"},
    {key: "正常", value: "正常"},
]
var hegezhengData = [
    {key: "未收迟到", value: "未收迟到"},
    {key: "未签收", value: "未签收"},
    {key: "签收迟到", value: "签收迟到"},
    {key: "正常", value: "正常"},
]
var exportLoading = false;

function DataNull(data) {
    if (data == null || data == "") {
        return "- -";
    } else {
        return data;
    }
}

var provinceList = [];
var loadLayer = null;
var paying = false;
var reloadOption = null;
layui.config({
    base: '../../lib/'
}).extend({
    excel: 'layui_exts/excel.min',
    tableFilter: 'TableFilter/tableFiltercopy',
}).use(['form', 'jquery','layer', 'upload', 'table','laytpl', 'excel', 'tableFilter'], function () {
    var tableName = "orderMessage-order-list";
    var mainTable;
    var table = layui.table;
    var $ = layui.jquery;
    var form = layui.form;
    window.form = form;
    var layer = layui.layer;
    var upload = layui.upload;
    var laytpl = layui.laytpl;
    var excel = layui.excel;
    var edipao = layui.edipao;
    var tableFilter = layui.tableFilter;
    var user = JSON.parse(sessionStorage.user);
    var orderDTOList = [];
    var orderData = {};
    var uploadTruckId = "";
    var dataPermission = edipao.getDataPermission();
    window.dataPermission = dataPermission;
    var permissionList = edipao.getMyPermission();
    window.permissionList = permissionList;
    var loadLayer = layer.load(1);
    var exportHead = {};
    var where = {
        loginStaffId: user.staffId,
    };
    var uploadObj = {
        returnImagesList: ['','','']
    }
    var returnImagesHolder = [
        "/images/jiaojie.jpg",
        "/images/jiaojie.jpg",
        "/images/half-body.jpg",
    ];
    var filters = [
        { field: 'orderNo', type: 'input' },
        { field: 'warehouseNo', type: 'input' },
        { field: 'vinCode', type: 'input' },
        { field: 'tempLicense', type: 'input' },
        { field: 'orderStatus', type: 'checkbox', data: orderStatusData },
        { field: 'orderType', type: 'checkbox', data:orderTypeData },
        // { field: "masterFlag", type: "checkbox", data: masterFlagData},
        { field: 'customerFullName', type: 'input' },
        { field: 'startWarehouse', type: 'input' },
        { field: 'startPark', type: 'input' },
        { field: 'startProvince', type: 'province' },
        { field: 'startCity', type: 'provincecity' },
        { field: 'startAddress', type: 'input' },
        { field: 'endPark', type: 'input' },
        { field: "endProvince", type: "province" },
        { field: 'endCity', type: 'provincecity' },
        { field: 'endAddress', type: 'input' },
        { field: 'transportAssignTime', type: 'timeslot' },
        { field: 'dispatchTime', type: 'timeslot' },
        { field: 'openOperator', type: 'contract' },
        { field: 'deliveryOperator', type: 'contract' },
        { field: 'dispatchOperator', type: 'contract' },
        { field: 'dispatchMode', type: 'checkbox', data: dispatchModeData },
        { field: 'driverName', type: 'input' },
        { field: 'driverPhone', type: 'input' },
        { field: 'driverIdCard', type: 'input' },
        { field: 'customerMileage', type: 'numberslot' },
        { field: 'pricePerMeliage', type: 'numberslot' },
        { field: 'income', type: 'numberslot' },
        { field: 'driverMileage', type: 'numberslot' },
        { field: 'prePayTime', type: 'timeslot' },
        { field: 'arrivePayTime', type: 'timeslot' },
        { field: 'tailPayTime', type: 'timeslot' },
        { field: 'prePayAmount', type: 'checkbox-numberslot', data: feeData },
        { field: 'arrivePayAmount', type: 'checkbox-numberslot', data: feeData },
        { field: 'tailPayAmount', type: 'checkbox-numberslot', data: feeData },
        { field: 'tailPayStatus', type: 'checkbox', data: tailPayStatusData },
        { field: 'feeName', type: 'input' },
        { field: 'carModel', type: 'input' },
        { field: 'fetchTruckTime', type: 'timeslot' },
        { field: 'startTruckTime', type: 'timeslot' },
        { field: 'returnAuditStatus', type: 'checkbox', data: picData },
        { field: 'dealerSignTime', type: 'timeslot' },
        { field: 'dealerEval', type: 'input' },
        { field: 'certificateSignTime', type: 'timeslot' },
        { field: 'dealerRemark', type: 'input' },
        // { field: 'operation', type: 'radio', data: operationData },
    ]
    initPermission();
    function initPermission() {
        if(permissionList.indexOf('订单录入') < 0){
            $("#import_order").remove();
        }
        if(permissionList.indexOf('导出') < 0){
            $("#export_data").remove();
        }
    }
    // 自定义验证规则
    form.verify({
        provinceVerify: function(value) {
            if(value==''||value=='请选择省份'){
                return '请选择省份';
            }
        },
        cityVerify: function(value) {
            if(value==''||value=='请选择市级'){
                return '请选择市级';
            }
        }
    });
    // 获取城市数据
    edipao.request({
        url: '/admin/city/all',
    }).done(res=>{
        if(res.code == 0){
            var data = res.data;
            if(data){
                provinceList = toTree(data);
            }
        }else{
            layer.msg(res.message)
        }
    })
    function toTree(data) {
        var val = [
            {
                name: '请选择省份',
                code:'',
                cityList: [
                    { name: '请选择市级', areaList: [],code:'', },
                ]
            }
        ];
        var level2 = [];
        layui.each(data,function (index,item) {
            if(item.level == 1){
                var cityList = []
                if(item.province.indexOf('北京')=='-1'&&item.province.indexOf('天津')=='-1'&&item.province.indexOf('上海')=='-1'&&item.province.indexOf('重庆')=='-1'){
                    cityList = [{ name: '全部', areaList: []}]
                }
                val.push({
                    name: item.province,
                    code:item.code,
                    cityList:cityList
                })
            }else{
                level2.push(item)
            }
        });

        layui.each(val,function (k,v) {
            layui.each(level2,function (m,n) {
                if(v.name==n.province){
                    val[k]['cityList'].push({
                        name: n.city,
                        code:n.code,
                        areaList:[]
                    });
                }
            })
        });
        return val;
    }
    tableFilterIns = tableFilter.render({
        'elem' : '#orderList',//table的选择器
        'mode' : 'self',//过滤模式
        'filters' : filters,//过滤项配置
        'done': function(filters, reload){
            filters = $.extend({},filters);
            var index = 0;
            where = {
                loginStaffId: edipao.getLoginStaffId()
            };
            if(filters.openOperator){
                filters.openOperatorPhone =  filters.openOperator[1];
                filters.openOperator =  filters.openOperator[0];
            }
            if(filters.deliveryOperator){
                filters.deliveryOperatorPhone =  filters.deliveryOperator[1];
                filters.deliveryOperator =  filters.deliveryOperator[0];
            }
            if(filters.dispatchOperator){
                filters.dispatchOperatorPhone =  filters.dispatchOperator[1];
                filters.dispatchOperator =  filters.dispatchOperator[0];
            }
            if(!filters.operation) {
                verifyFilter = false;
            }else{
                // verifyFilter = true;
                // where["pageSize"] = 60;
            }
            delete filters.operation;
            layui.each(filters,function(key, value){
                if(key=='startProvince'||key=='endProvince'){
                    where['searchFieldDTOList['+ index +'].fieldName'] = key;
                    where['searchFieldDTOList['+ index +'].fieldValue'] = value[key];
                }else if(key == "customerMileage" || key == "pricePerMeliage" || key == "income" || key == "driverMileage"){
                    where["searchFieldDTOList[" + index + "].fieldName"] = key;
                    where['searchFieldDTOList[' + index + '].fieldMinValue'] = value[0];
                    where['searchFieldDTOList[' + index + '].fieldMaxValue'] = value[1];
                }else if(key=='startCity'||key=='endCity'){ 
                    if(value.city == "全部") value.city = "";
                    if(key == "startCity"){
                        where['searchFieldDTOList['+ index +'].fieldName'] = "startProvince";
                        where['searchFieldDTOList['+ index++ +'].fieldValue'] = value.province;
                        where['searchFieldDTOList['+ index +'].fieldName'] = "startCity";
                        where['searchFieldDTOList['+ index +'].fieldValue'] = value.city;
                    }else if(key=='endCity'){
                        where['searchFieldDTOList['+ index +'].fieldName'] = "endProvince";
                        where['searchFieldDTOList['+ index++ +'].fieldValue'] = value.province;
                        where['searchFieldDTOList['+ index +'].fieldName'] = "endCity";
                        where['searchFieldDTOList['+ index +'].fieldValue'] = value.city;
                    }
                }else if(key == 'prePayAmount'||key == 'arrivePayAmount'||key == "tailPayAmount"){
                    if(value.slot.length > 0){
                        where['searchFieldDTOList['+ index +'].fieldName'] = key;
                        where['searchFieldDTOList['+ index +'].fieldMinValue'] = value.slot[0];
                        where['searchFieldDTOList['+ index +'].fieldMaxValue'] = value.slot[1];
                        if(value.checked.length > 0) index++;
                    }
                    if(value.checked.length > 0){
                        where['searchFieldDTOList['+ index +'].fieldName'] = key.replace("Amount", "Status");
                        where['searchFieldDTOList['+ index +'].fieldListValue'] = value.checked.join(',');
                    }
                }else if(key == "orderStatus"){
                    var checkSign, checkFetch;
                    checkFetch = value.indexOf("4") > -1;
                    checkSign = value.indexOf("44") > -1;
                    value = value.filter(function (item) {
                        return item != "44";
                    });
                    value = value || [];
                    if((checkSign && checkFetch) || (!checkSign && !checkFetch)){
                        where['searchFieldDTOList['+ index +'].fieldName'] = key;
                        where['searchFieldDTOList['+ index +'].fieldListValue'] = value.join(',');
                    }else if(checkSign && !checkFetch){
                        value.push("4");
                        where['searchFieldDTOList['+ index +'].fieldName'] = key;
                        where['searchFieldDTOList['+ index++ +'].fieldListValue'] = value.join(',');
                        where['searchFieldDTOList['+ index +'].fieldName'] = "dealerSignTime";
                        where['searchFieldDTOList['+ index +'].fieldMinValue'] = "0";
                        where['searchFieldDTOList['+ index +'].fieldMaxValue'] = "1";
                    }else if(!checkSign && checkFetch){
                        where['searchFieldDTOList['+ index +'].fieldName'] = key;
                        where['searchFieldDTOList['+ index++ +'].fieldListValue'] = value.join(',');
                        where['searchFieldDTOList['+ index +'].fieldName'] = "dealerSignTime";
                        where['searchFieldDTOList['+ index +'].fieldMinValue'] = "1980-01-01 00:00:00";
                        where['searchFieldDTOList['+ index +'].fieldMaxValue'] = "2999-01-01 00:00:00";
                    }
                }else if(key == "dealerSignTime" || key == "certificateSignTime" || key=="arrivePayTime"||key=="prePayTime"||key=="tailPayTime"||key=="transportAssignTime"||key=="fetchTruckTime"||key=="dispatchTime" || key == "startTruckTime"){
                    where['searchFieldDTOList['+ index +'].fieldName'] = key;
                    value = value.split(" 至 ");
                    where['searchFieldDTOList['+ index +'].fieldMinValue'] = value[0];
                    where['searchFieldDTOList['+ index +'].fieldMaxValue'] = value[1];
                }else if(key == "orderType" || key == "tailPayStatus" || key == "masterFlag"){
                    where['searchFieldDTOList['+ index +'].fieldName'] = key;
                    where['searchFieldDTOList['+ index +'].fieldListValue'] = value.join(',');
                }else if(key == "returnAuditStatus" || key == "dispatchMode"){
                    where['searchFieldDTOList['+ index +'].fieldName'] = key;
                    where['searchFieldDTOList['+ index +'].fieldListValue'] = value.join(',');
                }else if(key == "carModel"){
                    where['searchFieldDTOList['+ index +'].fieldName'] = "feeItemJson";
                    where['searchFieldDTOList['+ index +'].fieldValue'] = value;
                }else{
                    where['searchFieldDTOList['+ index +'].fieldName'] = key;
                    where['searchFieldDTOList['+ index +'].fieldValue'] = value;
                }
                index++;
            });
            if(reload){
                reloadOption = { where: where, page: { curr: 1 }};
            }else{
                mainTable.reload( { where: where, page: { curr: 1 }});
            }
        }
    });

    var method = {
        getOrder: function (orderId) {
            return edipao.request({
                method: "GET",
                url: "/admin/order/detail",
                data: {
                    loginStaffId: user.staffId,
                    id: orderId  //ORDERNO
                }
            });
        },
        getDriver: function (driverId) {
            return edipao.request({
                method: "GET",
                url: "/admin/driver/info/getDriver",
                data: {
                    loginStaffId: user.staffId,
                    driverId: driverId
                }
            });
        },
        bindUpload: function () {
            $(".list_picture_upload").unbind().on("click", function(e){
                var elem;
                var type = e.target.dataset.type * 1;
                var orderId = e.target.dataset.orderid;
                var event = "ok";
                type == 2 && permissionList.indexOf('提车照片上传') == -1 && (event = 'reject');
                type == 3 && permissionList.indexOf('发车单-上传') == -1 && (event = 'reject');
                type == 5 && permissionList.indexOf('交接单回收-上传') == -1 && (event = 'reject');
                if(event == "reject"){
                    layer.alert('你没有访问权限', {icon: 2});
                    return;
                }
                elem = $("#uploadStartPic").html();
                method.getOrder(orderId).done(function (res) {
                    if(res.code == "0"){
                        var uploadData = {}, sortObj = {}; //包含订单的每个车辆需要上传的三种图片
                        orderData = res.data;
                        if(!res.data.truckDTOList || res.data.truckDTOList.length < 1){
                            layer.msg("订单未包含车辆信息", {icon: 2});
                            return;
                        }
                        uploadTruckId = res.data.truckDTOList[0].id;
                        res.data.truckDTOList.forEach(function (item) {
                            var uploadObjItem = JSON.parse(JSON.stringify(uploadObj)) //每个车辆需要上传
                            if(type == 5){
                                item.returnImages = item.returnImages || "";
                                item.returnImages.split(",").forEach(function (item2, index) { //将上传过的显示出来
                                    uploadObjItem.returnImagesList[index] = item2;
                                });
                            }
                            uploadObjItem.masterFlag = item.masterFlag == "是";
                            uploadData[item.id + ""] = uploadObjItem;
                        });
                        Object.keys(uploadData).sort(function (id1, id2) {
                            if(uploadData[id1].masterFlag) return -1;
                            return 1;
                        }).forEach(function (id) {
                            sortObj[id] = uploadData[id];
                        });
                        uploadData = sortObj;
                        laytpl(elem).render({
                            list: res.data.truckDTOList,
                            type: type
                        }, function (html) {
                            method.openUpload(html, type, orderId, uploadData);
                        });
                    }else{
                        layer.msg(res.message, {icon: 5,anim: 6});
                    }
                })
                    
            });
        },
        openUpload: function (html, type, orderId, uploadData) {
            var renderObj = [
                {
                    num: uploadObj.returnImagesList,
                    holder: "#upload_give_holder_",
                    pre: "#upload_give_pre_",
                    type: 5,
                    type2: 7,
                    key: "returnImagesList"
                },
            ]
            var index = layer.open({
                type: 1, 
                content: html, //这里content是一个普通的String,
                area: ["600px", "400px"],
                title: "上传",
                btn: ["确定", "取消"],
                yes: function () {
                    loadLayer = layer.load(2);
                    method.uploadPics({id: orderId, uploadData: uploadData}, function (res) {
                        layer.close(loadLayer);
                        if(res.code == "0"){
                            layer.msg("上传成功", {icon: 1});
                            mainTable.reload( { where: where, page: { curr: 1 }});
                            layer.close(index);
                        }
                    });
                },
                success: function () {
                    var holders = {
                        returnImagesHolder: returnImagesHolder
                    }
                    form.render("select");
                    //多图片上传
                    form.on("select", function (data) {
                        if(data.elem.name == "vinCode"){
                            uploadTruckId = data.value;
                            render();
                        }
                    });
                    render();
                    function render() {
                        laytpl($("#upload_pic_list_tpl").html()).render({
                            uploadData: uploadData[uploadTruckId + ""], 
                            type: type, 
                            holders: holders,
                        }, function (html) {
                            $("#upload_pic_select_car").html(html);
                            $(".pic_del_btn").unbind().on("click", function (e) {
                                e.stopPropagation();
                                uploadData[uploadTruckId][e.target.dataset.field][e.target.dataset.index * 1] = "";
                                $(e.target).parent().removeClass("pre").find(".pre_image_holder_inner").remove();
                            });
                            var uploadLoadIndex = null;
                            renderObj.forEach(function (item) {
                                item.num.forEach(function (item2, index) {
                                    upload.render({
                                        elem: item.holder + index + "" //绑定元素
                                        ,size: 1024*5
                                        ,accept: 'images' //只允许上传图片
                                        ,acceptMime: 'image/*' //只筛选图片
                                        ,multiple: true
                                        ,url: layui.edipao.API_HOST+'/admin/truck/upload/image' //上传接口
                                        ,data: {
                                            loginStaffId: user.staffId,
                                            type: index == 2 ? item.type2 : item.type,
                                            truckId: uploadTruckId,
                                            index: index + 1,
                                        }
                                        ,before: function () {
                                            uploadLoadIndex = layer.load(1);
                                        }
                                        ,done: function(res){
                                            layer.close(uploadLoadIndex);
                                            if(res.code == "0"){
                                                console.log(res.data)
                                                uploadData[uploadTruckId+""][item.key][index*1] = res.data;
                                                var $holder = $(item.holder + index + "");
                                                $holder.find(".pre_image_holder_inner").remove();
                                                $holder.addClass("pre").append('<div class="pre_image_holder_inner"><img src="'+ res.data + "?" + new Date().getTime() +'" class="layui-upload-img pre_img"></div>')
                                                zoomImg();
                                            }else{
                                                layer.msg(res.message, {icon: 5,anim: 6});
                                            }
                                        }
                                        ,error: function () {
                                            layer.close(uploadLoadIndex);
                                        }
                                    });
                                });
                            });
                            zoomImg();
                        });
                    }
                }
            });
        },
        uploadPics: function (options, cb) {
            var loadLayer = layer.load(1);
            var uploadData = JSON.parse(JSON.stringify(options.uploadData));
            var keys = Object.keys(uploadData),
              successFlag = true,
              emptyFlag = true,
              halfBodyEmptyFlag = true,
              promiseList = [];
            keys.forEach(function (id) {
                if(uploadData[id].masterFlag && uploadData[id]["returnImagesList"][2]){
                    halfBodyEmptyFlag = false;
                }
                uploadData[id]["returnImagesList"].forEach(function (img) {
                    emptyFlag = !img;
                });
            });
            if(halfBodyEmptyFlag){
                layer.close(loadLayer);
                layer.msg("请上传下车的半身照",{icon: 2});
                return;
            }
            if(emptyFlag){
                layer.close(loadLayer);
                layer.msg("请先上传图片",{icon: 2});
                return;
            }
            keys.forEach(function (id) {
                var uploadObj = JSON.parse(JSON.stringify(uploadData[id + '']));
                var getReq = function (data) {
                    return edipao.request({
                        url: "/admin/truck/submit/image",
                        method: "post",
                        data: data
                    });
                }
                uploadObj = notNull(uploadObj);
                if(uploadObj["returnImagesList"] && uploadObj["returnImagesList"].length > 0){
                    var data = {
                        loginStaffId: user.staffId,
                        truckId: id,
                        type: 5,
                        images: uploadObj["returnImagesList"].join(","),
                    }
                    promiseList.push(getReq(data));
                }
            });
            $.when.apply($, promiseList).done(function (res1, res2) {
                if(promiseList.length > 0){
                    console.log(res1)
                    if(res1 && res1.code != 0){
                        layer.close(loadLayer);
                        successFlag = false;
                        layer.msg(res1.message);
                        return;
                    }
                }
                if(promiseList.length > 1){
                    if(res2 && res2.code != 0){
                        layer.close(loadLayer);
                        successFlag = false;
                        layer.msg(res2.message);
                        return;
                    }
                }
                if(successFlag){
                    layer.close(loadLayer);
                    cb({code:0});
                }
            });
            function notNull(obj) {
                Object.keys(obj).forEach(function (key) {
                    if(obj[key].filter){
                        obj[key] = obj[key].filter(function (item, index) {
                            return !!item;
                        });
                    }
                });
                return obj;
            }
        },
        bindVerify: function(){
            $(".list_arrive_verify").unbind().on("click", function(e){
                var field = e.target.dataset.field;
                var orderId = e.target.dataset.orderid;
                var type = e.target.dataset.type*1;
                var title = "审核预付款";
                if(field == "arrivePayAmount"){
                    title = "审核到付款";
                }else if(field == "tailPayAmount"){
                    title = "审核尾款";
                }
                table.render({
                    elem: '#pre_fee_verify_table'
                    , method: "get" // 请求方式  默认get
                    , page: false //开启分页
                    , url: layui.edipao.API_HOST + "/admin/order/detail"
                    // , url: "js/order.json"
                    , where: { loginStaffId: user.staffId, id: orderId } //ORDERNO
                    , id: "pre_fee_verify_table"
                    , parseData: function (res) {
                        var feeData = [];
                        if(res.code == "0"){
                            feeData.push({
                                key: "现金",
                                val: res.data[field],
                                unit: "元",
                            });
                            if(field == "prePayAmount"){
                                feeData.push({
                                    key: "油",
                                    val: res.data.prePayOil,
                                    unit: "升",
                                });
                            }
                        }
                        return {
                            "code": res.code, //解析接口状态
                            "msg": res.message, //解析提示文本
                            "data": feeData //解析数据列表
                        }
                    }
                    , done: function () {//表格渲染完成的回调
                        var $table = $(".layui-table-view[lay-id=pre_fee_verify_table]");
                        $table.find(".layui-table-body.layui-table-main").css("overflow", "hidden");
                        var tableStr = $table.prop("outerHTML");
                        var htmlStr = $("#arrive_fee_verify_tpl").html();
                        var index = layer.open({
                            title: title,
                            type: 1,
                            area: "400px",
                            content: htmlStr.replace("TABLE", tableStr),
                            btn: ["确定", "取消"],
                            success: function () {
                                form.render();
                            },
                            yes: function () {
                                if(paying) return;
                                paying = true;
                                var loadIndex = layer.load(1);
                                var data = form.val("arrive_fee_verify_form");
                                edipao.request({
                                    url: "/admin/order/approval/pay",
                                    method: "post",
                                    data: {
                                        loginStaffId: user.staffId,
                                        orderId: orderId,
                                        type: type,
                                        approvalResult: data.result * 1,
                                        approvalRemark: data.remark
                                    }
                                }).done(function (res) {
                                    setTimeout(function () { paying = false; }, 1500);
                                    layer.close(loadIndex);
                                    if(res.code == "0"){
                                        layer.msg("提交成功", {icon: 1});
                                        mainTable.reload( { where: where, page: { curr: 1 }});
                                        layer.close(index);
                                    }else{
                                        //layer.alert(res.message);
                                    }
                                }).fail(function () {
                                    layer.close(loadIndex);
                                    setTimeout(function () { paying = false; }, 1500);
                                });
                            }
                        });
                    },
                    text: {none: "暂无数据"},
                    cols: [[
                        {field: 'key', title: '费用项', sort: false,width: "190"},
                        {field: 'val', title: '金额', sort: false,width: "190", templet: function (d) {
                            if(dataPermission.canViewOrderCost != "Y"){
                                return "****";
                            }
                            return d.val + " (" + d.unit + ")"
                        }},
                    ]]
                });
            });
        },
        bindPrePay: function () {
            $(".list_arrive_prepay").unbind().on("click", function (e) {
                var field = e.target.dataset.field;
                var orderId = e.target.dataset.orderid;
                var type = e.target.dataset.type*1;
                var title = "确定申请支付预付款？";
                if(field == "arrivePayAmount"){
                    title = "确定申请支付到付款？";
                }else if(field == "tailPayAmount"){
                    title = "确定申请支付尾款？";
                }
                table.render({
                    elem: '#pre_fee_verify_table'
                    , method: "get" // 请求方式  默认get
                    , page: false //开启分页
                    , url: layui.edipao.API_HOST + "/admin/order/detail"
                    // , url: "js/order.json"
                    , where: { loginStaffId: user.staffId, id: orderId } //ORDERNO
                    , id: "pre_fee_verify_table"
                    , parseData: function (res) {
                        var feeData = [];
                        if(res.code == "0"){
                            feeData.push({
                                key: "现金",
                                val: res.data[field],
                                unit: "元",
                            });
                            if(field == "prePayAmount"){
                                feeData.push({
                                    key: "油",
                                    val: res.data.prePayOil,
                                    unit: "升",
                                });
                            }
                        }
                        return {
                            "code": res.code, //解析接口状态
                            "msg": res.message, //解析提示文本
                            "data": feeData //解析数据列表
                        }
                    }
                    , done: function () { //表格渲染完成的回调
                        var $table = $(".layui-table-view[lay-id=pre_fee_verify_table]");
                        $table.find(".layui-table-body.layui-table-main").css("overflow", "hidden");
                        var tableStr = $table.prop("outerHTML");
                        var htmlStr = $("#pre_fee_verify_tpl").html();
                        var index = layer.open({
                            title: title,
                            type: 1,
                            area: "400px",
                            content: htmlStr.replace("TABLE", tableStr),
                            btn: ["确定", "取消"],
                            success: function () {
                                form.render();
                            },
                            yes: function () {
                                if(paying) return;
                                paying = true;
                                var loadIndex = layer.load(1);
                                edipao.request({
                                    url: "/admin/order/approval/pay",
                                    data: {
                                        loginStaffId: user.staffId,
                                        orderId: orderId,
                                        type: type,
                                        approvalResult: 0
                                    }
                                }).done(function (res) {
                                    setTimeout(function () { paying = false; }, 1500);
                                    layer.close(loadIndex);
                                    if(res.code == "0"){
                                        layer.msg("提交成功", {icon: 1});
                                        mainTable.reload( { where: where, page: { curr: 1 }});
                                        layer.close(index);
                                    }else{
                                        //layer.alert(res.message);
                                    }
                                }).fail(function(){
                                    setTimeout(function () { paying = false; }, 1500);
                                    layer.close(loadIndex);
                                });
                            }
                        });
                    },
                    text: {none: "暂无数据"},
                    cols: [[
                        {field: 'key', title: '费用项', sort: false,width: "190"},
                        {field: 'val', title: '金额', sort: false,width: "190", templet: function (d) { 
                            if(dataPermission.canViewOrderCost != "Y"){
                                return "****";
                            }
                            return d.val + ' (' + d.unit + ')'
                        }},
                    ]]
                });
            });
        },
        bindPay: function () {
            $(".list_arrive_pay").unbind().on("click", function (e) {
                var field = e.target.dataset.field;
                var orderId = e.target.dataset.orderid;
                var type = e.target.dataset.type * 1;
                var key = "prePayFeeItems";
                var title = "确定支付预付款？";
                if(field == "arrivePayAmount"){
                    key = "arrivePayFeeItems";
                    title = "确定支付到付款？";
                }else if(field == "tailPayAmount"){
                    key = "tailPayFeeItems";
                    title = "确定支付尾款？";
                }
                table.render({
                    elem: '#pre_fee_verify_table'
                    , method: "get" // 请求方式  默认get
                    , url: layui.edipao.API_HOST + "/admin/order/detail"
                    // , url: "js/order.json"
                    , page: false

                    , where: { loginStaffId: user.staffId, id: orderId } //ORDERNO
                    , id: "pre_fee_verify_table"
                    , parseData: function (res) {
                        var feeData = [];
                        if(res.code ==  "0"){
                            feeData.push({
                                key: "现金",
                                val: res.data[field],
                                unit: "元",
                            });
                            if(field == "prePayAmount"){
                                feeData.push({
                                    key: "油",
                                    val: res.data.prePayOil,
                                    unit: "升",
                                });
                            }
                        }
                        return {
                            "code": res.code, //解析接口状态
                            "msg": res.message, //解析提示文本
                            "data": feeData //解析数据列表
                        }
                    }
                    , done: function () { //表格渲染完成的回调
                        var $table = $(".layui-table-view[lay-id=pre_fee_verify_table]");
                        $table.find(".layui-table-body.layui-table-main").css("overflow", "hidden");
                        var tableStr = $table.prop("outerHTML");
                        var htmlStr = $("#pre_fee_verify_tpl").html();
                        var index = layer.open({
                            title: title,
                            type: 1,
                            area: "400px",
                            content: htmlStr.replace("TABLE", tableStr),
                            btn: ["确定", "取消"],
                            success: function () {
                                form.render();
                            },
                            yes: function () {
                                if(paying) return;
                                paying = true;
                                var loadIndex = layer.load(1);
                                edipao.request({
                                    url: "/admin/order/approval/pay",
                                    data: {
                                        loginStaffId: user.staffId,
                                        orderId: orderId,
                                        type: type,
                                        approvalResult: 0
                                    }
                                }).done(function (res) {
                                    setTimeout(function () { paying = false; }, 1500);
                                    layer.close(loadIndex);
                                    if(res.code == "0"){
                                        layer.msg("提交成功", {icon: 1});
                                        mainTable.reload( { where: where, page: { curr: 1 }});
                                        layer.close(index);
                                    }else{
                                        //layer.alert(res.message);
                                    }
                                }).fail(function () {
                                    setTimeout(function () { paying = false; }, 1500);
                                    layer.close(loadIndex);
                                });
                            }
                        });
                    },
                    text: {none: "暂无数据"},
                    cols: [[
                        {field: 'key', title: '费用项', sort: false,width: "190"},
                        {field: 'val', title: '金额', sort: false,width: "190", templet: function (d) {
                            if(dataPermission.canViewOrderCost != "Y"){
                                return "*";
                            }
                            return d.val + ' (' + d.unit + ')'
                        }},
                    ]]
                });
            });
        },
        bindPicVerify:function(){
            var _this = this;
            $(".list_picture_verify").unbind().on("click", function (e) {
                var orderId = e.target.dataset.orderid;
                var driverId = e.target.dataset.driverid;
                var key = e.target.dataset.key || "returnImages";
                var type = e.target.dataset.type * 1;
                var driverBodyImg = "", idLicenceFrontImg = "";
                $.when(method.getOrder(orderId), method.getDriver(driverId)).done(function (res, res2) {
                    res = res[0];
                    res2 = res2[0];
                    if(res2.code == 0){
                        idLicenceFrontImg = res2.data.idLicenceFrontImg;
                    }
                    if(res.code == "0"){
                        res.data.truckDTOList.forEach(function (item) {
                            if(!item[key]){
                                item[key] = [];
                            }else{
                                item[key] = item[key].split(",");
                            }
                            if(key == "returnImages"){
                                item.returnImages = item.returnImages.filter(function(img){
                                    if(img.indexOf("driver_body") > -1){
                                        driverBodyImg = img;
                                        return false;
                                    }else{
                                        return true;
                                    }
                                });
                            }
                        });
                        laytpl($("#pic_verify_tpl").html()).render({
                            list: res.data.truckDTOList, 
                            key: key, 
                            driverBodyImg: driverBodyImg,
                            idLicenceFrontImg: idLicenceFrontImg,
                            action: "verify"
                        }, function (html) {
                            var index = layer.open({
                                type: 1,
                                content: html,
                                title: "审核",
                                area: ["600px", "400px"],
                                btn: ["确定", "取消"],
                                success: function () {
                                    zoomImg();
                                    form.render("radio");
                                },
                                yes: function () {
                                    var loadIndex = layer.load(1);
                                    var data = form.val("verifyPic");
                                    edipao.request({
                                        url: "/admin/order/approval/image",
                                        method: "post",
                                        data: {
                                            loginStaffId: user.staffId,
                                            type: type,
                                            orderId: orderId,
                                            approvalResult: data.result * 1,
                                            approvalRemark: data.remark
                                        }
                                    }).done(function(res){
                                        layer.close(loadIndex);
                                        if(res.code == "0"){
                                            layer.close(index);
                                            layer.msg("提交成功");
                                            mainTable.reload( { where: where, page: { curr: 1 }});
                                        }else{
                                            //layer.alert(res.message);
                                        }
                                    }).fail(function () {
                                        layer.close(loadIndex);
                                    });
                                }
                            })
                        });
                    }else{
                        layer.msg(res.message, {icon: 5,anim: 6});
                    }
                });
            });
        },
        bindViewPic: function () {
            $(".list_picture_view").unbind().on("click", function (e) {
                var orderId = e.target.dataset.orderid;
                var driverBodyImg = "";
                method.getOrder(orderId).done(function (res) {
                    if(res.code == "0"){
                        res.data.truckDTOList.forEach(function (item) {
                            if(!item.returnImages){
                                item.returnImages = [];
                            }else{
                                item.returnImages = item.returnImages.split(",");
                            }
                            item.returnImages = item.returnImages.filter(function(img){
                                if(img.indexOf("driver_body") > -1){
                                    driverBodyImg = img;
                                    return false;
                                }else{
                                    return true;
                                }
                            });
                        });
                        laytpl($("#pic_verify_tpl").html()).render({
                            list: res.data.truckDTOList,
                            key: "returnImages",
                            driverBodyImg: driverBodyImg,
                            action: "view"
                        }, function (html) {
                            layer.open({
                                type: 1,
                                title: "查看",
                                content: html,
                                area: ["600px", "400px"],
                                success: function () {
                                    zoomImg();
                                }
                            });
                        });
                    }else{
                       // layer.alert(res.message);
                    }
                });
            });
        },
        bindEvents: function(){
            if(location.href.indexOf("test.edipao.cn") > -1){
                $("#test_title_btn").unbind().on("click", function () {
                    top.xadmin.add_tab("车损/报备", "orderMessage/vehicleDamage/list.html");
                });
            }
            // $(window).unbind().on("message", function (e) {
            //     console.log(e)
            //     var origin = e.origin || e.originalEvent.origin;  //域
            //     var source = e.source || e.originalEvent.source;  //信息来源的window
            //     var data = e.data || e.originalEvent.data;
            //     if((origin + "").indexOf(window.location.host) > -1){
                    
            //     }
            // });
            $(".top_tool_bar").unbind().on("click", function (e) {
                var event = e.target.dataset.event;
                event == 'import_order' && permissionList.indexOf('订单录入') == -1 && (event = 'reject');
                event == 'export_data' && permissionList.indexOf('导出') == -1 && (event = 'reject');
                event == 'merge_order' && permissionList.indexOf('合并') == -1 && (event = 'reject');
                switch(event){
                    case "reject":
                        layer.alert('你没有访问权限', {icon: 2});
                        break;
                    case "import_order":
                        xadmin.open('订单录入','./order-import.html',1100,500);
                        break;
                    case "export_data":
                        method.exportData();
                        break;
                    case "table_set":
                        xadmin.open('表格设置', './table-set.html?tableKey=orderMessage-order-list', 600, 400);
                        break;
                    case "reset_search":
                        edipao.resetSearch("orderList", function(){
                            location.reload();
                        });
                        break;
                    case "exportLog":
                        xadmin.open('导出日志', '../../OperateLog/log.html?type=4&action=exportLog');
                        break;
                }
            });
            $(".list_driver_name").unbind().on("click", function (e) {
                var id = e.target.dataset.id;
                xadmin.open('司机信息','../DriverManager/DriverArchives/info.html?id=' + id);
            });
        },
        getExportData: function (cb) {
            var _this = this;
            var checkStatus = table.checkStatus('orderList');
            if(checkStatus.data.length < 1){
                if(exportLoading) return layer.msg("数据正在下载，暂不能操作。");
                layer.msg("正在下载数据，请勿退出系统或者关闭浏览器");
                exportLoading = true;
                var param = where;
                param['pageNo']= 1;
                param['pageSize'] = 99999;
                edipao.request({
                    type: 'GET',
                    url: '/admin/order/list',
                    data: param,
                    timeout: 100000,
                }).done(function (res) {
                    exportLoading = false;
                    res.data = res.data || {};
                    res.data.orderDTOList = res.data.orderDTOList || [];
                    cb(res.data.orderDTOList);
                }).fail(function () {
                    exportLoading = false;
                });
            }else{
                cb(checkStatus.data);
            }
            
        },
        // getExportData: function (cb) {
        //     var _this = this;
        //     var checkStatus = table.checkStatus('orderList');
        //     if(checkStatus.data.length < 1){
        //         if(exportLoading) return layer.msg("数据正在下载，暂不能操作。");
        //         layer.msg("正在下载数据，请勿退出系统或者关闭浏览器");
        //         exportLoading = true;
        //         edipao.exportData({
        //             params: where,
        //             url: "/admin/order/list",
        //             method: "GET",
        //             pageSize: "pageSize",
        //             limit: 99999,
        //             checkFunction: function(res){
        //                 return !(!res.data || !res.data["orderDTOList"] || res.data["orderDTOList"].length == 0);
        //             }
        //         }).done(function (res) {
        //             var data = [];
        //             exportLoading = false;
        //             if(res.length > 0){
        //                 res.forEach(function (item) {
        //                     data = data.concat(item.orderDTOList);
        //                 });
        //                 cb(data);
        //             }else{
        //                 exportLoading = false;
        //             }
        //         });
        //     }else{
        //         cb(checkStatus.data);
        //     }
            
        // },
        exportData: function exportExcel() {
            var _this = this;
            method.getExportData(function (data) {
                var params = {
                    loginStaffId: user.staffId,
                    operationModule: 4,
                    operationRemark: "导出订单数据",
                }
                edipao.exportLog(params);
                var exportData = [];
                // 添加头部
                exportData.push(exportHead);
                // 过滤处理数据
                layui.each(data, function(index, item){
                    var newObj = {};
                    for(var i in item){
                        var orderType = item.orderType;
                        var masterFlag = item.masterFlag;
                        var prePayOil = item.prePayOil ? item.prePayOil : '';
                        var startApprovalBtn = item.startApprovalBtn;
                        var returnApprovalBtn = item.returnApprovalBtn;
                        var openOperator = item.openOperator ? item.openOperator : '';
                        var openOperatorPhone = item.openOperatorPhone ? item.openOperatorPhone : '';
                        var deliveryOperator = item.deliveryOperator ? item.deliveryOperator : '';
                        var deliveryOperatorPhone = item.deliveryOperatorPhone ? item.deliveryOperatorPhone : '';
                        if(showList.indexOf(i) > -1){
                            var value = item[i];
                            switch(i){
                                case 'orderType':
                                    value = '- -';
                                    orderTypeData.some(function (status) {
                                        if(status.key == item[i]){
                                            value = status.value;
                                            return true;
                                        }
                                    });
                                    break;
                                case 'orderStatus':
                                    value = '- -';
                                    orderStatusData.some(function (status) {
                                        if(status.key == item[i]){
                                            value = status.value;
                                            if(status.key == 4 && !item.dealerSignTime){
                                                value = "收车未扫码";
                                            }
                                            return true;
                                        }
                                    });
                                    break;
                                case 'dispatchOperator':
                                    if(item.dispatchMode == 2){
                                        value = "系统调度";
                                    }else{
                                        value = (deliveryOperator + '' + deliveryOperatorPhone)||'- -';
                                    }
                                    break;
                                case 'openOperator':
                                    value = (openOperator + '' + openOperatorPhone) ||'- -';
                                    break;
                                case 'deliveryOperator':
                                    value = (deliveryOperator + '' + deliveryOperatorPhone) ||'- -';
                                    break;
                                case 'driverName':
                                    value = item[i] || "- -";
                                    break;
                                case 'driverPhone':
                                    value = item[i] || "- -";
                                    break;
                                case 'pricePerMeliage':
                                    value = item[i] + "元/km";
                                    if(dataPermission.canViewOrderCost != "Y"){
                                        value = "****";
                                    }
                                    break;
                                case 'customerMileage':
                                    value = item[i] ? item[i] + "km" : "- -";
                                    break;
                                case 'income':
                                    value = item[i] + "元";
                                    if(dataPermission.canViewOrderCost != "Y"){
                                        value = "****";
                                    }
                                    break;
                                case 'driverMileage':
                                    value = item[i] + "km";
                                    break;
                                case 'prePayTime':
                                case 'arrivePayTime':
                                case 'tailPayTime':
                                    value = DataNull(item[i]);
                                    break;
                                case 'prePayAmount':
                                    var payStatus = "";
                                    if(orderType == 2 && masterFlag == "否"){
                                        value = "";
                                        break;
                                    }
                                    if(dataPermission.canViewOrderCost != "Y"){
                                        value = "****" + payStatus;
                                    }else{
                                        value = item[i] + "元" + "/" + prePayOil + "升" + payStatus;
                                    }
                                    break;
                                case 'arrivePayAmount':
                                    var payStatus = "";
                                    if(orderType == 2 && masterFlag == "否"){
                                        value = "";
                                        break;
                                    }
                                    if(dataPermission.canViewOrderCost != "Y"){
                                        value = "****" + payStatus;
                                    }else{
                                        value = item[i] + "元" + payStatus;
                                    }
                                    break;
                                case 'tailPayAmount':
                                    var payStatus = "";
                                    if(orderType == 2 && masterFlag == "否"){
                                        value = "";
                                        break;
                                    }
                                    if(dataPermission.canViewOrderCost != "Y"){
                                        value = "****" + payStatus;
                                    }else{
                                        value = item[i] + "元" + payStatus;
                                    }
                                    break;
                                case 'tailPayStatus':
                                    value = '- -';
                                    tailPayStatusData.some(function (status) {
                                        if(status.key == item[i]){
                                            value = status.value;
                                            return true;
                                        }
                                    });
                                    if(orderType == 2 && masterFlag == "否"){
                                        value = "";
                                    }
                                    break;
                                case 'startUploadBtn':
                                    switch(item[i]){
                                        case 0:
                                        case 1:
                                            value = '未上传';
                                            break;
                                        case 2:
                                        case 3:
                                            value = '已上传';
                                            break;
                                        case 4:
                                            value = '已驳回';
                                            break;
                                        default:
                                            value = '非法状态';
                                            break;
                                    }
                                    if(startApprovalBtn * 1 == 1){
                                        value = '未审核';
                                    }
                                    if(orderType == 2 && masterFlag == "否"){
                                        value = "";
                                    }
                                    break;
                                case "dispatchMode":
                                    value = "- -";
                                    dispatchModeData.some(function(item2){
                                        if(item2.key == item[i]){
                                            value = item2.value;
                                            return true;
                                        }
                                    });
                                    break;
                                case 'masterFlag':
                                    if (item.orderType == 1) {
                                        value = "单车";
                                    } else {
                                        if(item.masterFlag == "是"){
                                            value =  "下车";
                                        }else{
                                            value =  "上车";
                                        }
                                    }
                                    break;
                                case 'returnAuditStatus':
                                    switch(item[i]){
                                        case 0:
                                        case 1:
                                            value = '未上传';
                                            break;
                                        case 2:
                                        case 3:
                                            value = '已上传';
                                            break;
                                        case 4:
                                            value = '已驳回';
                                            break;
                                        default:
                                            value = '非法状态';
                                            break;
                                    }
                                    if(item.returnApprovalBtn * 1 == 1){
                                        value = '待审核';
                                    }
                                    if(item.orderType == 2 && item.masterFlag == "否"){
                                        value = "";
                                    }
                                    break;
                                case 'returnUploadBtn':
                                    switch(item[i]){
                                        case 0:
                                        case 1:
                                            value = '未上传';
                                            break;
                                        case 2:
                                        case 3:
                                            value = '已上传';
                                            break;
                                        case 4:
                                            value = '已驳回';
                                            break;
                                        default:
                                            value = '非法状态';
                                            break;
                                    }
                                    if(item.returnApprovalBtn * 1 == 1){
                                        value = '待审核';
                                    }
                                    if(item.orderType == 2 && item.masterFlag == "否"){
                                        value = "";
                                    }
                                    break;
                                default:
                                    value = DataNull(item[i]);
                                    break;
                            }
                            newObj[i] = value;
                        }
                    }
                    exportData.push(newObj);
                })
                // 导出
                excel.exportExcel({
                    sheet1: exportData
                }, '订单.xlsx', 'xlsx');
            });
        },
        renderTable: function(){
            mainTable = table.render({
                elem: '#orderList'
                , url: layui.edipao.API_HOST+'/admin/order/list'
                , title: '订单列表'
                , method: "get" // 请求方式  默认get
                , page: true //开启分页
                , limit: 10  //每页显示条数
                , limits: [10, 20, 50, 100] //每页显示条数可选择
                , request: {
                    pageName: 'pageNo' //页码的参数名称，默认：page
                    , limitName: 'pageSize' //每页数据量的参数名，默认：limit
                }
                , where: { loginStaffId: user.staffId }
                , height: 'full'
                , autoSort: true
                , id: 'orderList'
                , parseData: function (res) {
                    var data = [];
                    orderDTOList = res.data.orderDTOList;
                    orderDTOList.forEach(function(item){
                        if(item.orderType == 2 && item.masterFlag == "否"){
                            item.showBtn = 0;
                        }else{
                            item.showBtn = 1;
                        }
                        if(verifyFilter){
                            if(item.orderApprovalBtn * 1 == 1){
                                data.push(item);
                            }
                        }else{
                            data.push(item);
                        }
                        });
                    return {
                        "code": res.code, //解析接口状态
                        "msg": res.message, //解析提示文本
                        "count": res.data.totalSize, //解析数据长度
                        "data": data //解析数据列表
                    }
                }
                , done: function (res) {//表格渲染完成的回调
                    layer.close(loadLayer);
                    $(window).unbind("resize");
                    method.resizeTable();
                    method.bindUpload();
                    method.bindVerify();
                    method.bindViewPic();
                    method.bindPicVerify();
                    method.bindPay();
                    method.bindPrePay();
                    method.bindEvents();
                    if(!res.data || res.data == null || res.data.length < 1){
                        $('.layui-table-header').css('overflow-x','scroll');
                    }else{
                        $('.layui-table-header').css('overflow','hidden');
                    }
                    if(reloadOption) {
                        mainTable.reload(JSON.parse(JSON.stringify(reloadOption)));
                        reloadOption = false;
                    }
                    tableFilterIns && tableFilterIns.reload();
                },
                text: {none: "暂无数据"}
                , cols: [tableCols]
            });
          
            //头工具栏事件
            table.on('toolbar(orderList)', function (obj) {
                var checkStatus = table.checkStatus(obj.config.id);
                switch (obj.event) {
                    case 'getCheckData':
                        var data = checkStatus.data;
                        layer.alert(JSON.stringify(data));
                        break;
                    case 'getCheckLength':
                        var data = checkStatus.data;
                        layer.msg('选中了：' + data.length + ' 个');
                        break;
                    case 'isAll':
                        layer.msg(checkStatus.isAll ? '全选' : '未全选');
                        break;
                }
                ;
            });
          
            //监听行工具事件
            table.on('tool(orderList)', function (obj) {
                var data = obj.data; //获得当前行数据
                var layEvent = obj.event; //获得 lay-event 对应的值（也可以是表头的 event 参数对应的值）
                layEvent == 'edit' && permissionList.indexOf('修改') == -1 && (layEvent = 'reject');
                // layEvent == 'verify' && permissionList.indexOf('修改') == -1 && (obj.event = 'reject');
                layEvent == 'cancel' && permissionList.indexOf('取消') == -1 && (layEvent = 'reject');
                if(layEvent === 'reject'){
                    layer.alert('你没有访问权限', {icon: 2});
                    return;
                }else if (layEvent === 'edit') { //编辑
                    xadmin.open('修改订单', './order-edit.html?action=edit&orderNo=' + data.orderNo + "&orderId=" + data.id + "&feeId=" + data.feeId);
                } else if (layEvent === 'verify') { //审核
                    xadmin.open('审核', './order-view.html?action=verify&orderNo=' + data.orderNo + "&orderId=" + data.id + "&feeId=" + data.feeId);
                }else if(layEvent == "feeVerify"){
                    xadmin.open('审核运费', './order-view.html?action=feeVerify&orderNo=' + data.orderNo + "&orderId=" + data.id + "&feeId=" + data.feeId);
                } else if (layEvent === 'view') { //查看
                    var pid = edipao.urlGet().perssionId;
                    xadmin.open('查看订单', './order-view.html?orderNo=' + data.orderNo + "&orderId=" + data.id + "&action=view" + "&feeId=" + data.feeId + "&perssionId=" + pid);
                } else if (layEvent === 'cancel') { //取消
                    var index = layer.open({
                        title: "取消确认",
                        content: "取消后订单将作废，确认继续取消订单？",
                        btn: ["确认", "取消"],
                        yes: function(){
                            edipao.request({ //ORDERNO
                                url: "/admin/order/cancelOrder",
                                data: {
                                    loginStaffId: user.staffId,
                                    id: data.id
                                }
                            }).done(function (res) {
                                if(res.code == "0"){
                                    layer.msg("取消成功");
                                    layer.close(index);
                                    mainTable.reload( { where: where, page: { curr: 1 }});
                                }else{
                                    layer.msg(res.message, {icon: 5,anim: 6});
                                }
                            });
                        }
                    });
                } else if (layEvent === 'log') {//日志
                    xadmin.open('操作日志', '../../OperateLog/log.html?id=' + data.id + '&type=4');
                }
            });
        },
        resizeTable:function () {
            var dur = 500;
            var w = "390px";
            var backw = "100px";
            var r = "-1px";
            var backr = "-290px";
            $(".opeartion_icon").removeClass("layui-icon-next").addClass("layui-icon-prev");
            if(method.timer) clearTimeout(method.timer);
            method.timer = setTimeout(function () {
                $(".layui-table-main td[data-field=operation]").css("border-color","#ffffff").css("background","#ffffff").find(".layui-table-cell").css("width", backw).html("");
                $(".layui-table-box>.layui-table-header th[data-field=operation]").css("border", "none").css("color", "#f2f2f2");
                var $fixed = $(".layui-table-fixed.layui-table-fixed-r");
                $fixed.removeClass("layui-hide").find(".layui-table-body").css("height", "auto");
                $fixed.find(".layui-table-header").css("overflow", "visible")
                $fixed.find(".layui-table-filter").css("left","60px");
                $fixed.find("thead .layui-table-cell").css("position", "relative");
                if(!$fixed.find(".opeartion_icon").length) $fixed.find("thead .layui-table-cell").append("<i class='layui-icon opeartion_icon layui-icon-prev'></i>");
                $fixed.animate({"right": backr}, 500, function () {
                    $(".opeartion_icon").unbind().on("click", function (e) {
                        var $this = $(this);
                        if($this.hasClass("layui-icon-prev")){
                            $(".layui-table-main td[data-field=operation] .layui-table-cell").css("width", w);
                            $this.removeClass("layui-icon-prev").addClass("layui-icon-next");
                            $fixed.animate({"right": r}, 500);
                        }else{
                            $(".layui-table-main td[data-field=operation] .layui-table-cell").css("width", backw);
                            $this.removeClass("layui-icon-next").addClass("layui-icon-prev");
                            $fixed.animate({"right": backr}, 500);
                        }
                    });
                });
            }, dur);
        }
    }
    var tableCols = [
        {type: 'checkbox', fixed: 'left'},
        {field: 'orderNo', title: '业务单号', sort: false,minWidth:105, templet: function(d){
            return d.orderNo ? d.orderNo : '- -';
        }},
        {field: 'warehouseNo', title: '仓库单号', sort: false,minWidth:140, templet: function(d){
            return d.warehouseNo ? d.warehouseNo : '- -';
        }},
        {field: 'vinCode', title: 'VIN码', sort: false,width: 200,minWidth:100, templet: function(d){
            return d.vinCode ? d.vinCode : '- -';
        }},
        {field: 'tempLicense', title: '临牌号', sort: false,minWidth:100,minWidth:100, templet: function(d){
            return d.tempLicense ? d.tempLicense : '- -';
        }},
        {field: 'orderType', title: '订单类型', sort: false,minWidth:100, templet: function (d) {
            var value = '- -';
            orderTypeData.some(function (status) {
                if(status.key == d.orderType){
                    value = status.value;
                    return true;
                }
            });
            return value;
        }},
        {field: 'masterFlag', title: '上下车', sort: false, minWidth:100, templet: function (d) {
                if (d.orderType == 1) {
                    return "单车";
                } else {
                    if(d.masterFlag == "是"){
                        return "下车";
                    }else{
                        return "上车";
                    }
                }
        }},
        {field: 'orderStatus', title: '订单状态', sort: false,minWidth:100, templet: function (d) {
            var value = '- -';
            orderStatusData.some(function (status) {
                if(status.key == d.orderStatus){
                    value = status.value;
                    if(status.key == 4 && !d.dealerSignTime){
                        value = "收车未扫码";
                    }
                    return true;
                }
            });
            return value;
        }},
        {field: 'customerFullName', title: '客户全称', sort: false, width: 120, templet: function(d){
            return d.customerFullName ? d.customerFullName : '- -';
        }},
        {field: 'startWarehouse', title: '发车仓库', sort: false, width: 400, templet: function(d){
            return d.startWarehouse ? d.startWarehouse : '- -';
        }},
        {field: 'startPark', title: '发车停车场', sort: false, width: 400, templet: function(d){
            return d.startPark ? d.startPark : '- -';
        }},
        {field: 'startProvince', title: '发车省', sort: false,minWidth:100, templet: function(d){
            return d.startProvince ? d.startProvince : '- -';
        }},
        {field: 'startCity', title: '发车城市', sort: false,minWidth:100, templet: function(d){
            return d.startCity ? d.startCity : '- -';
        }},
        {field: 'startAddress', title: '发车地址', sort: false, width: 400, templet: function(d){
            return d.startAddress ? d.startAddress : '- -';
        }},
        {field: 'endPark', title: '收车网点', sort: false, width: 400, templet: function(d){
            return d.endPark ? d.endPark : '- -';
        }},
        {field: 'endProvince', title: '收车省', sort: false,minWidth:100, templet: function(d){
            return d.endProvince ? d.endProvince : '- -';
        }},
        {field: 'endCity', title: '收车城市', sort: false,minWidth:100, templet: function(d){
            return d.endCity ? d.endCity : '- -';
        }},
        {field: 'endAddress', title: '收车地址', sort: false, width: 300, templet: function(d){
            return d.endAddress ? d.endAddress : '- -';
        }},
        {field: 'transportAssignTime', title: '运输商指派时间', sort: false,width: 200, templet: function(d){
            return d.transportAssignTime ? d.transportAssignTime : '- -';
        }},
        {field: 'customerMileage', title: '收入里程', sort: false,width: 150, templet: function(d){
            return d.customerMileage ? (d.customerMileage + "km") : '- -';
        }},
        {field: 'pricePerMeliage', title: '收入单价', sort: false,width: 150, templet: function(d){
            if(dataPermission.canViewOrderCost != "Y") return "****";
            return d.pricePerMeliage ? (d.pricePerMeliage + "元/km") : '- -';
        }},
        {field: 'income', title: '收入金额', sort: false,width: 150, templet: function(d){
            if(dataPermission.canViewOrderCost != "Y") return "****";
            return d.income ? (d.income + "元") : '- -';
        }},
        {field: 'driverMileage', title: '承运里程', sort: false,width: 150, templet: function(d){
            return d.driverMileage ? (d.driverMileage + "km") : '- -';
        }},
        {field: 'prePayTime', title: '预付款支付时间', sort: false,width: 150, templet: function(d){
            return d.prePayTime ? d.prePayTime : '- -';
        }},
        {field: 'arrivePayTime', title: '到付款支付时间', sort: false,width: 150, templet: function(d){
            return d.arrivePayTime ? d.arrivePayTime : '- -';
        }},
        {field: 'tailPayTime', title: '尾款支付时间', sort: false,width: 150, templet: function(d){
            return d.tailPayTime ? d.tailPayTime : '- -';
        }},
        {field: 'dispatchTime', title: '调度时间', sort: false, width: 200, templet: function(d){
            return d.dispatchTime ? d.dispatchTime : '- -';
        }},
        {field: 'openOperator', title: '开单员', sort: false, width: 180, templet: function(d){
            d.openOperator = d.openOperator || "";
            d.openOperatorPhone = d.openOperatorPhone || "";
            return (d.openOperator || d.openOperatorPhone) ? d.openOperator + d.openOperatorPhone : '- -';
        }},
        {field: 'deliveryOperator', title: '发运经理', sort: false, minWidth:180, templet: function(d){
            d.deliveryOperator = d.deliveryOperator || "";
            d.deliveryOperatorPhone = d.deliveryOperatorPhone || "";
            return (d.deliveryOperator || d.deliveryOperatorPhone) ? d.deliveryOperator + d.deliveryOperatorPhone : '- -';
        }},
        {field: 'dispatchOperator', title: '调度员', sort: false, minWidth:180, templet: function(d){
            if(d.dispatchMode == 2) return "系统调度";
            d.dispatchOperator = d.dispatchOperator || "";
            d.dispatchOperatorPhone = d.dispatchOperatorPhone || "";
            return (d.dispatchOperator || d.dispatchOperatorPhone) ? d.dispatchOperator + d.dispatchOperatorPhone : '- -';
        }},
        {field: 'dispatchMode', title: '调度方式', sort: false, minWidth: 145, templet: function(d){
            var result = "";
            dispatchModeData.some(function(item){
                if(item.key == d.dispatchMode){
                    result = item.value;
                    return true;
                }
            });
            return result || "- -";
        }},
        {field: 'driverName', title: '司机姓名', sort: false, minWidth: 130, templet: function (d) {
            var driverName = "<a class='table_a pointer blue list_driver_name' data-id="+ d.driverId +">{{}}</a>";
            if(d.driverName){
                driverName = driverName.replace("{{}}", d.driverName);
            }else{
                driverName = "- -";
            }
            return driverName;
        }},
        {field: 'driverPhone', title: '司机手机', sort: false,minWidth:120, templet: function (d) {
                return d.driverPhone || "- -";
        }},
        {field: 'driverIdCard', title: '司机身份证', sort: false,width: 160, hide: false, templet: function(d){
            return d.driverIdCard ? d.driverIdCard : '- -';
        }},
        // {field: 'pricePerMeliage', title: '收入单价', sort: false,width: 100, hide: false, templet: function(d){
        //     return d.pricePerMeliage ? d.pricePerMeliage+"元" : '- -';
        // }},
        // {field: 'income', title: '收入', sort: false,width: 100, hide: false, templet: function(d){
        //     return d.income ? d.income+"元" : '- -';
        // }},
        {field: 'prePayAmount', title: '预付款金额', sort: false,width: 200, hide: false, templet: function (d) {
                var amount = d.prePayAmount;
                var verifyStr = "<a class='table_a pointer blue list_arrive_verify' data-type='1' data-orderId="+ d.id +" data-order="+ d.orderNo +" data-field='prePayAmount'>{{}}</a>";
                var verifyStr2 = "<a class='table_a pointer blue list_arrive_pay' data-type='1' data-orderId="+ d.id +" data-order="+ d.orderNo +" data-field='prePayAmount'>{{}}</a>";
                var verifyStr3 = "<a class='table_a pointer blue list_arrive_prepay' data-type='1' data-orderId="+ d.id +" data-order="+ d.orderNo +" data-field='prePayAmount'>{{}}</a>";
                var payStatus = "";
                if (d.prePayApprovalBtn == 1 && (amount > 0 || d.prePayOil * 1 > 0) ) {
                    payStatus = verifyStr3.replace("{{}}", " - 申请支付");
                } else if (d.prePayApprovalBtn == 2 && (amount > 0 || d.prePayOil * 1 > 0)) {
                    payStatus = verifyStr.replace("{{}}", "-审核");
                } else if (d.prePayApprovalBtn == 3 && (amount > 0 || d.prePayOil * 1 > 0)) {
                    payStatus = verifyStr2.replace("{{}}", "-支付");
                } else if (d.prePayApprovalBtn == 4) {
                    payStatus = "-已支付";
                }else if(d.prePayApprovalBtn == 0){
                    payStatus = "";
                }
                if(d.orderStatus == 6){
                    payStatus = "";
                }
                if(d.orderType == 2 && d.masterFlag == "否"){
                    return "";
                }
                if(dataPermission.canViewOrderCost != "Y"){
                    return "**** " + payStatus;
                }
                return d.prePayAmount + "元" + "/" + d.prePayOil + "升" + payStatus;
        }},
        {field: 'arrivePayAmount', title: '到付款金额', sort: false,width: 200, hide: false, templet: function (d) {
                var amount = d.arrivePayAmount;
                var verifyStr = "<a class='table_a pointer blue list_arrive_verify' data-type='2' data-orderId="+ d.id +" data-order="+ d.orderNo +" data-field='arrivePayAmount'>{{}}</a>";
                var verifyStr2 = "<a class='table_a pointer blue list_arrive_pay' data-type='2' data-orderId="+ d.id +" data-order="+ d.orderNo +" data-field='arrivePayAmount'>{{}}</a>";
                var verifyStr3 = "<a class='table_a pointer blue list_arrive_prepay' data-type='2' data-orderId="+ d.id +" data-order="+ d.orderNo +" data-field='arrivePayAmount'>{{}}</a>";
                var payStatus = "";
                if (d.arrivePayApprovalBtn == 1 ) {
                    if(amount > 0){
                        payStatus = verifyStr3.replace("{{}}", " - 申请支付");
                    }else{
                        payStatus = "";
                    }
                } else if (d.arrivePayApprovalBtn == 2 && amount > 0) {
                    payStatus = verifyStr.replace("{{}}", " - 审核");
                } else if (d.arrivePayApprovalBtn == 3 && amount > 0) {
                    payStatus = verifyStr2.replace("{{}}", " - 支付");
                } else if (d.arrivePayApprovalBtn == 4) {
                    payStatus = " - 已支付";
                }else if(d.arrivePayApprovalBtn == 0){
                    payStatus = "";
                }
                if(d.orderStatus == 6){
                    payStatus = "";
                }
                if(d.orderType == 2 && d.masterFlag == "否"){
                    return "";
                }
                if(dataPermission.canViewOrderCost != "Y"){
                    return "**** " + payStatus;
                }
                return d.arrivePayAmount + "元" + payStatus;
        }},
        {field: 'tailPayAmount', title: '尾款金额', sort: false,width: 200, hide: false, templet: function (d) {
                var amount = d.tailPayAmount * 1;
                var verifyStr = "<a class='table_a pointer blue list_arrive_verify' data-type='3' data-orderId="+ d.id +" data-order="+ d.orderNo +" data-field='tailPayAmount'>{{}}</a>";
                var verifyStr2 = "<a class='table_a pointer blue list_arrive_pay' data-type='3' data-orderId="+ d.id +" data-order="+ d.orderNo +" data-field='tailPayAmount'>{{}}</a>";
                var verifyStr3 = "<a class='table_a pointer blue list_arrive_prepay' data-type='3' data-orderId="+ d.id +" data-order="+ d.orderNo +" data-field='tailPayAmount'>{{}}</a>";
                var payStatus = "";
                if (d.tailPayApprovalBtn == 1 && amount > 0) {
                    if(amount > 0){
                        payStatus = verifyStr3.replace("{{}}", " - 申请支付");
                    }else{
                        payStatus = "";
                    }
                } else if (d.tailPayApprovalBtn == 2 && amount > 0) {
                    payStatus = verifyStr.replace("{{}}", " - 审核");
                } else if (d.tailPayApprovalBtn == 3 && amount > 0) {
                    payStatus = verifyStr2.replace("{{}}", " - 支付");
                } else if (d.tailPayApprovalBtn == 4) {
                    payStatus = " - 已支付";
                }else if(d.tailPayApprovalBtn == 0){
                    payStatus = "";
                }
                if(d.orderStatus == 6){
                    payStatus = "";
                }
                if(d.orderType == 2 && d.masterFlag == "否"){
                    return "";
                }
                if(dataPermission.canViewOrderCost != "Y"){
                    return "**** " + payStatus;
                }
                return d.tailPayAmount + "元" + payStatus;
        }},
        {field: "tailPayStatus", title: "尾款状态", sort: false, width: 100, hide: false, templet: function (d) {
            if(d.orderType == 2 && d.masterFlag == "否"){
                return "";
            }
            var value = '- -';
            tailPayStatusData.some(function (status) {
                if(status.key == d.tailPayStatus){
                    value = status.value;
                    return true;
                }
            });
            return value;
        }},
        {field: 'feeName', title: '费用模板', sort: false,minWidth:200, templet: function (d) {
            return d.feeName || "- -";
        }},
        {field: 'carModel', title: '费用车型', sort: false,minWidth:200, templet: function (d) {
            return d.carModel || "- -";
        }},
        {field: 'fetchTruckTime', title: '提车时间', sort: false, width: 150, hide: false, templet: function(d){
            if(d.orderType == 2 && d.masterFlag == "否"){
                return "";
            }
            return d.fetchTruckTime ? d.fetchTruckTime : '- -';
        }},
        {field: 'startTruckTime', title: '发车时间', sort: false, width: 150, templet: function(d){
            if(d.orderType == 2 && d.masterFlag == "否"){
                return "";
            }
            return d.startTruckTime ? d.startTruckTime : '- -';
        }},
        {field: 'returnAuditStatus', title: '回单审核', sort: false,width: 120, hide: false, templet: function(d){
            var str = "<a class='list_picture pointer blue list_picture_view' data-orderId="+ d.id +" data-order="+ d.orderNo +"  data-number='3' data-type='5' data-field='returnAuditStatus' data-truck="+d.truckId+">{{}}</a>";
            var str2 = "<a class='list_picture pointer blue list_picture_upload' data-orderId="+ d.id +" data-order="+ d.orderNo +"  data-number='3' data-type='5' data-field='returnAuditStatus' data-truck="+d.truckId+">{{}}</a>";
            var str3 = "<a class='list_picture pointer blue list_picture_verify' data-driverId="+ d.driverId +" data-orderId="+ d.id +" data-number='3' data-order="+ d.orderNo +" data-type='2' data-key='returnImages' data-field='returnAuditStatus' data-truck="+d.truckId+">{{}}</a>";
            var status = "未上传";
            if(permissionList.indexOf("交接单回收-上传") < 0){
                str2 = "";
            }
            switch(d.returnAuditStatus * 1){
                case 0:
                case 1:
                    status = "未上传";
                    break;
                case 2:
                case 3:
                    status = str.replace("{{}}","查看");
                    break;
                case 4:
                    status = "已驳回";
                    break;
            }
            if(d.returnUploadBtn * 1 == 1){
                status += str2.replace("{{}}"," 上传");
            }
            if(d.returnApprovalBtn * 1 == 1){
                status += str3.replace("{{}}"," 审核");
            }
            if(d.orderStatus == 6){
                status = str.replace("{{}}","查看");
            }
            if(d.orderType == 2 && d.masterFlag == "否"){
                status = "";
            }
            return status;
        }},
        {field: 'dealerSignTime', title: '经销商签收时间', sort: false,minWidth:150, templet: function (d) {
            return d.dealerSignTime || "- -";
        }},
        {field: 'dealerEval', title: '经销商评价', sort: false,minWidth:120, templet: function (d) {
            return d.dealerEval || "- -";
        }},
        {field: 'certificateSignTime', title: '合格证签收时间', sort: false,minWidth:150, templet: function (d) {
            return d.certificateSignTime || "- -";
        }},
        {field: 'dealerRemark', title: '经销商备注', sort: false,minWidth:200, templet: function (d) {
            return d.dealerRemark || "- -";
        }},
    ];
    var showList = [];
    tableCols.forEach(function (item) {
        showList.push(item.field);
    });
    var exportHead={};// 导出头部
    var toolField = {title: '操作', field: "operation", toolbar: '#barDemo', align: 'left', fixed: 'right', width: 390};

    edipao.request({
        type: 'GET',
        url: '/admin/table/show-field/get',
        data: {
            tableName: tableName
        }
    }).done(function(res) {
        if (res.code == 0) {
            if(res.data){
                showList = [];
                try{
                    showList = JSON.parse(res.data);
                }catch(e){}
                layui.each(tableCols, function(index, item){
                    if(item.field && showList.indexOf(item.field) == -1){
                        item.hide = true;
                    }else{
                        if(item.field&&item.field!==''&&item.field!='right'&&item.field!='left'){
                            exportHead[item.field] = item.title;
                        }
                    }
                })
            }else{
                layui.each(tableCols, function(index, item){
                    if(item.field && showList.indexOf(item.field) != -1){
                        if(item.field&&item.field!==''&&item.field!='right'&&item.field!='left'){
                            exportHead[item.field] = item.title;
                        }
                    }
                })
            }
            tableCols.push(toolField);
            method.renderTable();
        }
    });});