layui.use(['form', 'table', 'jquery','layer', 'upload', 'laytpl'], function () {
    var tableName = "orderMessage-order-list";
    var mainTable;
    var table = layui.table;
    var $ = layui.jquery;
    var form = layui.form;
    var layer = layui.layer;
    var upload = layui.upload;
    var laytpl = layui.laytpl;
    var edipao = layui.edipao;
    var user = JSON.parse(sessionStorage.user);
    var orderDTOList = [];
    var orderData = {};
    var uploadTruckId = "";
    var uploadObj = {
        startImagesList: [],
        fetchImagesList: [],
        returnImagesList: []
    }
    var uploadData = {}
    var method = {
        getOrder: function (orderNo) {
            return edipao.request({
                method: "GET",
                url: "/admin/order/detail",
                data: {
                    loginStaffId: user.staffId,
                    orderNo: orderNo
                }
            })
        },
        bindUpload: function () {
            $(".list_picture_upload").unbind().on("click", function(e){
                uploadData = {};
                var elem;
                var field = e.target.dataset.field;
                var truckId = e.target.dataset.truck;
                var type = e.target.dataset.type * 1;
                var number = e.target.dataset.number * 1;
                var orderNo = e.target.dataset.order;
                elem = $("#uploadStartPic").html();
                method.getOrder(orderNo).done(function (res) {
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
                            method.openUpload(html, renderData, type, truckId, orderNo);
                        });
                    }else{
                        layer.msg(res.message, {icon: 5,anim: 6});
                    }
                })
                    
            });
        },
        openUpload: function (html, renderData, type, truckId, orderNo) {
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
                    method.uploadPics({orderNo: orderNo}, function (res) {
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
                                    //预读本地文件示例，不支持ie8
                                    obj.preview(function(idx, file, result){
                                        console.log(item.pre + index)
                                        $(item.pre + index + "").append('<img src="'+ result +'" alt="'+ file.name +'" class="layui-upload-img pre_img">')
                                    });
                                }
                                ,data: {
                                    loginStaffId: user.staffId,
                                    type: item.type,
                                    truckId: truckId,
                                }
                                ,done: function(res){
                                    if(res.code == "0"){
                                        uploadData[uploadTruckId+""][item.key].push(res.data);
                                        //layer.msg("上传成功", {icon: 1});
                                    }else{
                                        layer.msg(res.message, {icon: 5,anim: 6});
                                    }
                                }
                                ,error: function(){}
                            });
                        });
                    });
                }
            });
        },
        uploadPics: function (options, cb) {
            var data = {
                loginStaffId: user.staffId,
                orderNo: options.orderNo,
                orderType: orderData.orderType
            };
            var truckUpdateReqList = [];
            Object.keys(uploadData).forEach(function (item) {
                var uploadObj = uploadData[item];
                var truckData = { truckId: item*1 }
                truckData.returnImages = uploadObj["returnImagesList"].join(",");
                truckData.startImages = uploadObj["startImagesList"].join(",");
                truckData.fetchImages = uploadObj["fetchImagesList"].join(",");
                truckUpdateReqList.push(truckData);
            });
            data.truckUpdateReqList = truckUpdateReqList;
            edipao.request({
                url: "/admin/order/updateOrder",
                method: "POST",
                data: getParams(data),
            }).done(function (res) {
                cb(res);
            });
            function getParams(data){
                var arr = [];
                Object.keys(data).forEach(function(item){
                  if(data[item] instanceof Array){
                    data[item].forEach(function (item2, index) {
                      Object.keys(item2).forEach(function (item3) {
                        arr.push(item+"["+index+"]"+"."+item3 + "=" + item2[item3]);
                      });
                    })
                  }else{
                    arr.push(item + "=" + data[item]);
                  }
                });
                console.log(arr)
                return encodeURI(arr.join("&"));
            }
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
                    , where: { loginStaffId: user.staffId, orderNo: orderNo }
                    , id: "pre_fee_verify_table"
                    , parseData: function (res) {
                        orderDTOList = res.data.orderDTOList;
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
                                        id: orderId,
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
                                        layer.msg(res.message, {icon: 5,anim: 6});
                                    }
                                });
                            }
                        });
                    },
                    text: {none: "暂无数据"},
                    cols: [[
                        {field: 'key', title: '费用项', sort: false,width: "100px"},
                        {field: 'val', title: '金额', sort: false,width: "100px"},
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
                    , where: { loginStaffId: user.staffId, orderNo: orderNo }
                    , id: "pre_fee_verify_table"
                    , parseData: function (res) {
                        orderDTOList = res.data.orderDTOList;
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
                                        id: orderId,
                                        type: type
                                    }
                                }).done(function (res) {
                                    if(res.code == "0"){
                                        layer.msg("提交成功", {icon: 1,anim: 6});
                                        table.reload("orderList");
                                        layer.close(index);
                                    }else{
                                        layer.msg(res.message, {icon: 5,anim: 6});
                                    }
                                });
                            }
                        });
                    },
                    text: {none: "暂无数据"},
                    cols: [[
                        {field: 'key', title: '费用项', sort: false,width: "100px"},
                        {field: 'val', title: '金额', sort: false,width: "100px"},
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

                    , where: { loginStaffId: user.staffId, orderNo: orderNo }
                    , id: "pre_fee_verify_table"
                    , parseData: function (res) {
                        orderDTOList = res.data.orderDTOList;
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
                                        id: orderId,
                                        type: type
                                    }
                                }).done(function (res) {
                                    if(res.code == "0"){
                                        layer.msg("提交成功", {icon: 1,anim: 6});
                                        table.reload("orderList");
                                        layer.close(index);
                                    }else{
                                        layer.msg(res.message, {icon: 5,anim: 6});
                                    }
                                });
                            }
                        });
                    },
                    text: {none: "暂无数据"},
                    cols: [[
                        {field: 'key', title: '费用项', sort: false,width: "100px"},
                        {field: 'val', title: '金额', sort: false,width: "100px"},
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
                method.getOrder(orderNo).done(function (res) {
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
                                    console.log(data)
                                    edipao.request({
                                        url: "/admin/order/approval/image",
                                        method: "post",
                                        data: {
                                            loginStaffId: user.staffId,
                                            type: type,
                                            id: orderId,
                                            approvalResult: data.result * 1,
                                            approvalRemark: data.remark
                                        }
                                    }).done(function(res){
                                        if(res.code == "0"){
                                            layer.message("提交成功");
                                            layer.close(index);
                                        }else{
                                            layer.msg(data.message, {icon: 5,anim: 6});
                                        }
                                    });
                                }
                            })
                        });
                    }else{
                        layer.msg(data.message, {icon: 5,anim: 6});
                    }
                });
            });
        },
        bindViewPic: function () {
            $(".list_picture_view").unbind().on("click", function (e) {
                var orderNo = e.target.dataset.order;
                var field = e.target.dataset.field;
                var startIndex = 0;
                method.getOrder(orderNo).done(function (res) {
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
                            list: res.data.truckDTOList
                        }, function (html) {
                            layer.open({
                                type: 1,
                                content: html,
                                area: ["600px", "400px"],
                                success: function () {
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
                        layer.msg(data.message, {icon: 5,anim: 6});
                    }
                });
            });
        },
        bindEvents: function(){
            $("#export_data").unbind().on("click", function (e) {
                table.exportFile(mainTable.config.id);
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
                , limits: [20, 40] //每页显示条数可选择
                , request: {
                    pageName: 'pageNo' //页码的参数名称，默认：page
                    , limitName: 'pageSize' //每页数据量的参数名，默认：limit
                }
                , where: { loginStaffId: user.staffId }
                , height: 'full'
                , autoSort: true
                , id: 'orderList'
                , parseData: function (res) {
                    orderDTOList = res.data.orderDTOList;
                    return {
                        "code": res.code, //解析接口状态
                        "msg": res.message, //解析提示文本
                        "count": res.data.totalSize, //解析数据长度
                        "data": res.data.orderDTOList //解析数据列表
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
                var tr = obj.tr; //获得当前行 tr 的DOM对象
                if (layEvent === 'edit') { //编辑
                    top.xadmin.add_tab('修改订单', 'orderMessage/order-edit.html?action=edit&orderNo=' + data.orderNo);
                } else if (layEvent === 'verify') { //审核
                    top.xadmin.add_tab('审核', 'orderMessage/order-view.html?action=verify&orderNo=' + data.orderNo);
                } else if (layEvent === 'view') { //查看
                    top.xadmin.add_tab('查看订单', 'orderMessage/order-view.html?orderNo=' + data.orderNo);
                } else if (layEvent === 'cancel') { //取消
                    var index = layer.open({
                        title: "取消确认",
                        content: "取消后订单将作废，确认继续取消订单？",
                        btn: ["确认", "取消"],
                        yes: function(){
                            edipao.request({
                                url: "/admin/order/cancelOrder",
                                data: {
                                    loginStaffId: user.staffId,
                                    orderNo: data.orderNo
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
        {field: 'orderNo', title: '业务单号', sort: false,minWidth:100},
        {field: 'warehouseNo', title: '仓库单号', sort: false,minWidth:100},
        {field: 'vinCode', title: 'VIN码', sort: false,minWidth:100},
        {field: 'tempLicense', title: '临牌号', sort: false,minWidth:100},
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
        {field: 'customerFullName', title: '客户全称', sort: true},
        {field: 'startWarehouse', title: '发车仓库', sort: false,minWidth:100},
        {field: 'startPark', title: '发车停车场', sort: false,minWidth:100},
        {field: 'startCity', title: '发车城市', sort: false,minWidth:100},
        {field: 'startAddress', title: '发车地址', sort: false,minWidth:100},
        {field: 'startProvince', title: '发车省', sort: false,minWidth:100},
        {field: 'endPark', title: '收车网点', sort: false,minWidth:100},
        {field: 'endProvince', title: '收车省', sort: false,minWidth:100},
        {field: 'endCity', title: '收车城市', sort: false,minWidth:100},
        {field: 'endAddress', title: '收车地址', sort: false,minWidth:100},
        {field: 'transportAssignTime', title: '运输商指派时间', sort: false,minWidth:100},
        {field: 'dispatchTime', title: '调度时间', sort: false,minWidth:100},
        {field: 'openOperator', title: '开单员', sort: false,minWidth:100},
        {field: 'dispatchOperator', title: '调度员', sort: false,minWidth:100,},
        {field: 'fetchOperator', title: '提车员', sort: false,minWidth:100},
        {field: 'deliveryOperator', title: '发运员', sort: false,minWidth:100},
        {
            field: 'driverName', title: '司机信息', sort: false,minWidth:100, templet: function (d) {
                return d.driverName + "(" + d.driverPhone + ")";
            }
        },
        {field: 'driverIdCard', title: '司机身份证', sort: false,minWidth:100, hide: false},
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
            var str3 = "<a class='list_picture pointer blue list_picture_verify' data-orderId="+ d.id +" data-number='5' data-order="+ d.orderNo +"  data-type='2' data-field='fetchStatus' data-truck="+d.truckId+">{{}}</a>";
            var status = "未上传";
            switch(d.fetchStatus*1){
                case 0: 
                    status = "未上传";
                    break;
                case 1:
                    status = "未上传" + str2.replace("{{}}"," 上传");
                    break;
                case 2:
                    status = str.replace("{{}}","查看")+str3.replace("{{}}"," 审核");
                    break;
                case 3:
                    status = str.replace("{{}}","查看");
                    break;
                case 4:
                    status = "已驳回";
                    break;
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
            if(d.returnAuditStatus * 1 == 1){
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
        "returnAuditStatus"
    ];
    var exportHead={};// 导出头部
    var toolField = {title: '操作', toolbar: '#barDemo', align: 'center', fixed: 'right', width: 350};

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