layui.use(["jquery", "layer", "laytpl"], function () {
  var edipao = layui.edipao,
    $ = layui.jquery,
    laytpl = layui.laytpl,
    layer = layui.layer;
  function View() {
    this.detail = null;
  }
  View.prototype.init = function(){
    var _this = this;
    _this.getDetail();
    _this.bindEvents();
  }
  View.prototype.getDetail = function () {
    var _this = this;
    edipao.request({
      url: "/admin/grab/config/info",
      method: "GET",
    }).done(function (res) {
      if(res.code == 0){
        _this.detail = res.data;
        try {
          _this.detail.grabTimeConfigInfo = JSON.parse(_this.detail.grabTimeConfigInfo);
        } catch (error) {_this.detail.grabTimeConfigInfo = []}
        _this.renderData();
      }
    });
  }
  View.prototype.renderData = function () {
    var _this = this;
    laytpl($("#infoTpl").html()).render({pushList: [{},{}]}, function (html) {
      $("#time_container").html(html);
    });
  }
  View.prototype.bindEvents = function () {
    $("#edit_btn").unbind().click(function () {
      xadmin.open("消息推送修改", "./push-edit.html");
    });
  }
  var view = new View();
  view.init();
});