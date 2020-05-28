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
    _this.action = "verify"
    if(_this.action == "verify"){
      $("#verify").removeClass("hide");
      form.render();
    }else{
      var list = [
        "http://jenny.oss-cn-beijing.aliyuncs.com/test/edipao/truck/fetch/1/1.jpg",
        "http://jenny.oss-cn-beijing.aliyuncs.com/test/edipao/truck/fetch/1/1.jpg",
        "http://jenny.oss-cn-beijing.aliyuncs.com/test/edipao/truck/fetch/1/1.jpg",
        "http://jenny.oss-cn-beijing.aliyuncs.com/test/edipao/truck/fetch/1/1.jpg",
        "http://jenny.oss-cn-beijing.aliyuncs.com/test/edipao/truck/fetch/1/1.jpg",
      ]
      var detail = {type: "车损", remark: "备注备注备注备注备注", list: list}
      laytpl($("#preview").html()).render({detail: detail, check: detail}, function (html) {
        $("#view").html(html);
      });
    }
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
  }
  var view = new View();
  view.init();
});
