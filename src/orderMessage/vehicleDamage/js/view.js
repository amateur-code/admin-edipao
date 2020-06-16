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
      $.when(_this.getDetail(), _this.getUpdate()).done(function (res1, res2) {
        res1 = res1[0];
        res2 = res2[0];
        if(res1.code == 0){
          _this.detail = res1.data;
          _this.detail.list = res1.data.images.split(",");
          var updateData = {};
          try {
            var afterJson = JSON.parse(res2.data.modifyAfterJson) || [];
            afterJson.forEach(function(item){
              if(item.name == "images"){
                updateData[item.name] = item.value.split(",");
              }else{
                updateData[item.name] = item.value;
              }
            });
          } catch (error) {console.log(error)}
          laytpl($("#preview").html()).render({detail: _this.detail, check: updateData}, function (html) {
            $("#view").html(html);
            if(!res2.data){
              $("#add_verify_text").removeClass("hide");
            }
            zoomImg();
          });
        }
        _this.bindEvents();
      });
    }else{
      _this.getDetail().done(function (res) {
        if(res.code == 0){
          _this.detail = res.data;
          _this.detail.list = res.data.images.split(",");
          laytpl($("#preview").html()).render({detail: _this.detail, check: {}}, function (html) {
            $("#view").html(html);
            zoomImg();
          });
        }
        _this.bindEvents();
      });
    }
  }
  View.prototype.getUpdate = function () {
    var _this = this;
    return edipao.request({
      url: "/admin/log/last-modify/get",
      method: "GET",
      data:{
        loginStaffId: edipao.getLoginStaffId(),
        operationModule: "15",
        dataPk: _this.id
      }
    });
  }
  View.prototype.getDetail = function () {
    var _this = this;
    return edipao.request({
      url: "/admin/order/damage/get",
      data: {
        loginStaffId: edipao.getLoginStaffId(),
        id: _this.id,
      },
      method: "POST",
    })
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
        url: "/admin/order/damage/approval",
        method: "POST",
        data: {
          id: _this.id,
          orderNo: _this.detail.orderNo,
          approvalResult: data.approvalResult == "reject" ? "1" : "0",
          approvalRemark: data.approvalRemark,
        }
      }).done(function (res) {
        if(res.code == "0"){
          layer.alert("提交成功", {icon: 1}, function () {
            xadmin.close();
            xadmin.father_reload();
          });
        }
      });
      return false;
    });
  }
  var view = new View();
  view.init();
});
