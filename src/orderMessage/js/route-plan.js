layui.config({
base: '../lib/'
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
        this.pageSize = 5;
        this.address = '';
        this.loc = {};
        this.line = '';
        this.map = null;
    }

    _routePlan.prototype = {
        // 初始化
        init: function(){
            this.renderPageMap();
            this.getDriverReportList();
        },
        // 渲染地图
        renderPageMap: function(){
            try{
                //凯立德地图API功能
                var point = new Careland.Point(419364916, 143908009);	//创建坐标点
                var map = new Careland.Map('map', point, 12); 			//实例化地图对象
                map.enableAutoResize();                                 //启用自动适应容器尺寸变化
                map.load();
                this.map = map;
            } catch (err){
                console.log(err)
            }

            this.getlineOrderData();
        },
        // 获取线路数据
        getlineOrderData(){
            var _t = this;
            edipao.request({
                type: 'GET',
                url: '/admin/line/detail',
                data: $.extend({}, _t.request, {
                    guideLineId: this.guideLineId
                })
            }).done(function(res) {
                if (res.code == 0) {
                    console.log(res);
                    // res.data.lineSource = 1;
                    var getTabConentTpl = tabConentTpl.innerHTML,
                        tabConent = document.getElementById('tabConent');
                    laytpl(getTabConentTpl).render(res.data, function(html){
                        tabConent.innerHTML = html;
                    });
                    _t.line = JSON.parse(res.data.line);
                    _t.bindLineEvents();
                }
            })
        },
        // 地图规划
        updateLine: function(){
            var _t = this;
            if(!_t.map) return;
            $.getJSON("http://api.careland.com.cn/api/v1/navi/routeplan?origin=410817199,81362500&destination=419364916,143908009&prefer=1-2-16&evade=32&avoid=2&callback=&ak=6012dcd6278a2d4db3840604&xytype=2",function(json){          
                // 提交保存json
                if(json.errorCode != 0 ){
                    layer.msg(json.errorMessage, {
                        time: 1500,
                    });
                    return;
                }
                // 上传到后台保存接口

                // _t.paintLine(_t.map, json.routeInfo[0].partPoints);
            });
            
        },
        // 根据轨迹回放
        paintLine: function(ctx, partPoints){
            var point_s = partPoints.join(';');
            var endStr = point_s.charAt(point_s.length-1);
            if(endStr == ';'){
                point_s = point_s.substring(0, point_s.length-1)
            }
            //启用地图平移缩放控件(骨架)
            var control = new Careland.Navigation();
            control.anchor = CLDMAP_ANCHOR_TOP_RIGHT;					//设置位置为右上角
            control.offset = new Careland.Size(10, 30);					//设置位置偏移
            ctx.addMapControl(control);

            //启用比例尺
            var scale = new Careland.Scale();
            scale.anchor = CLDMAP_ANCHOR_BOTTOM_LEFT;					//设置位置为左下角
            scale.offset = new Careland.Size(10, 5);					//设置位置偏移
            ctx.addMapControl(scale);
            //轨迹点数据
            // var point_s = '410459704,81245491;410460115,81246606;410460115,81246606;410460116,81246608;410460407,81246987;410462731,81252674;410462817,81253601;410463136,81254073;410463136,81254073;410463140,81254073;410476381,81254443;410499410,81254809;410525595,81254855;410532750,81255032;410535326,81255305;410537868,81255842;410539685,81255764;410543430,81255148;410549589,81255260;410549589,81255260;410549592,81255260;410560961,81255344;410561837,81254964;410562183,81254509;410562345,81253858;410562223,81253303;410561837,81252806;410560973,81252432;410560134,81252599;410559521,81253260;410559022,81254492;410559131,81255585;410559131,81255585;410559130,81255585;410558967,81256690;410559317,81258621;410561334,81267813;410561626,81269853;410564521,81283820;410568320,81313814;410570480,81328979;410570903,81333255;410571516,81342767;410571494,81346588;410571947,81350906;410572823,81353776;410574458,81356888;410584603,81372959;410585419,81374338;410586045,81375796;410586699,81378594;410586713,81389426;410589126,81398478;410589181,81401063;410588723,81403645;410587961,81405576;410586330,81408565;410584687,81412160;410584157,81413691;410583714,81415789;410582271,81425344;410581802,81436938;410582010,81445391;410581941,81452201;410581941,81452201;410581941,81452202;410582391,81454347;410582535,81456374;410583101,81457041;410584054,81457315;410593186,81455891;410595845,81455720;410607150,81454103;410610978,81454127;410613826,81454537;410617915,81455792;410619211,81456335;410621724,81457727;410624354,81459670;410627325,81462801;410628905,81465177;410630156,81467718;410630922,81469995;410631498,81473289;410631605,81476073;410630989,81505620;410631140,81509035;410631474,81511659;410632430,81515935;410633472,81518934;410634787,81521932;410636688,81525000;410638498,81527285;410639650,81528545;410642282,81530812;410644721,81532472;410648647,81534472;410651359,81535429;410653973,81536092;410657726,81536602;410675061,81536826;410678201,81536675;410684351,81536022;410688363,81536051;410691950,81536450;410698852,81537626;410712985,81539314;410717554,81540272;410721552,81541422;410725502,81542898;410746927,81551747;410753189,81553347;410756553,81553850;410760851,81554119;410764527,81554010;410766729,81553853;410785098,81551196;410787961,81551068;410793255,81551322;410798051,81552194;410800145,81552753;410806151,81554693;410818483,81559054;410839028,81565863;410843687,81566995;410848560,81567894;410855642,81568556;410855642,81568556;410861742,81568618;410869822,81567924;410875930,81566754;410891755,81563029;410891755,81563029;410891757,81563028;410906639,81559449;410911617,81559047;410914521,81559025;410940072,81560522;410942566,81561004;410945658,81562014;410948923,81563584;410950009,81564335;410952071,81566032;410954586,81568904;410955772,81570698;410956797,81572673;410964235,81593544;410965612,81596130;410967907,81599315;410970571,81602005;410973317,81604173;410975204,81605402;410994994,81615657;410996676,81616693;411000252,81619628;411002785,81622404;411005686,81626726;411006157,81628015;411012752,81642321;411014260,81644861;411015905,81646903;411018466,81649333;411020208,81650590;411026558,81654578;411029043,81656619;411031278,81658994;411033386,81662143;411034924,81665842;411035230,81666831;411035395,81670312;411035704,81671492;411037810,81675000;411038304,81676166;411040606,81683298;411041519,81684992;411042640,81686577;411043799,81687886;411046708,81690222;411048099,81691029;411050231,81691949;411053583,81692849;411068358,81695719;411072749,81696857;411074681,81697740;411080050,81701229;411082142,81702288;411085985,81703625;411092627,81705276;411095578,81706384;411095578,81706384;411095579,81706384;411108244,81711658;411111598,81711815;411114374,81712863;411124508,81720082;411131625,81725674;411144563,81735330;411147977,81737623;411152001,81739583;411156029,81740958;411159229,81741668;411162755,81742089;411167695,81742053;411171712,81741535;411174702,81740795;411178091,81739615;411226328,81718964;411230949,81717300;411235827,81716386;411239969,81716243;411242115,81716382;411245006,81716857;411248708,81717871;411251573,81719050;411254800,81720834;411273221,81733078;411283886,81739736;411294721,81745650;411302087,81749197;411309629,81752458;411314151,81753990;411320073,81755548;411326613,81756611;411337777,81757848;411343516,81758744;411351141,81760632;411357586,81762990;411361044,81764520;411366755,81767540;411408700,81791001;411414920,81794342;411472084,81821888;411475736,81824280;411477368,81825620;411479828,81828102;411482066,81831082;411483695,81834130;411484380,81836001;411484674,81837300;411484890,81840034;411483585,81848833;411483585,81848833;411483585,81848835;411483972,81850094;411483944,81852172;411484741,81860129;411484741,81860129;411484741,81860130;411485084,81861264;411485844,81865562;411486215,81866247;411487051,81866892;411494463,81867641;411497011,81868136;411501798,81869282;411509025,81871567;411512259,81873084;411514734,81873755;411515453,81874610;411516435,81875333;411523863,81878633;411528124,81879805;411545840,81883988;411550513,81885367;411555249,81886985;411563900,81890618;411568957,81893896;411606882,81924826;411610896,81928285;411613543,81930880;411617880,81935902;411619873,81938663;411622476,81942876;411632195,81961883;411634220,81965309;411636014,81967767;411638794,81970843;411641940,81973558;411645571,81975968;411649320,81977831;411652255,81978941;411655228,81979787;411659195,81980522;411662692,81980831;411750000,81982463;411757170,81983081;411761238,81983727;411765998,81984762;411772014,81986589;411776991,81988524;411781383,81990590;411785733,81993001;411836332,82025914;411836332,82025914;411836334,82025916;411837066,82026551;411852579,82036698;411859098,82040634;411862368,82042362;411868207,82045066;411873077,82046912;411879878,82048962;411884446,82050000;411892022,82051190;411899407,82051752;411980374,82054851;411985493,82055613;411989597,82056685;411994254,82058419;411998501,82060567;412002173,82062940;412005818,82065906;412009641,82069840;412011517,82072270;412013655,82075617;412014698,82077565;412021041,82091737;412023617,82096591;412025016,82098707;412028314,82103077;412032075,82106981;412036445,82110638;412039959,82113087;412071880,82134302;412077052,82137522;412080578,82140042;412091345,82147033;412098319,82150727;412104172,82153150;412114884,82156561;412138821,82163700;412147038,82166350;412158611,82170680;412167680,82174607;412173313,82177284;412185674,82183946;412193164,82188476;412200000,82193050;412225159,82211175;412231533,82215565;412243207,82222911;412252176,82227976;412262254,82233079;412273386,82238064;412309001,82251985;412314937,82254532;412320305,82257209;412324296,82259453;412332597,82264868;412337580,82268714;412342496,82273028;412347311,82277861;412350871,82281904;412353194,82284803;412356819,82289812;412360321,82295411;412383209,82336188;412384713,82338352;412387221,82341276;412390424,82344187;412393349,82346285;412396135,82347894;412400749,82350000;412446874,82369184;412456620,82373151;412461387,82374835;412467462,82376439;412471516,82377163;412478613,82377936;412498887,82379626;412501887,82380080;412504536,82380628;412506948,82381387;412510407,82382762;412514470,82384980;412517693,82387261;412559916,82419535;412559916,82419535;412559917,82419536;412566169,82423009;412568203,82423886;412569249,82424086;412570289,82424083;412574611,82423484;412575938,82423785;412577131,82424586;412577909,82426123;412578026,82427500;412577488,82429519;412567623,82452476;412566212,82454433;412564085,82456224;412561823,82457226;412559149,82457809;412556907,82457831;412553257,82457347;412539604,82453589;412536699,82453400;412535702,82453482;412534256,82453924;412532916,82454857;412531941,82456227;412531582,82457315;412531421,82458473;412531093,82463909;412531330,82471513;412530899,82476314;412530125,82479527;412529167,82482157;412527967,82484842;412525735,82488632;412522882,82492333;412491816,82525799;412488292,82529932;412486548,82532685;412485348,82535008;412484224,82537760;412483388,82541294;412483216,82545328;412483474,82548310;412484188,82551496;412485172,82554202;412486813,82557473;412488996,82560547;412491068,82563062;412521267,82598738;412524745,82603659;412527406,82608416;412528336,82610528;412530428,82616571;412531149,82619603;412531682,82623064;412532044,82627199;412532039,82630122;412531386,82636326;412530418,82640613;412529690,82643005;412527891,82647695;412526966,82649624;412525353,82652404;412524257,82654157;412510166,82673672;412508048,82677061;412505734,82681890;412504876,82684437;412504203,82687097;412503683,82690762;412503540,82692620;412503652,82695942;412504019,82698719;412505660,82704076;412506984,82707656;412508431,82710543;412509986,82713243;412525033,82736106;412531252,82744705;412537500,82752678;412550739,82768858;412560748,82781817;412563006,82784495;412564636,82787029;412566918,82791049;412568322,82794131;412569611,82798199;412570540,82802330;412570967,82806606;412571027,82810660;412570579,82815103;412569520,82822019;412566993,82837672;412566120,82841947;412564132,82847543;412561986,82851689;412559942,82855154;412556622,82859674;412550932,82865603;412545385,82869219;412541715,82871166;412522369,82880509;412516378,82883648;412510001,82887290;412502301,82892716;412498887,82895463;412493701,82900257;412488085,82906259;412484322,82911083;412479931,82917780;412476170,82923094;412471594,82930325;412454983,82955086;412449472,82964115;412447219,82968312;412445811,82971473;412441120,82984395;412439961,82989234;412438996,82994161;412435676,83015511;412434700,83020955;412433060,83027842;412430980,83034498;412426915,83045077;412407384,83087394;412405394,83092163;412403848,83096059;412402261,83100880;412401199,83104655;412400926,83106562;412400926,83106562;412400926,83106563;412401355,83110673;412402047,83114160;412402438,83115479;412403743,83118473;412404187,83120291;412403921,83122010;412403413,83122880;412400176,83125590;412398609,83127428;412398104,83128389;412397503,83130719;412398216,83147747;412399261,83162648;412400655,83188035;412400693,83190606;412400463,83194939;412400044,83198682;412398447,83206914;412396957,83212141;412395416,83216341;412392860,83221801;412389063,83228861;412380355,83242960;412378631,83246539;412377548,83250390;412377026,83253055;412376853,83256423;412376853,83256423;412376853,83256424;412376910,83258997;412378322,83276124;412381901,83312340;412386833,83366666;412389118,83387857;412389674,83390591;412390524,83393571;412392753,83399060;412395236,83403498;412407200,83421217;412408736,83424454;412409375,83426296;412410036,83429981;412409996,83433801;412409620,83436172;412407914,83440890;412406750,83442901;412397091,83456211;412397091,83456211;412397089,83456213;412397028,83457083;412397251,83458038;412406378,83464117;412413148,83467966;412417038,83469939;412418067,83470677;412419786,83472459;412424472,83478445;412436329,83488010;412445260,83493110;412448103,83494359;412451433,83495040;412451943,83508559;412452591,83509983;412455637,83514350;412455896,83515041;412455540,83515935;412453815,83516519;412452648,83517450;412451651,83519036;412451603,83519971;412451905,83520565;412454953,83524399;412456292,83525863;412456996,83526365;412456467,83527293;412455879,83527854;412455158,83529069;412454095,83530369;412450871,83533780;412450162,83536744;412449968,83539250;412449145,83542770;412447857,83547525;412444664,83557146;412444192,83559515;412443641,83560728;412440272,83558982;412435572,83558771';
            
            var tmp = point_s.split(';');   
            var data = []; //整理之后的轨迹点
            var speed = 30; //速度
            let d = -1; //每100个切割一段轨迹 
            var linestyles = [];
            for(var i in tmp){
                if(i%100 == 0){//每100个切割一段轨迹，
                    d++;
                    data[d] = [];
                    linestyles[linestyles.length] = new Careland.LineStyle({color:getColor(),selectedColor:getColor(),size:6,selectedSize:6,opacity:50});
                }
                var tmp1 = tmp[i].split(',');
                var l = data[d].length;
                data[d][l] = {};
                data[d][l].Point = new Careland.GbPoint(tmp1[1], tmp1[0]);
                data[d][l].IconType = CLDMAP_TRACK_ICON_TRUCK;
            }
            var trackHandler = new Careland.Track();
            trackHandler.clear();
            trackHandler.setLoop(false); //是否播放结束继续播放
            trackHandler.isShowPoint = false; 
            trackHandler.isShowline = true;
            trackHandler.isShowPointTip = true;
            trackHandler.isShowPointText = false;
            trackHandler.setDefaultStyles({trackLineStyles:linestyles})
            var trackOrderCache = trackHandler.init(data);
            trackHandler.setSpeed(speed);
            trackHandler.addEventListener('onPlay', function (index) {
                var count = trackHandler.getCount();
            });
            trackHandler.start();//开始

            function getColor(){    
                var c = ['#FF0000','#FAFAD2','#F08080','#EECFA1','#CD6090','#BDBDBD','#999999','#8B2252','#551A8B','#242424','#00FFFF','#EEEE00'];
                rand = random(0, 12)
                return c[rand]
            }

            function random(lower, upper) {
                return Math.floor(Math.random() * (upper - lower)) + lower;
            }
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
                    if(_t.pageNumber == 1){
                        _t.setLayPage(res.data.count);
                    }
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
                    _t.pageNumber = obj.curr;
                    if(first) return;
                    _t.getDriverReportList();
                }
            });
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

                    var ac = new Careland.Autocomplete({
                        input : "seach-location-input",
                        location : _t.map
                    });
                    ac.setLocation(_t.map);
                    ac.setInputForm('seach-location-input');
                    ac.addEventListener("onConfirm",function(e){
                        _t.loc = {
                            name: e.item.poi.name,
                            address: e.item.poi.address,
                            lat: e.item.poi.pointGb.lat,
                            lng: e.item.poi.pointGb.lng,
                            GbPoint: e.item.poi.pointGb
                        }
                        ac.hide();
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
                    var txt = '已删除';
                    switch(status){
                        case 4:
                            txt = '已删除';
                            break;
                        case 2:
                            txt = '已采纳';
                            break; 
                        case 3:
                            txt = '取消采纳';
                            break;  
                    }
                    layer.msg(txt, {
                        time: 1500,
                    });
                    _t.getDriverReportList();
                }
            })
        },
         // 绑定tab事件
         bindLineEvents: function(){
            var _t = this;
            $('.limit-choose').off('click').on('click', function(e){
                layer.msg('该功能未开放', {
                    time: 1500,
                });
            })

            $('.choose-map-line').off('click').on('click', function(e){
                _t.updateLine();
            })

            $('.playLine').off('click').on('click', function(e){
                if(!_t.line) return;
                _t.paintLine(_t.map, _t.line.routeInfo[0].partPoints);
            })
        },
        // 绑定司机上报页面事件
        bindEvents: function(){
            var _t = this;
            $('#add-report').off('click').on('click', function(){
                layer.open({
                    type: 1,
                    title: "司机上报",
                    area: ['450px', '530px'],
                    content: $("#driver-report-dialog"),
                    btn: ['取消', '确定'],
                    btnAlign: 'c',
                    zIndex:9990, //层优先级
                    end: function () {
                        document.getElementById('add-report-detail').innerHTML = '';
                        form.val("report-form", { //formTest 即 class="layui-form" 所在元素属性 lay-filter="" 对应的值
                            "driverReportType": ""
                        });
                    },
                    shadeClose: true,
                    btn2: function(){
                        var formData = form.val('report-form');
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

            // $('#seach-location-input').

        },
        // 选择上报点地址
        selectReportAddress: function(){
            var _t = this;
            $('#selectMapLocation').off('click').on('click', function(){
                layer.open({
                    type: 1,
                    title: "选择位置",
                    area: ['900px', '600px'],
                    content: $("#select-map-dialog"),
                    btn: ['取消', '确定'],
                    btnAlign: 'c',
                    zIndex:9991, //层优先级
                    cancel: function () {
                        _t.loc = {};
                    },
                    btn2: function(){
                        if(_t.loc){
                            $('#seach-location-input').val(_t.loc.name);
                        }
                    },
                    success: function () {
                        //凯立德地图API功能
                        var point = new Careland.Point(419364916, 143908009);
                        var map = new Careland.Map('select-map', point, 15); 
                        map.enableAutoResize();      
                        map.load(); 

                        _t.regionMapView(map);
                    }
                })
            })
        },
        // 获取点击点的坐标数据
        regionMapView(map){
            var _t = this;

            var myGeo = new Careland.Geocoder();

            var layer = new Careland.Layer('point', 'layer');
            var style = new Careland.PointStyle({offsetX:-11,offsetY:-30,textOffsetX:-5,textOffsetY:-30,src:'../../images/center.png',fontColor:'#000'});
            layer.setStyle(style);
            map.addLayer(layer);

            var mapInfoWin = new Careland.InfoWindow();
            mapInfoWin.setOffset(new Careland.Size(0, -22));

            $('#regionMapPoint').off('click').on('click', function(){
                var searchTxt = $('#seachLocation').val();
                var poiSearch = new Careland.LocalSearch(map,{
                    map: map,
                    selectFirstResult:false,
                    autoViewport:true,
                    onMarkersSet: function(pois){
                        layui.each(pois, function(v, k){
                            var marker = k.marker;
                            marker.addEventListener('click', function(e){
                                e.event.defaultPrevented = true;
                                layer.clear();
                                myGeo.getLocation(e.point,function(data){
                                    
                                    _t.setViewData(mapInfoWin, marker, data)
                                });
                            })
                        })
                    },
                });
                poiSearch.search(searchTxt);
            })

            	
            map.addEventListener('click', function(point){
                var point = point;
                if(!point || typeof (point) != "object"){
                    return;
                }
                myGeo.getLocation(point,function(data){
                    layer.clear();
                    //创建文本标注点
                    var marker = new Careland.Marker('image');
                    marker.setPoint(point);
                    layer.add(marker);

                    _t.setViewData(mapInfoWin, marker, data);
                });
                
            });

        },
        // 设置视图显示和数据
        setViewData: function(mapInfoWin, marker, data){
            $('#seachLocation').val(data.address);
            $('#select-address').text(data.address);
            mapInfoWin.setContent('当前地址：' + data.address);
            mapInfoWin.redraw();
            marker.openInfoWindow(mapInfoWin);
            this.loc = {
                name: data.address,
                address: data.address,
                lat: edipao.kcodeToGb(data.kcode).lat,
                lng: edipao.kcodeToGb(data.kcode).lng,
                GbPoint: {
                    lat: edipao.kcodeToGb(data.kcode).lat,
                    lng: edipao.kcodeToGb(data.kcode).lng,
                }
            }
        }

    }
    
    var routePlan = new _routePlan();
    routePlan.init();

});




