layui.use(["jquery", "layer", "form", "laytpl", "laydate"], function () {
  var edipao = layui.edipao,
    laytpl = layui.laytpl,
    form = layui.form,
    laydate = layui.laydate,
    layer = layui.layer;
  function Edit() {
    this.pushList = {
      "0": {
        startTime: "",
        endTime: "",
        content: "",
      }
    };
    this.detail = null;
  }
  Edit.prototype.init = function () {
    var _this = this;
    _this.render();
    _this.bindEvents();
  }
  Edit.prototype.render = function () {
    var _this = this;
    laytpl($("#formTpl").html()).render({pushList: _this.pushList}, function (html) {
      $("#time_container").html(html);
      layui.each(_this.pushList, function (key) {
        _this.renderTime(key);
      });
    });
  }
  Edit.prototype.bindEvents = function () {
    var _this = this;
    $("#time_container").unbind().on("click", function(e){
      if(e.target.classList.contains("delete_btn")){
        var index = e.target.dataset.index;
        $(".time_row_" + index).remove();
        delete _this.pushList[index];
      }
    });
    $("#add_btn").unbind().on("click", function () {
      var index = new Date().getTime();
      var pushList = {};
      pushList[index + ""] = {
        startTime: "",
        endTime: "",
        content: "",
      }
      laytpl($("#formTpl").html()).render({pushList: pushList}, function (html) {
        $("#time_container").append(html);
        _this.renderTime(index);
      });
    });
    form.on("submit(submit)", function (data) {

      return false;
    });
  }
  Edit.prototype.renderTime = function (index) {
    var idList = ["startTime", "endTime"];
    idList.forEach(function (item) {
      laydate.render({ 
        elem: "#" + item + index,
        type: "datetime",
        trigger: "click"
      });
    });
  }
  var edit = new Edit();
  edit.init();
});