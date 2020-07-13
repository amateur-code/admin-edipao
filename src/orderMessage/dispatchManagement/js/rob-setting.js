layui.use(["jquery", "layer"], function () {
  var edipao = layui.edipao,
    $ = layui.jquery,
    layer = layui.layer;
  function View() {  }
  View.prototype.init = function(){
    var _this = this;
    _this.bindEvents();
  }
  View.prototype.bindEvents = function () {
    $("#edit_btn").unbind().click(function () {
      xadmin.open("抢单配置修改", "./rob-edit.html");
    });
  }
  var view = new View();
  view.init();
});