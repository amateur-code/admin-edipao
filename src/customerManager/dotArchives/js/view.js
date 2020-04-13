layui.use(['jquery', 'layer', 'laytpl'], function(){
  var $ = layui.jquery,
      layer = layui.layer,
      laytpl = layui.laytpl,
      edipao = layui.edipao;
  
  function View() {
    var qs = edipao.urlGet();
    this.id = qs.id;
  }
  View.prototype.init = function () {
    var _this = this;
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
        laytpl($("#preview").html()).render({check:{}, detail: res.data}, function (html) {
          $("#view").html(html);
        });
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
  
  var view = new View();
  view.init();
});
