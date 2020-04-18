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
          }
          _this.detail = res.data;
          try {
            _this.detail.feeJson = JSON.parse(_this.detail.feeJson);
          } catch (error) {
            _this.detail.feeJson = [];
          }
          try {
            _this.check = JSON.parse(res2.data.modifyAfterJson).newMap;
          } catch (error) {}
          if(_this.check.feeJson){
            try {
              _this.check.feeJson = JSON.parse(_this.check.feeJson);
            } catch (error) {
              _this.check.feeJson = "";
            }
          }
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
