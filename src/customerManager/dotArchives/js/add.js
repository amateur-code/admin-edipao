layui.use(['jquery','form', 'layer', 'laytpl'], function(){
  var $ = layui.jquery,
      form = layui.form,
      layer = layui.layer,
      laytpl = layui.laytpl;
  function Add(){}
  Add.prototype.init = function () {
    var _this = this;
    _this.initData();
  }
  Add.prototype.initData = function () {
    var _this = this;
    laytpl($("#fee_template").html()).render({index: 0, first: true}, function (html) {
      $("#fee_container").append(html);
      form.render();
      _this.bindEvents();
    });
  }
  Add.prototype.bindEvents = function(){
    $("#add_fee").unbind().on("click", function (e) {
      laytpl($("#fee_template").html()).render({index: $(".fee_row").length}, function (html) {
        $("#fee_container").append(html);
        form.render("select");
        $(".fee_remove").unbind().on("click", function (e) {
          var filter = e.target.dataset.filter;
          $("." + filter).remove();
        });
      });
    });
    $('#addCancel').click(function () {
      xadmin.close();
      return false;
    });
    form.on("submit(submit)", function (data) {
      console.log(data)
      return false;
    });
  }
  var add = new Add();
  add.init();
});
