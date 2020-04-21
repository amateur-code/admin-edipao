layui.use(['jquery','form', 'layer', 'laytpl'], function(){
  var $ = layui.jquery,
      form = layui.form,
      layer = layui.layer,
      laytpl = layui.laytpl,
      edipao = layui.edipao;
  var feeTpls = [], startParks = [];
  function Add(){
    var qs = edipao.urlGet();
    console.log(qs)
    this.id = qs.id;
    this.action = qs.action;
  }
  Add.prototype.init = function () {
    var _this = this;
    _this.initData();
  }
  Add.prototype.initData = function () {
    var _this = this;
    var loadIndex = layer.load(2);
    $.when(_this.getFeeTpl(), _this.getStartPark(), _this.getDetail()).done(function(res1, res2, res3){
      layer.close(loadIndex);
      res1 = res1[0];
      res2 = res2[0];
      res3 = res3[0];
      if(res1.code == "0" && res2.code == "0" && res3.code == "0")
        feeTpls = res1.data.feeDTOList || [];
        startParks = res2.data || [];
        var commonTpl = {}, commonIndex, feeTpl = $("#fee_template").html();
        res1.data.feeDTOList.some(function (item, index) {
          if(item.name == "通用费用模板"){
            commonTpl = item;
            commonIndex = index;
            return true;
          }
        });
        res1.data.feeDTOList.splice(commonIndex, 1);
        laytpl(feeTpl).render({index: 0, first: true, commonTpl: commonTpl}, function (html) {
          $("#fee_container").append(html);
          form.render();
          _this.bindEvents();
        });
        if(_this.action == "edit"){
          _this.detail = res3.data;
          try {
            _this.detail.feeJson = JSON.parse(_this.detail.feeJson);
          } catch (error) {
            _this.detail.feeJson = [];
          }
          var feeList = _this.detail.feeJson;
          $("#accountCity").xcity(_this.detail.endProvince, _this.detail.endCity);
          form.val("main_form", res3.data);
          feeList.forEach(function (item, index) {
            if(index > 0){
              laytpl(feeTpl).render({
                index: index,
                feeTpls: feeTpls, 
                startParks: startParks,
                feeItem: item
              }, function (html) {
                $("#fee_container").append(html);
                form.render();
                $(".fee_remove").unbind().on("click", function (e) {
                  var filter = e.target.dataset.filter;
                  $("." + filter).remove();
                });
              });
            }
          });
        }
    });
  }
  Add.prototype.appendCity = function (province, city) {
    var str = "";
    var cityList;
    provinceList.some(function (item, index) {
      if(item.name == province){
        cityList = item.cityList;
        return true;
      }
    });
    cityList.forEach(function (item){
      str = str + "<option"+ item.name == city ? 'selected':'' + " value=" + item.name + ">" + item.name + "</option>";
    });
    $("#endCity").append(str);
  }
  Add.prototype.getDetail = function(){
    var _this = this;
    if(!_this.id){
      return [{code:0, data:{}}]
    }else{
      return edipao.request({
        url: "/admin/customer/truckNetwork/detail",
        method: "GET",
        data: {
          id: _this.id,
        }
      });
    }
  }
  Add.prototype.getFeeTpl = function () {
    return edipao.request({
      url: "/admin/fee/list",
      method: "POST",
      data: {
        pageNo: 1,
        pageSize: 9999
      }
    });
  }
  Add.prototype.getStartPark = function(){
    return edipao.request({
      url: "/admin/dictionary/getStartWarehouseList",
      method: "GET",
      data: {}
    });
  }
  Add.prototype.handleViewFee = function (e) {
    var feeId = $("." + e.target.dataset.name).val()
    if(!feeId){
      layer.msg("请先选择运费模板！", {icon:2});
      return;
    }
    xadmin.open('费用信息', '../../SystemSetting/CostAllocation/preview.html?id=' + feeId);
  }
  Add.prototype.bindEvents = function(){
    var _this = this;
    form.on("select(feeId)", function (obj) {
      $(obj.othis).next().val($(obj.elem.selectedOptions).text());
    });
    $(".view_fee").unbind().on("click", this.handleViewFee);
    $("#addrCode").unbind().on("input", function (e) {
      var max = 15;
      if(e.target.value.length > max) e.target.value = e.target.value.slice(0, max);
    });
    $("#company").unbind().on("input", function (e) {
      var max = 50;
      if(e.target.value.length > max) e.target.value = e.target.value.slice(0, max);
    });
    $("#connectorName").unbind().on("input", function (e) {
      var max = 50;
      if(e.target.value.length > max) e.target.value = e.target.value.slice(0, max);
    });
    $("#connectorPhone").unbind().on("input", function (e) {
      var max = 12;
      if(e.target.value.length > max) e.target.value = e.target.value.slice(0, max);
    });
    $("#remark").unbind().on("input", function (e) {
      var max = 300;
      if(e.target.value.length > max) e.target.value = e.target.value.slice(0, max);
    });
    $("#add_fee").unbind().on("click", function (e) {
      laytpl($("#fee_template").html()).render({index: $(".fee_row").length, feeTpls: feeTpls, startParks: startParks}, function (html) {
        $("#fee_container").append(html);
        form.render("select");
        $(".view_fee").unbind().on("click", _this.handleViewFee);
        $(".fee_remove").unbind().on("click", function (e) {
          var filter = e.target.dataset.filter;
          $("." + filter).remove();
        });
      });
    });
    $('#addCancel').click(function () {
      xadmin.close();
      return false;
    });
    form.on("select(startWarehouse)", function (data) {
      var startWarehouseList = [];
      var formData = form.val("main_form");
      var existNum = 0;
      $(".fee_row").each(function (index, item) {
        index = item.dataset.index;
        if(formData["startWarehouse" + index] == data.value) existNum++;
        startWarehouseList.push(formData["startWarehouse" + index]);
      });
      if(existNum > 1){
        layer.msg("相同的发车仓库只能配置一个模板！", {icon: 2});
        var name = data.elem.name;
        var resetData = {};
        resetData[name] = "";
        form.val("main_form", resetData);
      }
    });
    form.on("submit(submit)", function (data) {
      data = data.field;
      var feeJson = [];
      $(".fee_row").each(function (index, item) {
        index = item.dataset.index;
        feeJson.push({
          startWarehouse: data["startWarehouse" + index],
          feeId: data["feeId" + index],
          name: data["feeName" + index],
        });
      });
      if(data.connectorName && !data.connectorPhone){
        layer.msg("请填写联系人手机号");
        return false;
      }else if(!data.connectorName && data.connectorPhone){
        layer.msg("请填写联系人姓名");
        return false;
      }
      var params = {
        company: data.company || "",
        addrCode: data.addrCode || "",
        endProvince: data.endProvince || "",
        endCity: data.endCity || "",
        endAddress: data.endAddress || "",
        endLng: data.endLng || "",
        endLat: data.endLat || "",
        connectorName: data.connectorName || "",
        connectorPhone: data.connectorPhone || "",
        remark: data.remark || "",
        endDistrict: data.endDistrict || "",
        feeJson: JSON.stringify(feeJson),
      }
      if(!params.endLat || params.endLat * 1 == 0 || !params.endLng || params.endLat * 1 == 0){
        layer.msg("网点地址经纬度无效，请重新选择！", {icon:2});
        return false;
      }
      var url = "/admin/customer/truckNetwork/add";
      if(_this.action == "edit"){
        params.id = _this.detail.id;
        url = "/admin/customer/truckNetwork/update";
      }
      edipao.request({
        url: url,
        method: "POST",
        data: params
      }).done(function (res) {
        if(res.code == "0"){
          layer.alert("提交成功", {icon: 6}, function(){
            xadmin.close();
            xadmin.father_reload();
          });
        }
      });
      return false;
    });
  }
  var add = new Add();
  add.init();
});
