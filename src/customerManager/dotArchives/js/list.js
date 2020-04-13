layui.config({
  base: '../../lib/'
}).extend({
  excel: 'layui_exts/excel.min',
  tableFilter: 'TableFilter/tableFilter'
}).use(['jquery', 'table','layer','excel','tableFilter','form'], function () {
  var table = layui.table,
      layer = layui.layer,
      tableFilter = layui.tableFilter,
      edipao = layui.edipao,
      excel = layui.excel,
      form = layui.form,
      edipao = layui.edipao,
      tableIns,tableFilterIns;
      permissionList = edipao.getMyPermission();
      permissionList.push("新增","修改","删除");
  var showList = [ "company", "endProvince","name","name","name","name","name"];
  var exportHead={};// 导出头部
  var tableCols = [
    { checkbox: true },
    { field: 'company', title: '网点名称',width: 200, templet: function (d) {
        return d.company ? d.company : "- -";
    }},
    { field: 'endProvince', title: '所在省市',width: 130, templet: function (d) {
        if(!d.endProvince && !d.endCity) return "- -";
        return d.endProvince + d.endCity;
    }},
    { field: 'endAddress', title: '详细地址',width: 400, templet: function (d) {
        return d.endAddress ? d.endAddress : "- -";
    }},
    { field: 'addrCode', title: '地址代码',width: 130, templet: function (d) {
        return d.addrCode ? d.addrCode : "- -";
    }},
    { field: 'connectorName', title: '联系人',width: 150, templet: function (d) {
        if(!d.connectorName && !d.connectorPhone) return "- -";
        return d.connectorName + d.connectorPhone;
    }},
    { field: 'remark', title: '备注',width: 400, templet: function (d) {
        return d.remark ? d.remark : "- -";
    }},
    { field: 'name', title: '发运趟数',width: 100, templet: function (d) {
        return d.endAddress ? d.endAddress : "- -";
    }},
    { field: 'statusDesc', title: '状态',width: 100, templet: function (d) {
        return d.statusDesc ? d.statusDesc : "- -";
    }},
    {title: '操作', field: "operation", width: 320, fixed: 'right',toolbar: '#rowBtns'}
  ]
  function DataNull (data) {
    if(data == null||data == ''){
        return '--'
    }else{
        return  data
    }
}
  function List() {
    this.tableKey = "customer-manager-dot-list-table";
  }
  List.prototype.init = function(){
    var _this = this;
    // _this.renderTable();
    _this.setTableFilter();
    _this.bindTableEvents();
    edipao.request({
      type: 'GET',
      url: '/admin/table/show-field/get',
      data: {
          tableName: this.tableKey
      }
    }).done(function(res) {
        if (res.code == 0) {
          if(res.data){
              showList = [];
              try{
                  showList = JSON.parse(res.data);
              }catch(e){}
              layui.each(tableCols, function(index, item){
                  if(item.field == "operation") return;
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
          _this.renderTable();
          _this.setTableFilter();
          _this.bindTableEvents();
        }
    });
  }
  List.prototype.renderTable = function () {
    var _this = this;
    tableIns = table.render({
      elem: '#dotList',
      id: "dotList",
      url: edipao.API_HOST + '/admin/customer/truckNetwork/list',
      page: true,
      where: {
          loginStaffId: edipao.getLoginStaffId()
      },
      request: {
          pageName: 'pageNo', //页码的参数名称
          limitName: 'pageSize' //每页数据量的参数名
      },
      parseData: function (res) {
          edipao.codeMiddleware(res);
          var data = [];
          res.data = res.data || {};
          res.data.receiveTruckNetworkRespList = res.data.receiveTruckNetworkRespList || [];
          res.data.receiveTruckNetworkRespList.forEach(function(item) {
              data.push(item);
          });
          if (res.code == 0) {
              return {
                  "code": res.code,
                  "msg": res.message,
                  "count": res.data.totalSize,
                  "data": data
              };
          }
      },
      toolbar: '#headerBtns',
      defaultToolbar: [],
      cols: [tableCols],
      done: function (res, curr, count) {
          $(window).unbind("resize");
          resizeTable();
          if(res.data== null){
              $('.layui-table-header').css('overflow-x','scroll')
          }else{
              $('.layui-table-header').css('overflow','hidden')
          }
          tableFilterIns&&tableFilterIns.reload() // 搜索
      }
    });
    var resizeTime = null;
    function resizeTable() {
        var w = "90px";
        var backw = "320px";
        var backl = "-1px";
        var l = "-215px";
        var dur = 300;
        if(resizeTime) clearTimeout(resizeTime);
        resizeTime = setTimeout(function () {
            $(".layui-table-main td[data-field=operation]").css("border-color","#ffffff").css("background","#ffffff").find(".layui-table-cell").css("width", w).html("");
            $(".layui-table-box>.layui-table-header th[data-field=operation]").css("border", "none").css("color", "#f2f2f2");
            var $fixed = $(".layui-table-fixed.layui-table-fixed-r");
            $fixed.removeClass("layui-hide").find(".layui-table-body").css("height", "auto");
            $fixed.find(".layui-table-header").css("overflow", "visible")
            $fixed.find(".layui-table-filter").css("left","60px");
            $fixed.find("thead .layui-table-cell").css("position", "relative");
            if(!$fixed.find(".opeartion_icon").length) $fixed.find("thead .layui-table-cell").append("<i class='layui-icon opeartion_icon layui-icon-prev'></i>");
            $fixed.animate({"right": l}, dur, function () {
                $(".opeartion_icon").unbind().on("click", function (e) {
                    var $this = $(this);
                    if($this.hasClass("layui-icon-prev")){
                        $(".layui-table-main td[data-field=operation] .layui-table-cell").css("width", backw);
                        $this.removeClass("layui-icon-prev").addClass("layui-icon-next");
                        $fixed.animate({"right": backl}, dur);
                    }else{
                        $(".layui-table-main td[data-field=operation] .layui-table-cell").css("width", w);
                        $this.removeClass("layui-icon-next").addClass("layui-icon-prev");
                        $fixed.animate({"right": l}, dur);
                    }
                });
            });
        }, dur);
    }
  }
  List.prototype.bindTableEvents = function(){
    var _this = this;
    table.on('tool(dotList)', handleEvent);
    table.on('toolbar(dotList)', handleEvent);
    table.on('checkbox(dotList)', handleEvent);
    function handleEvent (obj) {
      var data = obj.data;
      obj.event == 'add' && permissionList.indexOf('新增') == -1 && (obj.event = 'reject');
      obj.event == 'edit' && permissionList.indexOf('修改') == -1 && (obj.event = 'reject');
      obj.event == 'del' && permissionList.indexOf('删除') == -1 && (obj.event = 'reject');
      obj.event == 'verify' && permissionList.indexOf('审核') == -1 && (obj.event = 'reject');
      obj.event == 'export' && permissionList.indexOf('导出') == -1 && (obj.event = 'reject');

      switch (obj.event) {
          case 'reject':
              layer.alert('你没有访问权限', {icon: 2});
              break;
          case 'add':
            xadmin.open('新增网点', './add.html');
              break;
          case 'export':
              _this.exportExcel();
              break;
          case 'tableSet':
              xadmin.open('表格设置', './table-set.html?tableKey=' + _this.tableKey, 600, 600);
              break;
          case 'edit':
              xadmin.open('修改网点', './add.html?action=edit&id=' + data.id)
              break;
          case 'audit':
              xadmin.open('审核网点', './audit.html?action=verify&id=' + data.id)
              break;
          case 'info':
              xadmin.open('查看网点', './view.html?action=view&id=' + data.id)
              break;
          case 'del':
              layer.confirm('确定删除吗？', { icon: 3, title: '提示' }, function(index) {
                  edipao.request({
                      url: '/admin/customer/truckNetwork/del',
                      type: 'POST',
                      data: {
                          id:data.id
                      }
                  }).then(function(res){
                      if(res.code == 0){
                          layer.msg('删除成功');
                          tableIns.reload();
                      }else{
                          layer.msg(res.message)
                      }
                  })
              });
              break;
          case 'log':
              xadmin.open('操作日志', '../../OperateLog/log.html?id=' + data.id + '&type=3');
              break;
      };
    }
  }
  List.prototype.initPermission = function(){
    if(permissionList.indexOf('订单录入') < 0){
      $("#import_order").remove();
    }
    if(permissionList.indexOf('导出') < 0){
      $("#export_data").remove();
    }
  }
  List.prototype.setTableFilter = function () {
    var filters = [
      { field: 'company', type: 'input' },
      { field: 'endProvince', type: 'input' },
      { field: 'endAddress', type: 'input' },
      { field: 'addrCode', type: 'input' },
      { field: 'connectorName', type: 'input' },
      { field: 'name', type: 'input' },
      { field: 'statusDesc', type: 'input' },
    ];
    var where = {};
    tableFilterIns = tableFilter.render({
      'elem' : '#dotList',//table的选择器
      'mode' : 'self',//过滤模式
      'filters' : filters,//过滤项配置
      'done': function(filters){
          var index = 0;
          where = {
                  loginStaffId: edipao.getLoginStaffId()
              };
          layui.each(filters,function(key, value){
              if(key=='licenceWarn'){
                  where['searchFieldDTOList['+ index +'].fieldName'] = validityData[value];
                  where['searchFieldDTOList['+ index +'].fieldMaxValue'] = getDay(warnDataVal[value]);
              }else{
                  where['searchFieldDTOList['+ index +'].fieldName'] = key;
                  where['searchFieldDTOList['+ index +'].fieldValue'] = value;
              }
              index++;
          })
          tableIns.reload( { where: where, page: { curr: 1 }});
      }
    });
  }
  List.prototype.exportExcel = function(){
    var _this = this;
    var checkStatus = table.checkStatus('driverList');
    if(checkStatus.data.length > 0){
        exportXlsx(checkStatus.data);
        return;
    }
    var param = where;
    param['pageNumber']= 1;
    param['pageSize'] =10000;
    edipao.request({
        type: 'GET',
        url: '/admin/driver/info/list',
        data: param
    }).done(function(res) {
        if (res.code == 0) {
            if(res.data){
                res.data = res.data || {};
                res.data.receiveTruckNetworkRespList = res.data.receiveTruckNetworkRespList || [];
                var data = res.data.receiveTruckNetworkRespList;
                exportXlsx(data)
            }
        }
    });
    function exportXlsx (data) {
      var exportData = [];
      // 添加头部
      exportData.push(exportHead);
      // 过滤处理数据
      layui.each(data, function(k, v){
          var exportObj={};
          layui.each(v,function (index,item) {
              if(index && showList.indexOf(index) != -1){
                  switch(index) {
                      default:
                          exportObj[index] = DataNull(item);
                  }
              }
          })
          exportData.push(exportObj)
      })
      // 导出
      excel.exportExcel({
          sheet1: exportData
      }, '网点档案.xlsx', 'xlsx');
      var ids = [];
      data.forEach(function(item){ids.push(item.id)});
      exportLog(ids.join(","));
    }
    // 导出日志
    function exportLog(ids){
     var params = {
        operationModule: 3,
        operationRemark: "导出网点档案",
      }
      if(ids) params.dataPkList = ids;
      edipao.exportLog(params);
    }
  }
  var list = new List();
  list.init();
});