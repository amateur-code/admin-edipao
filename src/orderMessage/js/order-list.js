layui.use(['form', 'table', 'jquery','layer', 'upload', 'laytpl'], function () {
    var table = layui.table;
    var $ = layui.jquery;
    var form = layui.form;
    var layer = layui.layer;
    var upload = layui.upload;
    var laytpl = layui.laytpl;
  
    table.render({
        elem: '#orderList'
        , url: ipUrl+'admin/order/list'
        , title: '订单列表'
        , method: "get" // 请求方式  默认get
        , page: true //开启分页
        , limit: 20  //每页显示条数
        , limits: [20, 40] //每页显示条数可选择
        , request: {
            pageName: 'pageNumber' //页码的参数名称，默认：page
            , limitName: 'pageSize' //每页数据量的参数名，默认：limit
        }
        , where:{ loginStaffId: 17718571615 }
        , height: 'full'
        , autoSort: true
        , id: 'orderList'
        , parseData: function (res) {
            return {
                "code": res.code, //解析接口状态
                "msg": res.message, //解析提示文本
                "count": res.data.totalSize, //解析数据长度
                "data": res.data.orderDTOList //解析数据列表
            }
        }
        , done: function () {//表格渲染完成的回调
            $(".list_picture").unbind().on("click", function(e){
                var field = e.target.dataset.field;
                var truckId = e.target.dataset.truck;
                $.ajax({
                    url: ipUrl + 'admin/truck/getById',
                    method: "get",
                    data: {truckId: truckId}
                }).done(function(data){
                    var code = data.code;
                    if(code=='0'){
                        layer.open({
                            type: 1, 
                            content: $("#uploadPic").html(), //这里content是一个普通的String,
                            btn: ["取消", "确定"],
                            success: function () {
                                var uploadInst = upload.render({
                                    elem: '#uploadPicBtn' //绑定元素
                                    ,url: '/upload/' //上传接口
                                    ,done: function(res){
                                        //上传完毕回调
                                    }
                                    ,error: function(){
                                        //请求异常回调
                                    }
                                    });
                            }
                        });
                    }else{
                        layer.msg(data.message, {icon: 5,anim: 6});
                    }
                });
            });
        },
        text: {
            none: "暂无数据"
        }
        , cols: [[
            {type: 'checkbox'},
            //{field: 'id', title: 'id', sort: false,minWidth:100, hide: true},
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
                field: 'prePayAmount', title: '预付款金额', sort: false,minWidth:100, hide: false, templet: function (d) {
                    var payStatus = "";
                    if (d.prePayStatus == 1) {
                        payStatus = "申请支付";
                    } else if (d.prePayStatus == 2) {
                        payStatus = "审核中";
                    } else if (d.prePayStatus == 3) {
                        payStatus = "已审核";
                    } else if (d.prePayStatus == 4) {
                        payStatus = "已支付";
                    } else {
                        payStatus = "非法状态";
                    }
                    return d.prePayAmount + "元" + "/" + d.prePayOil + "升-" + payStatus;
                }
            },
            {
                field: 'arrivePayAmount', title: '到付款金额', sort: false,minWidth:100, hide: false, templet: function (d) {
                    var payStatus = "";
                    if (d.arrivePayStatus == 1) {
                        payStatus = "申请支付";
                    } else if (d.arrivePayStatus == 2) {
                        payStatus = "审核中";
                    } else if (d.arrivePayStatus == 3) {
                        payStatus = "已审核";
                    } else if (d.arrivePayStatus == 4) {
                        payStatus = "已支付";
                    } else {
                        payStatus = "非法状态";
                    }
                    return d.arrivePayAmount + "元-" + payStatus;
                }
            },
            {
                field: 'tailPayAmount', title: '尾款金额', sort: false,minWidth:100, hide: false, templet: function (d) {
                    var payStatus = "";
                    if (d.tailPayStatus == 1) {
                        payStatus = "申请支付";
                    } else if (d.tailPayStatus == 2) {
                        payStatus = "审核中";
                    } else if (d.tailPayStatus == 3) {
                        payStatus = "已审核";
                    } else if (d.tailPayStatus == 4) {
                        payStatus = "已支付";
                    } else {
                        payStatus = "非法状态";
                    }
                    return d.tailPayAmount + "元-" + payStatus;
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
                var str = "<a class='list_picture' data-field='fetchStatus' data-truck="+d.truckId+">{{}}</a>";
                var str2 = "<a class='list_picture' data-field='returnAuditStatus' data-truck="+d.truckId+">{{}}</a>";
                var status = "未上传";
                switch(d.fetchStatus*1){
                    case 0:
                        status = "未上传" + str2.replace("{{}}"," 上传");
                        break;
                    case 1:
                        status = "未上传" + str2.replace("{{}}"," 上传");
                        break;
                    case 2:
                        status = str.replace("{{}}","查看")+str2.replace("{{}}","上传");
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
                var str = "<a class='list_picture' data-field='startAuditStatus' data-truck="+d.truckId+">{{}}</a>";
                var str2 = "<a class='list_picture' data-field='returnAuditStatus' data-truck="+d.truckId+">{{}}</a>";
                var status = "未上传";
                switch(d.startAuditStatus*1){
                    case 0:
                        status = "未上传" + str2.replace("{{}}"," 上传");
                        break;
                    case 1:
                        status = "未上传" + str2.replace("{{}}"," 上传");
                        break;
                    case 2:
                        status = str.replace("{{}}","查看")+str2.replace("{{}}","上传");
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
            {field: 'returnAuditStatus', title: '交车单审核状态', sort: false,minWidth:100, hide: false, templet: function(d){
                var str = "<a class='list_picture' data-field='returnAuditStatus' data-truck="+d.truckId+">{{}}</a>";
                var str2 = "<a class='list_picture' data-field='returnAuditStatus' data-truck="+d.truckId+">{{}}</a>";
                var status = "未上传";
                switch(d.returnAuditStatus*1){
                    case 0:
                        status = "未上传" + str2.replace("{{}}"," 上传");
                        break;
                    case 1:
                        status = "未上传" + str2.replace("{{}}"," 上传");
                        break;
                    case 2:
                        status = str.replace("{{}}","查看")+str2.replace("{{}}","上传");
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
            {field: 'totalIncome', title: '收入总金额', sort: false,minWidth:100, hide: true},
            {field: 'totalManageFee', title: '管理费总金额', sort: false,minWidth:100, hide: true},
            {field: 'openOperatorPhone', title: '开单员手机', sort: false,minWidth:100, hide: true},
            {field: 'fetchOperatorPhone', title: '提车员手机', sort: false,minWidth:100, hide: true},
            {field: 'dispatchOperatorPhone', title: '调度员手机', sort: false,minWidth:100, hide: true},
            {field: 'deliveryOperatorPhone', title: '发运员手机', sort: false,minWidth:100, hide: true},
            {field: 'followOperator', title: '跟单员', sort: false,minWidth:100, hide: true},
            {field: 'followOperatorPhone', title: '跟单员手机', sort: false,minWidth:100, hide: true},
            {field: 'department', title: '归属部门', sort: false,minWidth:100, hide: true},
            {field: 'driverPhone', title: '司机手机', sort: false,minWidth:100, hide: true},
            {field: 'driverCertificate', title: '司机驾照', sort: false,minWidth:100, hide: true},
            {field: 'driverMileage', title: '承运公里数', sort: false,minWidth:100, hide: true},
            {field: 'masterFlag', title: '下车标识', sort: false,minWidth:100, hide: true},
            {field: 'productCode', title: '产品代码', sort: false,minWidth:100, hide: true},
            {field: 'model', title: '车型', sort: false,minWidth:100, hide: true},
            {field: 'shaftNum', title: '轴数', sort: false,minWidth:100, hide: true},
            {field: 'power', title: '马力', sort: false,minWidth:100, hide: true},
            {field: 'gpsDeviceCode', title: 'gps设备编号', sort: false,minWidth:100, hide: true},
            {field: 'latestArriveTime', title: '最迟到达时间', sort: false,minWidth:100, hide: true},
            {field: 'customerMileage', title: '客户里程', sort: false,minWidth:100, hide: true},
            {field: 'pricePerMeliage', title: '收入单价', sort: false,minWidth:100, hide: true},
            {field: 'income', title: '收入', sort: false,minWidth:100, hide: true},
            {field: 'manageFee', title: '管理费', sort: false,minWidth:100, hide: true},
            {field: 'saleRemark', title: '销售备注', sort: false,minWidth:100, hide: true},
            {field: 'storageAndDeliverRemark', title: '储运备注', sort: false,minWidth:100, hide: true},
            {field: 'dealerRemark', title: '经销商备注', sort: false,minWidth:100, hide: true},
            {field: 'deliverResourceRemark', title: '委改库备注', sort: false,minWidth:100, hide: true},
            {field: 'transportRemark', title: '运输商备注', sort: false,minWidth:100, hide: true},
            {field: 'prePayOil', title: '预付款油升数', sort: false,minWidth:100, hide: true},
            {
                field: 'prePayStatus', title: '预付款状态', sort: false,minWidth:100, hide: true, templet: function (d) {
                    if (d.prePayStatus == 1) {
                        return "申请支付";
                    } else if (d.prePayStatus == 2) {
                        return "审核中";
                    } else if (d.prePayStatus == 3) {
                        return "已审核";
                    } else if (d.prePayStatus == 4) {
                        return "已支付";
                    } else {
                        return "非法状态";
                    }
                }
            },
            {field: 'prePayFeeItems', title: '预付款费用项', sort: false,minWidth:100, hide: true},
            {
                field: 'arrivePayStatus', title: '到付款状态', sort: false,minWidth:100, hide: true, templet: function (d) {
                    if (d.arrivePayStatus == 1) {
                        return "申请支付";
                    } else if (d.arrivePayStatus == 2) {
                        return "审核中";
                    } else if (d.arrivePayStatus == 3) {
                        return "已审核";
                    } else if (d.arrivePayStatus == 4) {
                        return "已支付";
                    } else {
                        return "非法状态";
                    }
                }
            },
            {field: 'arrivePayFeeItems', title: '到付款费用项', sort: false,minWidth:100, hide: true},
  
            
            {field: 'tailPayBillDate', title: '尾款账期', sort: false,minWidth:100, hide: true},
            {
                field: 'tailPayStatus', title: '尾款状态', sort: false,minWidth:100, hide: true, templet: function (d) {
                    if (d.tailPayStatus == 1) {
                        return "申请支付";
                    } else if (d.tailPayStatus == 2) {
                        return "审核中";
                    } else if (d.tailPayStatus == 3) {
                        return "已审核";
                    } else if (d.tailPayStatus == 4) {
                        return "已支付";
                    } else {
                        return "非法状态";
                    }
                }
            },
            {field: 'tailPayFeeItems', title: '尾款费用项', sort: false,minWidth:100, hide: true},
  
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
  
            {
                field: 'fetchStatus', title: '提车状态', sort: false,minWidth:100, hide: true, templet: function (d) {
                    if (d.fetchStatus == 1) {
                        return "未上传";
                    } else if (d.fetchStatus == 2) {
                        return "已上传未审核";
                    } else if (d.fetchStatus == 3) {
                        return "已上传已审核";
                    } else if (d.fetchStatus == 4) {
                        return "已驳回";
                    } else {
                        return "非法状态";
                    }
                }
            },
            {field: 'fetchImagesUploadTime', title: '提车上传时间', sort: false,minWidth:100, hide: true},
            {field: 'fetchImagesAuditTime', title: '提车审核时间', sort: false,minWidth:100, hide: true},
            {field: 'fetchImagesRejectTime', title: '提车驳回时间', sort: false,minWidth:100, hide: true},
            {
                field: 'startAuditStatus', title: '发车单审核状态', sort: false,minWidth:100, hide: true, templet: function (d) {
                    if (d.fetchStatus == 1) {
                        return "未上传";
                    } else if (d.fetchStatus == 2) {
                        return "已上传未审核";
                    } else if (d.fetchStatus == 3) {
                        return "已上传已审核";
                    } else if (d.fetchStatus == 4) {
                        return "已驳回";
                    } else {
                        return "非法状态";
                    }
                }
            },
            {field: 'startImagesUploadTime', title: '发车单上传时间', sort: false,minWidth:100, hide: true},
            {field: 'startImagesAuditTime', title: '发车单审核时间', sort: false,minWidth:100, hide: true},
            {field: 'startImagesRejectTime', title: '发车单驳回时间', sort: false,minWidth:100, hide: true},
            {
                field: 'returnAuditStatus', title: '交接单审核状态', sort: false,minWidth:100, hide: true, templet: function (d) {
                    if (d.fetchStatus == 1) {
                        return "未上传";
                    } else if (d.fetchStatus == 2) {
                        return "已上传未审核";
                    } else if (d.fetchStatus == 3) {
                        return "已上传已审核";
                    } else if (d.fetchStatus == 4) {
                        return "已驳回";
                    } else {
                        return "非法状态";
                    }
                }
            },
            {field: 'returnImagesUploadTime', title: '交接单上传时间', sort: false,minWidth:100, hide: true},
            {field: 'returnImagesAuditTime', title: '交接单审核时间', sort: false,minWidth:100, hide: true},
            {field: 'returnImagesRejectTime', title: '交接单驳回时间', sort: false,minWidth:100, hide: true},
  
            {field: 'createTime', title: '创建时间', sort: false,minWidth:100, hide: true},
            {field: 'updateTime', title: '更新时间', sort: false,minWidth:100, hide: true},
  
            {title: '操作', toolbar: '#barDemo', align: 'center', fixed: 'right', width: 300}
        ]]
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
            console.log(0)
            xadmin.add_tab('修改订单', '../order-edit.html?id=' + data.id);
        } else if (layEvent === 'audit') {//审核
            xadmin.open('审核', './demo-view.html?id=' + data.id, 1024, 600);
        } else if (layEvent === 'view') {//查看
            xadmin.open('查看', './demo-view.html?id=' + data.id, 1024, 600);
        } else if (layEvent === 'cancel') {//取消
            xadmin.open('取消', './demo-view.html?id=' + data.id, 1024, 600);
        } else if (layEvent === 'log') {//日志
            xadmin.open('日志', './demo-view.html?id=' + data.id, 1024, 600);
        }
    });
  });