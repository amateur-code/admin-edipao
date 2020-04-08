layui.use(['jquery', 'layer', 'laytpl'], function(){
  var $ = layui.jquery,
      layer = layui.layer,
      laytpl = layui.laytpl;
  
  function View() {  }
  View.prototype.init = function () {
    var _this = this;
    _this.getDetail().done(function (res) {
      if(res.code == 0){
        laytpl($("#preview").html()).render({check:{}, detail:{}}, function (html) {
          $("#view").html(html);
        });
      }
    });
  }
  View.prototype.getDetail = function () {
    var _this = this;
    return {
      done: function (cb) {
        cb({code: 0});
      }
    }
  }
  
  var view = new View();
  view.init();
});
