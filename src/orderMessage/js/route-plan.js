layui.config({
base: '../../lib/'
}).extend({
excel: 'layui_exts/excel',
tableFilter: 'TableFilter/tableFilter'
}).use(['jquery', 'table','layer','excel','tableFilter','form', 'upload', 'laytpl', 'laypage', 'laydate'], function () {
    var table = layui.table;
    var $ = layui.jquery;
    var form = layui.form;
    var layer = layui.layer;
    var upload = layui.upload;
    var laytpl = layui.laytpl;
    var edipao = layui.edipao;
    var excel = layui.excel;
    var laypage = layui.laypage
    var laydate = layui.laydate

    function _routePlan(){
        this.user = JSON.parse(sessionStorage.user);
        this.request = { loginStaffId: this.user.staffId };
        this.guideLineId =  edipao.urlGet().guideLineId;
        this.driverReportPoint = [];
        this.pageNumber = 1;
        this.pageSize = 10;
        this.address = '';
        this.loc = {};
        console.log(this.guideLineId) 
    }

    _routePlan.prototype = {
        // 初始化
        init: function(){
            this.getlineOrderData();
            this.getDriverReportList();
            this.renderPageMap();
        },
        // 获取线路数据
        getlineOrderData(){
            var _t = this;
            edipao.request({
                type: 'GET',
                url: '/api/guideline/get',
                data: $.extend({}, _t.request, {
                    lineIds: this.guideLineId
                })
            }).done(function(res) {
                if (res.code == 0) {
                    
                }
            })
        },
        // 获取司机上报数据
        // status 1上报待审2已采纳3取消采纳4已删除
        getDriverReportList: function(){
            var _t = this;
            edipao.request({
                type: 'GET',
                url: '/admin/order/report/getReportByLine',
                data: $.extend({}, _t.request, {
                    page: _t.pageNumber,
                    pageSize: _t.pageSize,
                    line: this.guideLineId
                })
            }).done(function(res) {
                if (res.code == 0) {
                    _t.setLayPage(res.data.count);
                    var getDriverReportTpl = driverReportTpl.innerHTML,
                    reportList = document.getElementById('report-list');
                    laytpl(getDriverReportTpl).render(res.data, function(html){
                        reportList.innerHTML = html;
                    });

                    _t.bindEvents();
                }
            })
        },
        // 设置分页
        setLayPage: function(total){
            let _t = this;
            laypage.render({
                elem: 'footer-laypage',
                count: total,
                layout: ['count', 'prev', 'page', 'next'],
                limit: _t.pageSize,
                jump: function(obj, first){
                    if(first) return;
                    _t.pageNumber = obj.curr;
                    _t.getDriverReportList();
                }
            });
        },
        // 渲染地图
        renderPageMap: function(){
            //凯立德地图API功能
            var point = new Careland.Point(419364916, 143908009);	//创建坐标点
            var map = new Careland.Map('map', point, 15); 			//实例化地图对象
            map.enableAutoResize();                                 //启用自动适应容器尺寸变化
            map.load(); 
        },
        // 监听司机上报类型的选择 和表单提交
        bindDriverReportType(){
            var _t = this;
            form.on('select(driverReportType)', function(data){
                _t.driverReportType =  data.value;
                var getAddReportTpl = addReportTpl.innerHTML,
                addReportDetail = document.getElementById('add-report-detail');
                laytpl(getAddReportTpl).render({
                    type: data.value
                }, function(html){
                    addReportDetail.innerHTML = html;
                    form.render('select');

                    _t.selectReportAddress();
                    // 时间组件格式化
                    laydate.render({
                        elem: '#startTime',
                        type: 'time',
                        range: true,
                        trigger: 'click'
                    });
                });
            })
        },
        // 清空司机上报弹窗数据和内容
        clearDriverReportDetail(){
            // form.val('', {

            // })
        },
        // 提交司机上报数据
        submitDriverReport: function(data){
            var _t = this;
            edipao.request({
                type: 'GET',
                url: '/admin/order/report/report',
                data: $.extend({}, _t.request, {
                    lineId: _t.guideLineId,
                    'report.lineId': _t.guideLineId,
                    'report.reporterType': 1,
                    'report.reporterId': this.user.staffId,
                    'report.type': _t.driverReportType,
                    'report.height': !data.height ? '' : data.height,
                    'report.startTime': !data.time ? '' : data.time.split('-')[0],
                    'report.endTime': !data.time ? '' : data.time.split('-')[1],
                    'report.lng': _t.loc.lng,
                    'report.lat': _t.loc.lat,
                    'report.status': 1,
                    'report.address': _t.loc.name,
                    'report.price': !data.price ? '' : data.price,
                    'report.contactName': !data.contactName ? '' : data.contactName,
                    'report.contactPhone': !data.contactPhone ? '' : data.contactPhone
                })
            }).done(function(res) {
                if(res.code == 0){
                    _t.getDriverReportList();
                }
            })
        },
        // 修改数据状态
        updateDriverReportStatus: function(id, status){
            var _t = this;
            edipao.request({
                type: 'GET',
                url: '/admin/order/report/updateStatus',
                data: $.extend({}, _t.request, {
                    id: id,
                    status: status
                })
            }).done(function(res) {
                if(res.code == 0){
                    _t.getDriverReportList();
                }
            })
        },
        // 绑定页面事件
        bindEvents: function(){
            var _t = this;
            $('#add-report').off('click').on('click', function(){
                layer.open({
                    type: 1,
                    title: "司机上报",
                    area: ['450px', '550px'],
                    content: $("#driver-report-dialog"),
                    btn: ['取消', '确定'],
                    btnAlign: 'c',
                    zIndex:9990, //层优先级
                    cancel: function () {
                        
                    },
                    yes: function(){
                        
                    },
                    btn2: function(){
                        var formData = form.val('report-form');
                        console.log(formData)
                        _t.submitDriverReport(formData);
                    },
                    success: function () {
                        _t.bindDriverReportType();
                    }
                })
            })

            $('.it-del').off('click').on('click', function(e){
                _t.updateDriverReportStatus($(this).data('id'), 4);
            })

            $('.take-report').off('click').on('click', function(e){
                _t.updateDriverReportStatus($(this).data('id'), 2);
            })

            $('.cancel-take-report').off('click').on('click', function(e){
                _t.updateDriverReportStatus($(this).data('id'), 3);
            })
        },
        // 选择上报点地址
        selectReportAddress: function(){
            var _t = this;
            $('#selectMapLocation').off('click').on('click', function(){
                layer.open({
                    type: 1,
                    title: "选择位置",
                    area: ['1000px', '600px'],
                    content: $("#select-map-dialog"),
                    btn: ['取消', '确定'],
                    btnAlign: 'c',
                    zIndex:9991, //层优先级
                    cancel: function () {
                        
                    },
                    btn2: function(){
                        if(_t.loc){
                            $('.location-name').text(_t.loc.name).addClass('select');
                        }
                    },
                    success: function () {
                        //凯立德地图API功能
                        var point = new Careland.Point(419364916, 143908009);	//创建坐标点
                        var map = new Careland.Map('select-map', point, 15); 			//实例化地图对象
                        map.enableAutoResize();                                 //启用自动适应容器尺寸变化
                        map.load(); 
                        
                        //创建一个自动完成的实例
                        var ac = new Careland.Autocomplete({
                            input : "seachLocation",
                            location : map
                        });
                        ac.setLocation(map);
                        ac.setInputForm('seachLocation');
                        ac.addEventListener("onConfirm",function(e){
                            console.log(e.item.poi.pointGb)
                            _t.address = e.item.poi.name;
                            _t.loc = {
                                name: e.item.poi.name,
                                address: e.item.poi.address,
                                lat: e.item.poi.pointGb.lat,
                                lng: e.item.poi.pointGb.lng,
                                GbPoint: e.item.poi.pointGb
                            }
                            ac.hide();
                        });

                        _t.regionMapView(map);
                    }
                })
            })
        },
        // 平移地图到选择的点
        regionMapView(ctx){
            let _t = this;
            $('#regionMapPoint').off('click').on('click', function(){
                var searchTxt = $('#seachLocation').val();
                if(JSON.stringify(_t.loc) != '{}'){
                    ctx.setCenter(_t.loc.GbPoint);
                } else {
                    layer.msg('请选择列表地址', {
                        time: 1500,
                    });
                    // var poiSearch = new Careland.LocalSearch(ctx,{
                    //     map: ctx,
                    //     selectFirstResult: true,
                    //     autoViewport: true
                    // });
                    // poiSearch.search(searchTxt);
                }
            })
        }

    }

    
    var routePlan = new _routePlan();
    routePlan.init();

});
