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
    _this.renderTime(0);
    _this.bindEvents();
  }
  Edit.prototype.bindEvents = function () {
    var _this = this;
    $("#time_container").unbind().on("click", function(e){
      if(e.target.classList.contains("delete_btn")){
        var index = e.target.dataset.index;
        $(".time_row_" + index).remove();
        _this.timeList.splice(index, 1);
      }
    });
    $("#add_btn").unbind().on("click", function (e) {
      var index = _this.timeList.length;
      laytpl($("#formTpl").html()).render({
        index: index,
      }, function (html) {
        $("#time_container").append(html);
        _this.renderTime(index);
      });
    });
    $("#add_cancel").unbind().click(function () {
      xadmin.close();
      return false;
    });
    form.on("submit(main_form)", function (data) {
      return false;
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