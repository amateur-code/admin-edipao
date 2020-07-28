layui.use(["jquery", "layer", "form", "laytpl", "laydate"], function () {
  var edipao = layui.edipao,
    laytpl = layui.laytpl,
    form = layui.form,
    laydate = layui.laydate,
    layer = layui.layer;
  function Edit() {
    this.timeList = [];
    this.detail = null;
  }
  Edit.prototype.init = function(){
    var _this = this;
    _this.getDetail();
  }
  Edit.prototype.getDetail = function () {
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
        _this.initTime();
      }
    });
  }
  Edit.prototype.initTime = function () {
    var _this = this;
    if(!_this.detail.grabTimeConfigInfo || _this.detail.grabTimeConfigInfo.length == 0){
      _this.timeList = {
        "0": {
          startTime0: "",
          endTime0: "",
          deadlineTime0: "",
        }
      }
    }else{
      _this.detail.grabTimeConfigInfo.forEach(function (item, index) {
        var id = index + "";
        _this.timeList[id] = {
          startTime: item.startTime,
          endTime: item.endTime,
          deadlineTime: item.deadlineTime,
        }
      });
    }
    laytpl($("#formTpl").html()).render({timeList: _this.timeList}, function (html) {
      $("#time_container").html(html);
      layui.each(_this.timeList, function (key, value) {
        _this.renderTime(key);
      });
      $("#grabOrderTimeDuration").val(_this.detail.grabOrderTimeDuration);
      _this.bindEvents();
      form.render();
    });
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
      var index = new Date().getTime();
      var timeList = {};
      timeList[index + ""] = {
        startTime: "",
        endTime: "",
        deadlineTime: "",
      }
      laytpl($("#formTpl").html()).render({
        timeList: timeList,
      }, function (html) {
        $("#time_container").append(html);
        _this.renderTime(index);
      });
    });
    $("#add_cancel").unbind().click(function () {
      xadmin.close();
      return false;
    });
    form.on("submit(submit)", function (data) {
      data = data.field;
      var grabOrderTimeDuration = data.grabOrderTimeDuration;
      delete data.grabOrderTimeDuration;
      var grabTimeConfigInfo = [];
      var keys = Object.keys(data);
      keys.forEach(function (item) {
        if(item.indexOf("startTime") > -1){
          var grabOrderTimeDurationItem = {};
          var index = item.replace("startTime", "") * 1;
          grabOrderTimeDurationItem.startTime = data[item];
          grabOrderTimeDurationItem.endTime = data["endTime" + index];
          grabOrderTimeDurationItem.deadlineTime = data["deadlineTime" + index];
          grabTimeConfigInfo.push(grabOrderTimeDurationItem);
        }
      });
      edipao.request({
        url: "/admin/grab/config/update",
        data: {
          grabOrderTimeDuration: grabOrderTimeDuration,
          grabTimeConfigInfo: JSON.stringify(grabTimeConfigInfo),
        }
      }).done(function (res) {
        if(res.code == 0){
          layer.alert("保存成功", {icon: 1}, function(){
            xadmin.father_reload();
            xadmin.close();
          });
        }
      });
      return false;
    });
  }
  Edit.prototype.renderTime = function (index) {
    var idList = ["startTime", "endTime", "deadlineTime"];
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