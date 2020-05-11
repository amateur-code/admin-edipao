﻿$.fn.xcity = function(pName,cName,aName){

    this.p = $(this).find('select[lay-filter=province]');

    this.c = $(this).find('select[lay-filter=city]');

    this.a = $(this).find('select[lay-filter=area]');

    this.cityList = [];

    this.reaList = [];

    this.showP  = function(provinceList) {

        this.p.html('');

        is_pName = false;
        
        for (var i in provinceList) {
            
            if(pName==provinceList[i].name){
                is_pName = true;
                this.cityList = provinceList[i].cityList;
                this.p.append("<option selected value='"+provinceList[i].name+"'>"+provinceList[i].name+"</option>")
            }else{
                this.p.append("<option value='"+provinceList[i].name+"'>"+provinceList[i].name+"</option>")
            }
        }
        if(!is_pName){
            this.cityList = provinceList[0].cityList;
        }
        
    }

    this.showC = function (cityList) {

        this.c.html('');

        is_cName = false;

        for (var i in cityList) {
            if(cName==cityList[i].name){
                is_cName = true;
                this.areaList = cityList[i].areaList;
                this.c.append("<option selected value='"+cityList[i].name+"'>"+cityList[i].name+"</option>")
            }else{
                this.c.append("<option value='"+cityList[i].name+"'>"+cityList[i].name+"</option>")
            }
        }

        if(!is_cName){
            this.areaList = cityList[0].areaList;
        }
    }

    this.showA = function (areaList) {
        this.a.html('');

        for (var i in areaList) {
            
            if(aName==areaList[i]){
                this.a.append("<option selected value='"+areaList[i]+"'>"+areaList[i]+"</option>")
            }else{
                this.a.append("<option value='"+areaList[i]+"'>"+areaList[i]+"</option>")
            }
        }
    }

    this.showP(provinceList);
    this.showC(this.cityList);
    this.showA(this.areaList);

    form.render('select');

    form.on('select(province)', function(data){
        var pName = data.value;
        $(data.elem).parents(".x-city").xcity(pName);
    });

    form.on('select(city)', function(data){
        var cName = data.value;
        var pName = $(data.elem).parents(".x-city").find('select[lay-filter=province]').val();
        console.log(pName);
        $(data.elem).parents(".x-city").xcity(pName,cName);
    });

    return this;
}
var provinceList = [
    {
      name: "北京市",
      cityList: [
        { name: "北京市" },
      ],
    },
    {
      name: "天津市",
      cityList: [
        { name: "天津市" },
      ],
    },
    {
      name: "河北省",
      cityList: [
        { name: "石家庄市" },
        { name: "唐山市" },
        { name: "秦皇岛市" },
        { name: "邯郸市" },
        { name: "邢台市" },
        { name: "保定市" },
        { name: "张家口市" },
        { name: "承德市" },
        { name: "沧州市" },
        { name: "廊坊市" },
        { name: "衡水市" },
      ],
    },
    {
      name: "山西省",
      cityList: [
        { name: "太原市" },
        { name: "大同市" },
        { name: "阳泉市" },
        { name: "长治市" },
        { name: "晋城市" },
        { name: "朔州市" },
        { name: "晋中市" },
        { name: "运城市" },
        { name: "忻州市" },
        { name: "临汾市" },
        { name: "吕梁市" },
      ],
    },
    {
      name: "内蒙古自治区",
      cityList: [
        { name: "呼和浩特市" },
        { name: "包头市" },
        { name: "乌海市" },
        { name: "赤峰市" },
        { name: "通辽市" },
        { name: "鄂尔多斯市" },
        { name: "呼伦贝尔市" },
        { name: "巴彦淖尔市" },
        { name: "乌兰察布市" },
        { name: "兴安盟" },
        { name: "锡林郭勒盟" },
        { name: "阿拉善盟" },
      ],
    },
    {
      name: "辽宁省",
      cityList: [
        { name: "沈阳市" },
        { name: "大连市" },
        { name: "鞍山市" },
        { name: "抚顺市" },
        { name: "本溪市" },
        { name: "丹东市" },
        { name: "锦州市" },
        { name: "营口市" },
        { name: "阜新市" },
        { name: "辽阳市" },
        { name: "盘锦市" },
        { name: "铁岭市" },
        { name: "朝阳市" },
        { name: "葫芦岛市" },
      ],
    },
    {
      name: "吉林省",
      cityList: [
        { name: "长春市" },
        { name: "吉林市" },
        { name: "四平市" },
        { name: "辽源市" },
        { name: "通化市" },
        { name: "白山市" },
        { name: "松原市" },
        { name: "白城市" },
        { name: "延边朝鲜族自治州" },
      ],
    },
    {
      name: "黑龙江省",
      cityList: [
        { name: "哈尔滨市" },
        { name: "齐齐哈尔市" },
        { name: "鸡西市" },
        { name: "鹤岗市" },
        { name: "双鸭山市" },
        { name: "大庆市" },
        { name: "伊春市" },
        { name: "佳木斯市" },
        { name: "七台河市" },
        { name: "牡丹江市" },
        { name: "黑河市" },
        { name: "绥化市" },
        { name: "大兴安岭地区" },
      ],
    },
    {
      name: "上海市",
      cityList: [
        { name: "上海市" },
      ],
    },
    {
      name: "江苏省",
      cityList: [
        { name: "南京市" },
        { name: "无锡市" },
        { name: "徐州市" },
        { name: "常州市" },
        { name: "苏州市" },
        { name: "南通市" },
        { name: "连云港市" },
        { name: "淮安市" },
        { name: "盐城市" },
        { name: "扬州市" },
        { name: "镇江市" },
        { name: "泰州市" },
        { name: "宿迁市" },
      ],
    },
    {
      name: "浙江省",
      cityList: [
        { name: "杭州市" },
        { name: "宁波市" },
        { name: "温州市" },
        { name: "嘉兴市" },
        { name: "湖州市" },
        { name: "绍兴市" },
        { name: "金华市" },
        { name: "衢州市" },
        { name: "舟山市" },
        { name: "台州市" },
        { name: "丽水市" },
      ],
    },
    {
      name: "安徽省",
      cityList: [
        { name: "合肥市" },
        { name: "芜湖市" },
        { name: "蚌埠市" },
        { name: "淮南市" },
        { name: "马鞍山市" },
        { name: "淮北市" },
        { name: "铜陵市" },
        { name: "安庆市" },
        { name: "黄山市" },
        { name: "滁州市" },
        { name: "阜阳市" },
        { name: "宿州市" },
        { name: "六安市" },
        { name: "亳州市" },
        { name: "池州市" },
        { name: "宣城市" },
      ],
    },
    {
      name: "福建省",
      cityList: [
        { name: "福州市" },
        { name: "厦门市" },
        { name: "莆田市" },
        { name: "三明市" },
        { name: "泉州市" },
        { name: "漳州市" },
        { name: "南平市" },
        { name: "龙岩市" },
        { name: "宁德市" },
      ],
    },
    {
      name: "江西省",
      cityList: [
        { name: "南昌市" },
        { name: "景德镇市" },
        { name: "萍乡市" },
        { name: "九江市" },
        { name: "新余市" },
        { name: "鹰潭市" },
        { name: "赣州市" },
        { name: "吉安市" },
        { name: "宜春市" },
        { name: "抚州市" },
        { name: "上饶市" },
      ],
    },
    {
      name: "山东省",
      cityList: [
        { name: "济南市" },
        { name: "青岛市" },
        { name: "淄博市" },
        { name: "枣庄市" },
        { name: "东营市" },
        { name: "烟台市" },
        { name: "潍坊市" },
        { name: "济宁市" },
        { name: "泰安市" },
        { name: "威海市" },
        { name: "日照市" },
        { name: "临沂市" },
        { name: "德州市" },
        { name: "聊城市" },
        { name: "滨州市" },
        { name: "菏泽市" },
      ],
    },
    {
      name: "河南省",
      cityList: [
        { name: "郑州市" },
        { name: "开封市" },
        { name: "洛阳市" },
        { name: "平顶山市" },
        { name: "安阳市" },
        { name: "鹤壁市" },
        { name: "新乡市" },
        { name: "焦作市" },
        { name: "濮阳市" },
        { name: "许昌市" },
        { name: "漯河市" },
        { name: "三门峡市" },
        { name: "南阳市" },
        { name: "商丘市" },
        { name: "信阳市" },
        { name: "周口市" },
        { name: "驻马店市" },
        { name: "济源市" },
      ],
    },
    {
      name: "湖北省",
      cityList: [
        { name: "武汉市" },
        { name: "黄石市" },
        { name: "十堰市" },
        { name: "宜昌市" },
        { name: "襄阳市" },
        { name: "鄂州市" },
        { name: "荆门市" },
        { name: "孝感市" },
        { name: "荆州市" },
        { name: "黄冈市" },
        { name: "咸宁市" },
        { name: "随州市" },
        { name: "恩施土家族苗族自治州" },
        { name: "仙桃市" },
        { name: "潜江市" },
        { name: "天门市" },
        { name: "神农架林区" },
      ],
    },
    {
      name: "湖南省",
      cityList: [
        { name: "长沙市" },
        { name: "株洲市" },
        { name: "湘潭市" },
        { name: "衡阳市" },
        { name: "邵阳市" },
        { name: "岳阳市" },
        { name: "常德市" },
        { name: "张家界市" },
        { name: "益阳市" },
        { name: "郴州市" },
        { name: "永州市" },
        { name: "怀化市" },
        { name: "娄底市" },
        { name: "湘西土家族苗族自治州" },
      ],
    },
    {
      name: "广东省",
      cityList: [
        { name: "广州市" },
        { name: "韶关市" },
        { name: "深圳市" },
        { name: "珠海市" },
        { name: "汕头市" },
        { name: "佛山市" },
        { name: "江门市" },
        { name: "湛江市" },
        { name: "茂名市" },
        { name: "肇庆市" },
        { name: "惠州市" },
        { name: "梅州市" },
        { name: "汕尾市" },
        { name: "河源市" },
        { name: "阳江市" },
        { name: "清远市" },
        { name: "东莞市" },
        { name: "中山市" },
        { name: "潮州市" },
        { name: "揭阳市" },
        { name: "云浮市" },
      ],
    },
    {
      name: "广西壮族自治区",
      cityList: [
        { name: "南宁市" },
        { name: "柳州市" },
        { name: "桂林市" },
        { name: "梧州市" },
        { name: "北海市" },
        { name: "防城港市" },
        { name: "钦州市" },
        { name: "贵港市" },
        { name: "玉林市" },
        { name: "百色市" },
        { name: "贺州市" },
        { name: "河池市" },
        { name: "来宾市" },
        { name: "崇左市" },
      ],
    },
    {
      name: "海南省",
      cityList: [
        { name: "海口市" },
        { name: "三亚市" },
        { name: "三沙市" },
        { name: "儋州市" },
        { name: "五指山市" },
        { name: "琼海市" },
        { name: "文昌市" },
        { name: "万宁市" },
        { name: "东方市" },
        { name: "定安县" },
        { name: "屯昌县" },
        { name: "澄迈县" },
        { name: "临高县" },
        { name: "白沙黎族自治县" },
        { name: "昌江黎族自治县" },
        { name: "乐东黎族自治县" },
        { name: "陵水黎族自治县" },
        { name: "保亭黎族苗族自治县" },
        { name: "琼中黎族苗族自治县" },
      ],
    },
    {
      name: "重庆市",
      cityList: [
        { name: "重庆市" },
      ],
    },
    {
      name: "四川省",
      cityList: [
        { name: "成都市" },
        { name: "自贡市" },
        { name: "攀枝花市" },
        { name: "泸州市" },
        { name: "德阳市" },
        { name: "绵阳市" },
        { name: "广元市" },
        { name: "遂宁市" },
        { name: "内江市" },
        { name: "乐山市" },
        { name: "南充市" },
        { name: "眉山市" },
        { name: "宜宾市" },
        { name: "广安市" },
        { name: "达州市" },
        { name: "雅安市" },
        { name: "巴中市" },
        { name: "资阳市" },
        { name: "阿坝藏族羌族自治州" },
        { name: "甘孜藏族自治州" },
        { name: "凉山彝族自治州" },
      ],
    },
    {
      name: "贵州省",
      cityList: [
        { name: "贵阳市" },
        { name: "六盘水市" },
        { name: "遵义市" },
        { name: "安顺市" },
        { name: "毕节市" },
        { name: "铜仁市" },
        { name: "黔西南布依族苗族自治州" },
        { name: "黔东南苗族侗族自治州" },
        { name: "黔南布依族苗族自治州" },
      ],
    },
    {
      name: "云南省",
      cityList: [
        { name: "昆明市" },
        { name: "曲靖市" },
        { name: "玉溪市" },
        { name: "保山市" },
        { name: "昭通市" },
        { name: "丽江市" },
        { name: "普洱市" },
        { name: "临沧市" },
        { name: "楚雄彝族自治州" },
        { name: "红河哈尼族彝族自治州" },
        { name: "文山壮族苗族自治州" },
        { name: "西双版纳傣族自治州" },
        { name: "大理白族自治州" },
        { name: "德宏傣族景颇族自治州" },
        { name: "怒江傈僳族自治州" },
        { name: "迪庆藏族自治州" },
      ],
    },
    {
      name: "西藏自治区",
      cityList: [
        { name: "拉萨市" },
        { name: "日喀则市" },
        { name: "昌都市" },
        { name: "林芝市" },
        { name: "山南市" },
        { name: "那曲市" },
        { name: "阿里地区" },
      ],
    },
    {
      name: "陕西省",
      cityList: [
        { name: "西安市" },
        { name: "铜川市" },
        { name: "宝鸡市" },
        { name: "咸阳市" },
        { name: "渭南市" },
        { name: "延安市" },
        { name: "汉中市" },
        { name: "榆林市" },
        { name: "安康市" },
        { name: "商洛市" },
      ],
    },
    {
      name: "甘肃省",
      cityList: [
        { name: "兰州市" },
        { name: "嘉峪关市" },
        { name: "金昌市" },
        { name: "白银市" },
        { name: "天水市" },
        { name: "武威市" },
        { name: "张掖市" },
        { name: "平凉市" },
        { name: "酒泉市" },
        { name: "庆阳市" },
        { name: "定西市" },
        { name: "陇南市" },
        { name: "临夏回族自治州" },
        { name: "甘南藏族自治州" },
      ],
    },
    {
      name: "青海省",
      cityList: [
        { name: "西宁市" },
        { name: "海东市" },
        { name: "海北藏族自治州" },
        { name: "黄南藏族自治州" },
        { name: "海南藏族自治州" },
        { name: "果洛藏族自治州" },
        { name: "玉树藏族自治州" },
        { name: "海西蒙古族藏族自治州" },
      ],
    },
    {
      name: "宁夏回族自治区",
      cityList: [{ name: "银川市" }, { name: "石嘴山市" }, { name: "吴忠市" }, { name: "固原市" }, { name: "中卫市" }],
    },
    {
      name: "新疆维吾尔自治区",
      cityList: [
        { name: "乌鲁木齐市" },
        { name: "克拉玛依市" },
        { name: "吐鲁番市" },
        { name: "哈密市" },
        { name: "昌吉回族自治州" },
        { name: "博尔塔拉蒙古自治州" },
        { name: "巴音郭楞蒙古自治州" },
        { name: "阿克苏地区" },
        { name: "克孜勒苏柯尔克孜自治州" },
        { name: "喀什地区" },
        { name: "和田地区" },
        { name: "伊犁哈萨克自治州" },
        { name: "塔城地区" },
        { name: "阿勒泰地区" },
        { name: "石河子市" },
        { name: "阿拉尔市" },
        { name: "图木舒克市" },
        { name: "五家渠市" },
        { name: "铁门关市" },
      ],
    },
    {name:'台湾', cityList:[
        {name:'台湾', areaList:['台湾']}
        ]},
        {name:'香港', cityList:[
        {name:'香港', areaList:['香港']}
        ]},
        {name:'澳门', cityList:[
        {name:'澳门', areaList:['澳门']}
        ]}
  ];
  