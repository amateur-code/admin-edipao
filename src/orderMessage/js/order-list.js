layui.config({
    base: '../lib/'
}).extend({
    excel: 'layui_exts/excel',
    tableFilter: 'TableFilter/tableFilter'
}).use(['form', 'table', 'jquery','layer', 'upload', 'laytpl', 'tableFilter', 'excel'], function () {
    var tableName = "orderMessage-order-list";
    var mainTable;
    var table = layui.table;
    var $ = layui.jquery;
    var form = layui.form;
    var layer = layui.layer;
    var upload = layui.upload;
    var laytpl = layui.laytpl;
    var tableFilter = layui.tableFilter;
    var excel = layui.excel;
    var edipao = layui.edipao;
    var user = JSON.parse(sessionStorage.user);
    var orderDTOList = [];
    var orderData = {};
    var uploadTruckId = "";
    var permissionList = edipao.getMyPermission();
    var exportHead = {};
    var where = {
        loginStaffId: user.staffId,
    };
    var uploadObj = {
        startImagesList: [],
        fetchImagesList: [],
        returnImagesList: []
    }
    var uploadData = {}
    top.window.uploadData = uploadData;
    top.window.uploadObj = uploadObj;
    var filters = [
        { field: 'orderNo', type: 'input' },
        { field: 'warehouseNo', type: 'input' },
        { field: 'vinCode', type: 'input' },
        { field: 'tempLicense', type: 'radio' },
        { field: 'orderStatus', type: 'radio' },
        { field: 'orderType', type: 'input' },
        { field: 'customerFullName', type: 'city' },
        { field: 'startWarehouse', type: 'city' },
        { field: 'startPark', type: 'input' },
        { field: 'startCity', type: 'input' },
        { field: 'startAddress', type: 'input' },
        { field: 'endPark', type: 'input' },
        { field: 'endCity', type: 'input' },
        { field: 'endAddress', type: 'input' },
        { field: 'transportAssignTime', type: 'input' },
        { field: 'dispatchTime', type: 'input' },
        { field: 'openOperator', type: 'input' },
        { field: 'dispatchOperator', type: 'input' },
        { field: 'fetchOperator', type: 'input' },
        { field: 'deliveryOperator', type: 'input' },
        { field: 'driverName', type: 'input' },
        { field: 'driverPhone', type: 'input' },
        { field: 'driverIdCard', type: 'input' },
        { field: 'prePayAmount', type: 'input' },
        { field: 'arrivePayAmount', type: 'input' },
        { field: 'tailPayAmount', type: 'input' },
    ]
    tableFilterIns = tableFilter.render({
        'elem' : '#orderList',//table的选择器
        'mode' : 'self',//过滤模式
        'filters' : filters,//过滤项配置
        'done': function(filters){
            var index = 0;
            where = {
                loginStaffId: edipao.getLoginStaffId()
            };
            layui.each(filters,function(key, value){
                if(key=='licenceWarn'){
                    // 证件预警 比如预警是30天, 今天是3月8号, 传值4月8日。
                    where['searchFieldDTOList['+ index +'].fieldName'] = validityData[value];
                    where['searchFieldDTOList['+ index +'].fieldMaxValue'] = getDay(warnDataVal[value]);
                }else if(key=='wishJourney'||key=='oftenJourney'){
                    // 意向线路、常跑线路
                    where['searchFieldDTOList['+ index +'].fieldName'] = key;
                    var fieldValue = {
                        'start': {
                            "code": cityCode[value[key+'Start-city']],
                            "province": value[key+'Start-province'],
                            "city": value[key+'Start-city']
                        },
                        'end': {
                            "code": cityCode[value[key+'End-city']],
                            "province": value[key+'End-province'],
                            "city": value[key+'End-city']
                        }
                    };
                    where['searchFieldDTOList['+ index +'].fieldValue'] = JSON.stringify(fieldValue);
                }else if(key == 'drivingAge'||key == 'deposit'){
                    // 驾龄、押金
                    where['searchFieldDTOList['+ index +'].fieldName'] = key;
                    where['searchFieldDTOList['+ index +'].fieldMinValue'] = value[0];
                    where['searchFieldDTOList['+ index +'].fieldMaxValue'] = value[1];
                }else{
                    where['searchFieldDTOList['+ index +'].fieldName'] = key;
                    where['searchFieldDTOList['+ index +'].fieldValue'] = value;
                }
                index++;
            })
            tableIns.reload( { where: where, page: { curr: 1 }});
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
            })
        },
        bindUpload: function () {
            $(".list_picture_upload").unbind().on("click", function(e){
                uploadObj = {
                    startImagesList: [],
                    fetchImagesList: [],
                    returnImagesList: []
                };
                uploadData = {};
                var elem;
                var field = e.target.dataset.field;
                var truckId = e.target.dataset.truck;
                var type = e.target.dataset.type * 1;
                var number = e.target.dataset.number * 1;
                var orderNo = e.target.dataset.order;
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
                        orderData = res.data;
                        uploadTruckId = res.data.truckDTOList[0].id;
                        res.data.truckDTOList.forEach(function (item) {
                            uploadData[item.id + ""] = uploadObj;
                        });
                        var renderData = {
                            list: res.data.truckDTOList,
                            six: [1,1,1,1,1,1],
                            five: [1,1,1,1,1],
                            three: [1,1,1],
                        };
                        laytpl(elem).render(renderData, function (html) {
                            method.openUpload(html, renderData, type, truckId, orderId);
                        });
                    }else{
                        layer.msg(res.message, {icon: 5,anim: 6});
                    }
                })
                    
            });
        },
        openUpload: function (html, renderData, type, truckId, orderId) {
            var renderObj = [
                {
                    num: renderData.six,
                    holder: "#upload_start_holder_",
                    pre: "#upload_start_pre_",
                    type: 3,
                    key: "startImagesList"
                },
                {
                    num: renderData.five,
                    holder: "#upload_get_holder_",
                    pre: "#upload_get_pre_",
                    type: 2,
                    key: "fetchImagesList"
                },
                {
                    num: renderData.three,
                    holder: "#upload_give_holder_",
                    pre: "#upload_give_pre_",
                    type: 5,
                    key: "returnImagesList"
                },
            ]
            var index = layer.open({
                type: 1, 
                content: html, //这里content是一个普通的String,
                area: ["600px", "400px"],
                btn: ["确定", "取消"],
                yes: function () {
                    method.uploadPics({id: orderId}, function (res) {
                        if(res.code == "0"){
                            layer.msg("上传成功", {icon: 1});
                            table.reload("orderList");
                            layer.close(index);
                        }else{

                        }
                    });
                },
                success: function () {
                    form.render("select");
                    //多图片上传
                    form.on("select", function (data) {
                        if(data.elem.name == "vinCode"){
                            if(uploadTruckId != data.value){
                                uploadObj = {
                                    startImagesList: [],
                                    fetchImagesList: [],
                                    returnImagesList: []
                                }
                                uploadData = {}
                            }
                            uploadTruckId = data.value;
                        }
                    });
                    renderObj.forEach(function (item) {
                        item.num.forEach(function (item2, index) {
                            var uploadInst = upload.render({
                                elem: item.holder + index + "" //绑定元素
                                ,accept: "images"
                                ,multiple: true
                                ,url: layui.edipao.API_HOST+'/admin/truck/upload/image' //上传接口
                                ,before: function(obj){
                                    obj.preview(function(idx, file, result){
                                        $(item.pre + index + "").append('<img src="'+ result +'" alt="'+ file.name +'" class="layui-upload-img pre_img">')
                                    });
                                }
                                ,data: {
                                    loginStaffId: user.staffId,
                                    type: item.type,
                                    truckId: truckId,
                                    index: uploadData[uploadTruckId+""][item.key].length + 1,
                                }
                                ,done: function(res){
                                    if(res.code == "0"){
                                        uploadData[uploadTruckId+""][item.key].push(res.data);
                                    }else{
                                        layer.msg(res.message, {icon: 5,anim: 6});
                                    }
                                }
                            });
                        });
                    });
                }
            });
        },
        uploadPics: function (options, cb) {
            var data1, data2, data3;
            var promise;
            var flag = [data1, data2, data3];
            var uploadObj = uploadData[uploadTruckId + ''];
            var getReq = function (data) {
                return edipao.request({
                    url: "/admin/truck/submit/image",
                    method: "post",
                    data: data
                });
            }
            console.log(uploadObj)
            if(uploadObj["returnImagesList"].length > 0){
                data1 = {
                    loginStaffId: user.staffId,
                    truckId: uploadTruckId,
                    type: 5,
                    images: uploadObj["returnImagesList"].join(",")
                }
                flag[0] = data1;
            }
            if(uploadObj["startImagesList"].length > 0){
                data2 = {
                    loginStaffId: user.staffId,
                    truckId: uploadTruckId,
                    type: 3,
                    images: uploadObj["startImagesList"].join(",")
                }
                flag[1] = data2;
            }
            if(uploadObj["fetchImagesList"].length > 0){
                data3 = {
                    loginStaffId: user.staffId,
                    truckId: uploadTruckId,
                    type: 2,
                    images: uploadObj["fetchImagesList"].join(",")
                }
                flag[2] = data3;
            }
            flag = flag.filter(function (item) {
                return !!item;
            });
            flag = flag.map(function (item) {
                return getReq(item);
            });
            if(flag.length == 0){
                layer.msg("请先选择图片");
            }else if(flag.length == 1){
                promise = $.when(flag[0]);
            }else if(flag.length == 2){
                promise = $.when(flag[0], flag[1]);
            }else if(flag.length == 3){
                promise = $.when(flag[0], flag[1], flag[2]);
            }
            promise.done(function () {
                cb({code:0})
            });
        },
        bindVerify: function(){
            $(".list_arrive_verify").unbind().on("click", function(e){
                var field = e.target.dataset.field;
                var orderId = e.target.dataset.orderid;

                var orderNo = e.target.dataset.order;
                var type = e.target.dataset.type*1;
                var key = "prePayFeeItems";
                var title = "审核预付款";
                if(field == "arrivePayAmount"){
                    key = "arrivePayFeeItems";
                    title = "审核到付款";
                }else if(field == "tailPayAmount"){
                    key = "tailPayFeeItems";
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
                        return {
                            "code": res.code, //解析接口状态
                            "msg": res.message, //解析提示文本
                            "data": JSON.parse(res.data[key]) || [] //解析数据列表
                        }
                    }
                    , done: function () {//表格渲染完成的回调
                        var tableStr = $(".layui-table-view[lay-id=pre_fee_verify_table]").html();
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
                                    if(res.code == "0"){
                                        layer.msg("提交成功", {icon: 1,anim: 6});
                                        table.reload("orderList");
                                        layer.close(index);
                                    }else{
                                        //layer.alert(res.message);
                                    }
                                });
                            }
                        });
                    },
                    text: {none: "暂无数据"},
                    cols: [[
                        {field: 'key', title: '费用项', sort: false,width: "100px"},
                        {field: 'val', title: '金额', sort: false,width: "100px", templet: function (d) {
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

                var orderNo = e.target.dataset.order;
                var type = e.target.dataset.type*1;
                var key = "prePayFeeItems";
                var title = "确定申请支付预付款？";
                if(field == "arrivePayAmount"){
                    key = "arrivePayFeeItems";
                    title = "确定申请支付到付款？";
                }else if(field == "tailPayAmount"){
                    key = "tailPayFeeItems";
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
                        return {
                            "code": res.code, //解析接口状态
                            "msg": res.message, //解析提示文本
                            "data": JSON.parse(res.data[key]) || [] //解析数据列表
                        }
                    }
                    , done: function () { //表格渲染完成的回调
                        var tableStr = $(".layui-table-view[lay-id=pre_fee_verify_table]").html();
                        var htmlStr = $("#pre_fee_verify_tpl").html();
                        var index = layer.open({
                            title: title,
                            type: 1,
                            area: ["400px", "500px"],
                            content: htmlStr.replace("TABLE", tableStr),
                            btn: ["确定", "取消"],
                            success: function () {
                                form.render();
                            },
                            yes: function () {
                                edipao.request({
                                    url: "/admin/order/approval/pay",
                                    data: {
                                        loginStaffId: user.staffId,
                                        orderId: orderId,
                                        type: type,
                                        approvalResult: 0
                                    }
                                }).done(function (res) {
                                    if(res.code == "0"){
                                        layer.msg("提交成功", {icon: 1,anim: 6});
                                        table.reload("orderList");
                                        layer.close(index);
                                    }else{
                                        //layer.alert(res.message);
                                    }
                                });
                            }
                        });
                    },
                    text: {none: "暂无数据"},
                    cols: [[
                        {field: 'key', title: '费用项', sort: false,width: "100px"},
                        {field: 'val', title: '金额', sort: false,width: "100px", templet: function (d) { 
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

                var orderNo = e.target.dataset.order;
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
                        return {
                            "code": res.code, //解析接口状态
                            "msg": res.message, //解析提示文本
                            "data": JSON.parse(res.data[key]) || [] //解析数据列表
                        }
                    }
                    , done: function () { //表格渲染完成的回调
                        var tableStr = $(".layui-table-view[lay-id=pre_fee_verify_table]").html();
                        var htmlStr = $("#pre_fee_verify_tpl").html();
                        var index = layer.open({
                            title: title,
                            type: 1,
                            area: ["400px", "500px"],
                            content: htmlStr.replace("TABLE", tableStr),
                            btn: ["确定", "取消"],
                            success: function () {
                                form.render();
                            },
                            yes: function () {
                                edipao.request({
                                    url: "/admin/order/approval/pay",
                                    data: {
                                        loginStaffId: user.staffId,
                                        orderId: orderId,
                                        type: type,
                                        approvalResult: 0
                                    }
                                }).done(function (res) {
                                    if(res.code == "0"){
                                        layer.msg("提交成功", {icon: 1,anim: 6});
                                        table.reload("orderList");
                                        layer.close(index);
                                    }else{
                                        //layer.alert(res.message);
                                    }
                                });
                            }
                        });
                    },
                    text: {none: "暂无数据"},
                    cols: [[
                        {field: 'key', title: '费用项', sort: false,width: "100px"},
                        {field: 'val', title: '金额', sort: false,width: "100px", templet: function (d) {
                            return d.val + ' (' + d.unit + ')'
                        }},
                    ]]
                });
            });
        },
        bindPicVerify:function(){
            var _this = this;
            $(".list_picture_verify").unbind().on("click", function (e) {
                var orderNo = e.target.dataset.order;
                var orderId = e.target.dataset.orderid;
                var key = e.target.dataset.key;
                var type = e.target.dataset.type*1;
                method.getOrder(orderId).done(function (res) {
                    if(res.code == "0"){
                        res.data.truckDTOList.forEach(function (item) {
                            if(!item[key]){
                                item[key] = [];
                            }else{
                                item[key] = item[key].split(",");
                            }
                        });
                        laytpl($("#pic_verify_tpl").html()).render({list: res.data.truckDTOList, key: key}, function (html) {
                            var index = layer.open({
                                type: 1,
                                content: html,
                                area: ["600px", "400px"],
                                btn: ["确定", "取消"],
                                success: function () {
                                    form.render("radio");
                                },
                                yes: function () {
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
                                        if(res.code == "0"){
                                            layer.msg("提交成功");
                                            layer.close(index);
                                        }else{
                                            //layer.alert(res.message);
                                        }
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
                var orderNo = e.target.dataset.order;
                var orderId = e.target.dataset.orderid;
                var field = e.target.dataset.field;
                var startIndex = 0;
                method.getOrder(orderId).done(function (res) {
                    if(res.code == "0"){
                        res.data.truckDTOList.forEach(function (item) {
                            if(!item.startImages){
                                item.startImages = [];
                            }else{
                                item.startImages = item.startImages.split(",");
                            }
                            if(!item.fetchImages){
                                item.fetchImages = [];
                            }else{
                                item.fetchImages = item.fetchImages.split(",");
                            }
                            if(!item.returnImages){
                                item.returnImages = [];
                            }else{
                                item.returnImages = item.returnImages.split(",");
                            }
                        });
                        laytpl($("#pic_view_tpl").html()).render({
                            list: res.data.truckDTOList,
                            field: field
                        }, function (html) {
                            layer.open({
                                type: 1,
                                content: html,
                                area: ["600px", "400px"],
                                success: function () {
                                    res.data.truckDTOList[startIndex].field = field;
                                    laytpl($("#pic_view_list_tpl").html()).render(res.data.truckDTOList[startIndex], function (html) {
                                        $("#pic_view_list_container").html(html);
                                        form.render("select");
                                        form.on("select", function (obj) {
                                            if(obj.elem.name == "pic_view"){
                                                var index = obj.elem.options.selectedIndex*1;
                                                if(index == startIndex) return;
                                                var data = res.data.truckDTOList[index];
                                                laytpl($("#pic_view_list_tpl").html()).render(data, function (html) {
                                                    $("#pic_view_list_container").html(html);
                                                });
                                            }
                                        });
                                    });
                                }
                            })
                        });
                    }else{
                       // layer.alert(res.message);
                    }
                });
            });
        },
        bindEvents: function(){
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
                        xadmin.open('表格设置', './table-set.html?tableKey=orderMessage-order-list', 600, 600);
                        break;
                }
            });
        },
        exportData: function exportExcel() {
            var param = where;
            param['pageNo']= 1;
            param['pageSize'] =10000;
            edipao.request({
                type: 'GET',
                url: '/admin/order/list',
                data: param
            }).done(function(res) {
                if (res.code == 0) {
                    if(res.data){
                        var data = res.data.orderDTOList;
                        var exportData = [];
                        // 添加头部
                        exportData.push(exportHead);
                        // 过滤处理数据
                        layui.each(data, function(k, v){
                            var exportObj={};
                            layui.each(v,function (index,item) {
                                exportObj[index] = DataNull(item);
                            });
                            exportData.push(exportObj)
                        });
                        // 导出
                        excel.exportExcel({
                            sheet1: exportData
                        }, '订单.xlsx', 'xlsx');
                    }
                }
                function DataNull (data) {
                    if(data == null||data == ''){
                        return '--'
                    }else{
                        return  data
                    }
                }
            });
        },
        renderTable: function(){
            mainTable = table.render({
                elem: '#orderList'
                , url: layui.edipao.API_HOST+'/admin/order/list'
                , title: '订单列表'
                , method: "get" // 请求方式  默认get
                , page: true //开启分页
                , limit: 20  //每页显示条数
                , limits: [20, 50, 100] //每页显示条数可选择
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
                        data.push(item);
                    });
                    return {
                        "code": res.code, //解析接口状态
                        "msg": res.message, //解析提示文本
                        "count": res.data.totalSize, //解析数据长度
                        "data": data //解析数据列表
                    }
                }
                , done: function () {//表格渲染完成的回调
                    method.bindUpload();
                    method.bindVerify();
                    method.bindViewPic();
                    method.bindPicVerify();
                    method.bindPay();
                    method.bindPrePay();
                    method.bindEvents();
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
                    top.xadmin.add_tab('修改订单', 'orderMessage/order-edit.html?action=edit&orderNo=' + data.orderNo + "&orderId=" + data.id);
                } else if (layEvent === 'verify') { //审核
                    xadmin.open('审核', './order-view.html?action=verify&orderNo=' + data.orderNo + "&orderId=" + data.id, 1100, 500);
                } else if (layEvent === 'view') { //查看
                    top.xadmin.add_tab('查看订单', 'orderMessage/order-view.html?orderNo=' + data.orderNo + "&orderId=" + data.id);
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
                                    table.reload("orderList")
                                }else{
                                    layer.msg(res.message, {icon: 5,anim: 6});
                                }
                            });
                        }
                    });
                } else if (layEvent === 'log') {//日志
                    top.xadmin.open('操作日志', '../../OperateLog/log.html?id=' + data.id + '&type=4');
                }
            });
        },
    }
    var tableCols = [
        {type: 'checkbox'},
        {field: 'orderNo', title: '业务单号', sort: false,minWidth:100, templet: function(d){
            return d.orderNo ? d.orderNo : '- -';
        }},
        {field: 'warehouseNo', title: '仓库单号', sort: false,minWidth:100,minWidth:100, templet: function(d){
            return d.warehouseNo ? d.warehouseNo : '- -';
        }},
        {field: 'vinCode', title: 'VIN码', sort: false,minWidth:100,minWidth:100, templet: function(d){
            return d.vinCode ? d.vinCode : '- -';
        }},
        {field: 'tempLicense', title: '临牌号', sort: false,minWidth:100,minWidth:100, templet: function(d){
            return d.tempLicense ? d.tempLicense : '- -';
        }},
        {
            field: 'orderType', title: '订单类型', sort: false,minWidth:100, templet: function (d) {
                if (d.orderType == 1) {
                    return "单车单";
                } else if (d.orderType == 2) {
                    return "背车单";
                } else {
                    return "非法类型";
                }
            }
        },
        {
            field: 'orderStatus', title: '订单状态', sort: false,minWidth:100, templet: function (d) {
                if (d.orderStatus == 1) {
                    return "待调度";
                } else if (d.orderStatus == 2) {
                    return "待发车";
                } else if (d.orderStatus == 3) {
                    return "运输中";
                } else if (d.orderStatus == 4) {
                    return "已收车";
                } else if (d.orderStatus == 5) {
                    return "已完结";
                } else if (d.orderStatus == 6) {
                    return "已取消";
                } else {
                    return "非法状态";
                }
            }
        },
        {field: 'customerFullName', title: '客户全称', sort: true, templet: function(d){
            return d.customerFullName ? d.customerFullName : '- -';
        }},
        {field: 'startWarehouse', title: '发车仓库', sort: false,minWidth:100, templet: function(d){
            return d.startWarehouse ? d.startWarehouse : '- -';
        }},
        {field: 'startPark', title: '发车停车场', sort: false,minWidth:100, templet: function(d){
            return d.startPark ? d.startPark : '- -';
        }},
        {field: 'startCity', title: '发车城市', sort: false,minWidth:100, templet: function(d){
            return d.startCity ? d.startCity : '- -';
        }},
        {field: 'startAddress', title: '发车地址', sort: false,minWidth:100, templet: function(d){
            return d.startAddress ? d.startAddress : '- -';
        }},
        {field: 'startProvince', title: '发车省', sort: false,minWidth:100, templet: function(d){
            return d.startProvince ? d.startProvince : '- -';
        }},
        {field: 'endPark', title: '收车网点', sort: false,minWidth:100, templet: function(d){
            return d.endPark ? d.endPark : '- -';
        }},
        {field: 'endProvince', title: '收车省', sort: false,minWidth:100, templet: function(d){
            return d.endProvince ? d.endProvince : '- -';
        }},
        {field: 'endCity', title: '收车城市', sort: false,minWidth:100, templet: function(d){
            return d.endCity ? d.endCity : '- -';
        }},
        {field: 'endAddress', title: '收车地址', sort: false,minWidth:100, templet: function(d){
            return d.endAddress ? d.endAddress : '- -';
        }},
        {field: 'transportAssignTime', title: '运输商指派时间', sort: false,minWidth:100, templet: function(d){
            return d.transportAssignTime ? d.transportAssignTime : '- -';
        }},
        {field: 'dispatchTime', title: '调度时间', sort: false,minWidth:100, templet: function(d){
            return d.dispatchTime ? d.dispatchTime : '- -';
        }},
        {field: 'openOperator', title: '开单员', sort: false,minWidth:100, templet: function(d){
            return d.openOperator ? d.openOperator : '- -';
        }},
        {field: 'dispatchOperator', title: '调度员', sort: false,minWidth:100, templet: function(d){
            return d.dispatchOperator ? d.dispatchOperator : '- -';
        }},
        {field: 'fetchOperator', title: '提车员', sort: false,minWidth:100, templet: function(d){
            return d.fetchOperator ? d.fetchOperator : '- -';
        }},
        {field: 'deliveryOperator', title: '发运员', sort: false,minWidth:100, templet: function(d){
            return d.deliveryOperator ? d.deliveryOperator : '- -';
        }},
        {
        field: 'driverName', title: '司机姓名', sort: false,minWidth:100, templet: function (d) {
            return d.driverName ? d.driverName : '- -';
        }},
        {
            field: 'driverName', title: '司机手机', sort: false,minWidth:100, templet: function (d) {
                return d.driverPhone;
            }
        },
        {field: 'driverIdCard', title: '司机身份证', sort: false,minWidth:100, hide: false, templet: function(d){
            return d.driverIdCard ? d.driverIdCard : '- -';
        }},
        {
            field: 'prePayAmount', title: '预付款金额', sort: false,minWidth:130, hide: false, templet: function (d) {
                var verifyStr = "<a class='table_a pointer blue list_arrive_verify' data-type='1' data-orderId="+ d.id +" data-order="+ d.orderNo +" data-field='prePayAmount'>{{}}</a>";
                var verifyStr2 = "<a class='table_a pointer blue list_arrive_pay' data-type='1' data-orderId="+ d.id +" data-order="+ d.orderNo +" data-field='prePayAmount'>{{}}</a>";
                var verifyStr3 = "<a class='table_a pointer blue list_arrive_prepay' data-type='1' data-orderId="+ d.id +" data-order="+ d.orderNo +" data-field='prePayAmount'>{{}}</a>";
                var payStatus = "";
                if (d.prePayApprovalBtn == 1) {
                    payStatus = verifyStr3.replace("{{}}", "-申请支付");
                } else if (d.prePayApprovalBtn == 2) {
                    payStatus = verifyStr.replace("{{}}", "-审核");
                } else if (d.prePayApprovalBtn == 3) {
                    payStatus = verifyStr2.replace("{{}}", "-支付");
                } else if (d.prePayApprovalBtn == 4) {
                    payStatus = "-已支付";
                }else if(d.prePayApprovalBtn == 0){
                    payStatus = "";
                } else {
                    payStatus = "-非法状态";
                }

                return d.prePayAmount + "元" + "/" + d.prePayOil + "升" + payStatus;
            }
        },
        {
            field: 'arrivePayAmount', title: '到付款金额', sort: false,minWidth:120, hide: false, templet: function (d) {
                var verifyStr = "<a class='table_a pointer blue list_arrive_verify' data-type='2' data-orderId="+ d.id +" data-order="+ d.orderNo +" data-field='arrivePayAmount'>{{}}</a>";
                var verifyStr2 = "<a class='table_a pointer blue list_arrive_pay' data-type='2' data-orderId="+ d.id +" data-order="+ d.orderNo +" data-field='arrivePayAmount'>{{}}</a>";
                var verifyStr3 = "<a class='table_a pointer blue list_arrive_prepay' data-type='2' data-orderId="+ d.id +" data-order="+ d.orderNo +" data-field='arrivePayAmount'>{{}}</a>";
                var payStatus = "";
                if (d.arrivePayApprovalBtn == 1) {
                    payStatus = verifyStr3.replace("{{}}", " - 申请支付");
                } else if (d.arrivePayApprovalBtn == 2) {
                    payStatus = verifyStr.replace("{{}}", " - 审核");
                } else if (d.arrivePayApprovalBtn == 3) {
                    payStatus = verifyStr2.replace("{{}}", " - 支付");
                } else if (d.arrivePayApprovalBtn == 4) {
                    payStatus = " - 已支付";
                }else if(d.arrivePayApprovalBtn == 0){
                    payStatus = "";
                } else {
                    payStatus = " - 非法状态";

                }
                return d.arrivePayAmount + "元" + payStatus;
            }
        },
        {
            field: 'tailPayAmount', title: '尾款金额', sort: false,minWidth:120, hide: false, templet: function (d) {
                var verifyStr = "<a class='table_a pointer blue list_arrive_verify' data-type='3' data-orderId="+ d.id +" data-order="+ d.orderNo +" data-field='tailPayAmount'>{{}}</a>";
                var verifyStr2 = "<a class='table_a pointer blue list_arrive_pay' data-type='3' data-orderId="+ d.id +" data-order="+ d.orderNo +" data-field='tailPayAmount'>{{}}</a>";
                var verifyStr3 = "<a class='table_a pointer blue list_arrive_prepay' data-type='3' data-orderId="+ d.id +" data-order="+ d.orderNo +" data-field='tailPayAmount'>{{}}</a>";
                var payStatus = "";
                if (d.tailPayApprovalBtn == 1) {
                    payStatus = verifyStr3.replace("{{}}", " - 申请支付");
                } else if (d.tailPayApprovalBtn == 2) {
                    payStatus = verifyStr.replace("{{}}", " - 审核");
                } else if (d.tailPayApprovalBtn == 3) {
                    payStatus = verifyStr2.replace("{{}}", " - 支付");
                } else if (d.tailPayApprovalBtn == 4) {
                    payStatus = " - 已支付";
                }else if(d.tailPayApprovalBtn == 0){
                    payStatus = "";
                } else {
                    payStatus = " - 非法状态";
                }

                return d.tailPayAmount + "元" + payStatus;
            }
        },
        {
            field: 'settleWay', title: '结算方式', sort: false,minWidth:100, hide: true, templet: function (d) {
                if (d.settleWay == 1) {
                    return "月结";
                } else {
                    return "非法结算方式";
                }
            }
        },
        {field: 'fetchStatus', title: '提车照片', sort: false,minWidth:100, hide: false, templet: function(d){
            var str = "<a class='list_picture pointer blue list_picture_view' data-orderId="+ d.id +" data-order="+ d.orderNo +"  data-number='5' data-type='2' data-field='fetchStatus' data-truck="+d.truckId+">{{}}</a>";
            var str2 = "<a class='list_picture pointer blue list_picture_upload' data-orderId="+ d.id +" data-number='5' data-order="+ d.orderNo +"  data-type='2' data-field='fetchStatus' data-truck="+d.truckId+">{{}}</a>";
            var str3 = "<a class='list_picture pointer blue list_picture_verify' data-orderId="+ d.id +" data-number='5' data-order="+ d.orderNo +"  data-type='3' data-field='fetchStatus' data-truck="+d.truckId+">{{}}</a>";
            var status = "未上传";
            switch(d.fetchStatus*1){
                case 0: 
                    status = "未上传";
                    break;
                case 1:
                    status = "未上传" + str2.replace("{{}}"," 上传");
                    break;
                case 2:
                    status = str.replace("{{}}","查看");
                    break;
                case 3:
                    status = str.replace("{{}}","查看");
                    break;
                case 4:
                    status = "已驳回";
                    break;
            }
            if(d.fetchApprovalBtn * 1 == 1){
                status += str3.replace("{{}}"," 审核");
            }
            return status;
        }},
        {field: 'startAuditStatus', title: '发车单审核状态', sort: false,minWidth:100, hide: false, templet: function(d){
            var str = "<a class='list_picture pointer blue list_picture_view' data-orderId="+ d.id +" data-order="+ d.orderNo +" data-index=" + d.LAY_TABLE_INDEX + " data-number='6' data-type='3' data-field='startAuditStatus' data-truck="+d.truckId+">{{}}</a>";
            var str2 = "<a class='list_picture pointer blue list_picture_upload' data-orderId="+ d.id +" data-order="+ d.orderNo +" data-index=" + d.LAY_TABLE_INDEX + "  data-number='6' data-type='3' data-field='startAuditStatus' data-truck="+d.truckId+">{{}}</a>";
            var str3 = "<a class='list_picture pointer blue list_picture_verify' data-orderId="+ d.id +" data-number='6' data-order="+ d.orderNo +"  data-type='1' data-key='startImages' data-field='startAuditStatus' data-truck="+d.truckId+">{{}}</a>";
            var status = "未上传";
            switch(d.startAuditStatus*1){
                case 0:
                    status = "未上传";
                    break;
                case 1:
                    status = "未上传" + str2.replace("{{}}"," 上传");
                    break;
                case 2:
                    status = str.replace("{{}}","查看");
                    break;
                case 3:
                    status = str.replace("{{}}","查看");
                    break;
                case 4:
                    status = "已驳回";
                    break;
            }
            if(d.startApprovalBtn * 1 == 1){
                status += str3.replace("{{}}"," 审核");
            }
            return status;
        }},
        {field: 'returnAuditStatus', title: '交车单审核状态', sort: false,minWidth:100, hide: false, templet: function(d){
            var str = "<a class='list_picture pointer blue list_picture_view' data-orderId="+ d.id +" data-order="+ d.orderNo +"  data-number='3' data-type='5' data-field='returnAuditStatus' data-truck="+d.truckId+">{{}}</a>";
            var str2 = "<a class='list_picture pointer blue list_picture_upload' data-orderId="+ d.id +" data-order="+ d.orderNo +"  data-number='3' data-type='5' data-field='returnAuditStatus' data-truck="+d.truckId+">{{}}</a>";
            var str3 = "<a class='list_picture pointer blue list_picture_verify' data-orderId="+ d.id +" data-number='3' data-order="+ d.orderNo +" data-type='2' data-key='returnImages' data-field='returnAuditStatus' data-truck="+d.truckId+">{{}}</a>";
            var status = "未上传";
            switch(d.returnAuditStatus * 1){
                case 0:
                    status = "未上传";
                    break;
                case 1:
                    status = "未上传" + str2.replace("{{}}"," 上传");
                    break;
                case 2:
                    status = str.replace("{{}}","查看");
                    break;
                case 3:
                    status = str.replace("{{}}","查看");
                    break;
                case 4:
                    status = "已驳回";
                    break;
            }
            console.log(d.returnAuditStatus)
            if(d.returnApprovalBtn * 1 == 1){
                status += str3.replace("{{}}"," 审核");
            }
            return status;
        }},
    ];
    var showList = [
        "orderNo",
        "warehouseNo",
        "vinCode",
        "tempLicense",
        "orderStatus",
        "orderType",
        "customerFullName",
        "startWarehouse",
        "startPark",
        "startCity",
        "startAddress",
        "startProvince",
        "endPark",
        "endProvince",
        "endCity",
        "endAddress",
        "transportAssignTime",
        "dispatchTime",
        "openOperator",
        "dispatchOperator",
        "fetchOperator",
        "deliveryOperator",
        "driverName",
        "driverIdCard",
        "prePayAmount",
        "arrivePayAmount",
        "tailPayAmount",
        "settleWay",
        "fetchStatus",
        "startAuditStatus",
        "returnAuditStatus",
    ];
    var exportHead={};// 导出头部
    var toolField = {title: '操作', toolbar: '#barDemo', align: 'center', fixed: 'right', width: 350,};

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