layui.use(["jquery", "layer", "form", "laytpl", "laydate"], function () {
  console.log($)
  var edipao = layui.edipao,
    laytpl = layui.laytpl,
    form = layui.form,
    laydate = layui.laydate,
    layer = layui.layer;
  function Edit() {
    this.timeList = [
      {
        startTime: "",
        endTime: "",
        range: "",
      }
    ];
  }
  Edit.prototype.init = function(){
    var _this = this;
    _this.bindEvents();
  }
  Edit.prototype.bindEvents = function () {
    var _this = this;
    $("#add_btn").unbind().on("click", function (e) {
      var index = _this.timeList.length;
      laytpl($("#formTpl").html()).render({
        index: index,
      }, function (html) {
        $("#time_container").append(html);
        _this.renderTime(index);
      });
    });
  }
  Edit.prototype.renderTime = function (index) {
    var idList = ["startTime", "endTime", "range"];
    idList.forEach(function (item) {
      laydate.render({ 
        elem: "#" + item + index,
        type: "time",
        trigger: "click"
      });
    });
  }
  var edit = new Edit();
  edit.init();
});