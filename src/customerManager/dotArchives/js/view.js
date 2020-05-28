layui.use(['jquery', 'layer', 'laytpl', 'form'], function(){
  var $ = layui.jquery,
      layer = layui.layer,
      laytpl = layui.laytpl,
      edipao = layui.edipao,
      form = layui.form;
  
  function View() {
    var qs = edipao.urlGet();
    this.id = qs.id;
    this.action = qs.action;
    this.check = {};
    this.detail = {};
  }
  View.prototype.init = function () {
    var _this = this;
    if(_this.action == "verify"){
      $("#verify").removeClass("hide");
      form.render();
      $.when(_this.getDetail(), _this.getUpdate()).done(function(res, res2){
        res = res[0], res2 = res2[0];
        if(res.code == "0" && res2.code == "0"){
          Object.keys(res.data).forEach(function (key) {
            if(key != "connectorName" && key != "connectorPhone"){
              res.data[key] = res.data[key] || "- -";
            }
            if(res.data[key] == null){
              res.data[key] = "";
            }
          });
          if(!res.data.connectorName && !res.data.connectorPhone){
            res.data.connectorName = "- -";
            res.data.connectorPhone = "- -";
          }
          _this.detail = res.data;
          try {
            _this.detail.feeJson = JSON.parse(_this.detail.feeJson);
          } catch (error) {
            _this.detail.feeJson = [];
          }
          try {
            _this.check = JSON.parse(res2.data.modifyAfterJson).newMap;
            _this.check.feeJson = _this.check.feeJson || "";
          } catch (error) {}
          if(_this.check.feeJson){
            try {
              _this.check.feeJson = JSON.parse(_this.check.feeJson);
            } catch (error) {
              _this.check.feeJson = [];
            }
          }
          _this.check.feeJson && _this.detail.feeJson.forEach(function (item, index) {
            var startWarehouse = item.startWarehouse,
              feeId = item.feeId,
              name = item.name;
            var existFlag = false;
            var updateFlag = false;
            var checkData = {};
            existFlag = _this.check.feeJson.some(function (item, index) {
              if(item.startWarehouse == startWarehouse) {
                console.log(item.startWarehouse == startWarehouse)
                if(item.name != name || item.feeId != feeId){
                  if(item.name != name){
                    checkData.name = item.name;
                    checkData.feeId = item.feeId;
                  }
                  updateFlag = true;
                }
                return true;
              }
            });
            if(existFlag && updateFlag){
              _this.detail.feeJson[index].check = checkData;
            }else if(!existFlag){
              _this.detail.feeJson[index].delete = true;
            }
          });
          _this.check.feeJson && _this.check.feeJson.forEach(function (item) {
            var startWarehouse = item.startWarehouse,
              feeId = item.feeId,
              name = item.name;
            var existFlag = false;
            existFlag = _this.detail.feeJson.some(function(item){
              if(item.startWarehouse == startWarehouse){
                return true;
              }
            });
            if(!existFlag){
              item.isNew = true;
              if(item.feeId) _this.detail.feeJson.push(item);
            }
          });
          Object.keys(_this.check).forEach(function (key) {
            if(key != "feeJson"){
              if(!_this.check[key]){
                res.data[key] = res.data[key] || "- -";
              }
            }
          });
          laytpl($("#preview").html()).render({check: _this.check, detail: _this.detail}, function (html) {
            $("#view").html(html);
            _this.bindEvents();
          });
        }
      });
    }else{
      _this.getDetail().done(function (res) {
        if(res.code == 0){
          res.data = res.data || {};
          Object.keys(res.data).forEach(function (key) {
            if(key != "connectorName" && key != "connectorPhone"){
              res.data[key] = res.data[key] || "- -";
            }
            if(res.data[key] == null){
              res.data[key] = "";
            }
          });
          if(!res.data.connectorName && !res.data.connectorPhone){
            res.data.connectorName = "- -";
            res.data.connectorPhone = "- -";
          }
          try {
            res.data.feeJson = JSON.parse(res.data.feeJson);
          } catch (error) {
            res.data.feeJson = [];
          }
          laytpl($("#preview").html()).render({check: {}, detail: res.data}, function (html) {
            $("#view").html(html);
            _this.bindEvents();
          });
        }
      });
    }
  }
  View.prototype.getUpdate = function () {
    var _this = this;
    return edipao.request({
      url: "/admin/log/last-modify/get",
      method: "GET",
      data: {
        operationModule: 10,
        dataPk: _this.id,
      }
    });
  }
  View.prototype.getDetail = function () {
    var _this = this;
    return edipao.request({
      url: "/admin/customer/truckNetwork/detail",
      method: "GET",
      data: {
        id: _this.id,
      }
    });
  }
  View.prototype.bindEvents = function () {
    var _this = this;
    $("#btn_cancel").unbind().on("click", function (e) {
      xadmin.close();
      return false;
    });
    $("#verify_submit").unbind().on("click", function (e) {
      var data = form.val("verify");
      if(data.approvalResult == "reject" && !data.approvalRemark){
        layer.msg("请填写审核备注", {icon: 2});
        return;
      }
      edipao.request({
        url: "/admin/customer/truckNetwork/approval/result/save",
        method: "POST",
        data: {
          dataPk: _this.id,
          checkResult: data.approvalResult,
          checkRemark: data.approvalRemark,
        }
      }).done(function (res) {
        if(res.code == "0"){
          layer.alert("提交成功", function () {
            xadmin.close();
            xadmin.father_reload();
          });
        }
      });
      return false;
    });
    $(".view_fee").unbind().on("click", function (e) {
      var feeId = e.target.dataset.id;
      xadmin.open('费用信息', '../../SystemSetting/CostAllocation/preview.html?id=' + feeId);
    });
  }
  var view = new View();
  view.init();
});
