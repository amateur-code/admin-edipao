layui.use(["jquery", "layer", "form", "laytpl", "laydate"], function () {
  var edipao = layui.edipao,
    laytpl = layui.laytpl,
    form = layui.form,
    laydate = layui.laydate,
    layer = layui.layer;
  function Edit() {
    var qs = edipao.urlGet();
    this.detail = null;
    this.action = qs.action;
    this.msgClient = 1;
    this.msgId = qs.msgId;
  }
  Edit.prototype.init = function () {
    var _this = this;
    _this.bindEvents();
    if(_this.action == "edit"){
      _this.getDetail();
    }else{
      _this.renderTime();
    }
  }
  Edit.prototype.getDetail = function () {
    var _this = this;
    edipao.request({
      url: "/admin/msg/get",
      data: {
        msgId: _this.msgId,
      }
    }).done(function(res){
      if(res.code == 0){
        form.val("main_form", res.data);
        _this.renderTime();
      }
    });
  }
  Edit.prototype.bindEvents = function () {
    var _this = this;
    form.on("submit(submit)", function (data) {
      data = data.field;
      var params = {
        msgClient: 1,
      }
      Object.assign(params, data);
      var url = _this.action == "add" ? "/admin/msg/add" : "/admin/msg/update";
      if(_this.action == "edit") params.msgId = _this.msgId;
      var loadIndex = layer.load(1, {time: 10000});
      edipao.request({
        url: url,
        data: params,
      }).done(function (res) {
        layer.close(loadIndex);
        if(res.code == 0){
          layer.alert("提交成功", {icon: 2});
        }
      }).always(function () { layer.close(loadIndex); });
      return false;
    });
  }
  Edit.prototype.renderTime = function () {
    var idList = ["sendStartTime", "sendEndTime"];
    idList.forEach(function (item) {
      laydate.render({ 
        elem: "#" + item,
        type: "datetime",
        trigger: "click"
      });
    });
  }
  var edit = new Edit();
  edit.init();
});