layui.use(['form', 'table', 'jquery','layer', 'upload', 'laytpl'], function () {

  var laytpl = layui.laytpl;
  var $ = layui.jquery;

  function View() {
    var qs = edipao.urlGet();
    this.orderId = qs.orderId;
    this.user = JSON.parse(sessionStorage.user);
  }
  $.extend(View.prototype, {
    
  });
});