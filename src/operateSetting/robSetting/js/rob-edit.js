layui.use(["jquery", "layer", "form", "laytpl", "laydate"], function () {
  var edipao = layui.edipao,
    laytpl = layui.laytpl,
    form = layui.form,
    laydate = layui.laydate,
    layer = layui.layer;
  function Edit() {
    this.timeList = {};
    this.routeList = {
      "0": {
        name: ""
      }
    };
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
    laytpl($("#formTpl").html()).render({timeList: _this.timeList, detail: _this.detail, routeList: _this.routeList}, function (html) {
      $("#main_form").html(html);
      layui.each(_this.timeList, function (key, value) {
        _this.renderTime(key);
      });
      _this.bindEvents();
      form.render();
    });
  }
  Edit.prototype.bindEvents = function () {
    var _this = this;
    $("#main_form").unbind().on("click", function(e){
      if(e.target.classList.contains("delete_btn")){
        var index = e.target.dataset.index;
        $(".time_row_" + index).remove();
        delete _this.timeList[index];
      }
      if(e.target.classList.contains("delete_route_btn")){
        var index = e.target.dataset.index;
        $(".route_item_" + index).remove();
        delete _this.routeList[index];
      }
    });
    $("#add_route_btn").unbind().on("click", function () {
      var index = new Date().getTime();
      var routeList = {};
      routeList[index + ""] = {
        name: ""
      }
      laytpl($("#route_tpl").html()).render({
        routeList: routeList,
      }, function (html) {
        $("#route_container").append(html);
      });
    });
    $("#add_btn").unbind().on("click", function (e) {
      var index = new Date().getTime();
      var timeList = {};
      timeList[index + ""] = {
        startTime: "",
        endTime: "",
        deadlineTime: "",
      }
      laytpl($("#time_tpl").html()).render({
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
    form.on("checkbox(driver_single_limit)", function (data) {
      if(data.elem.checked){
        $("#driver_single_compose_no").val("").attr("readonly", "readonly").attr("lay-verify", "");
        $("#driver_single_order_no").val("").attr("readonly", "readonly").attr("lay-verify", "");
      }else{
        $("#driver_single_compose_no").removeAttr("readonly", "readonly").attr("lay-verify", "required");
        $("#driver_single_order_no").removeAttr("readonly", "readonly").attr("lay-verify", "required");
      }
    });
    form.on("checkbox(driver_multi_limit)", function (data) {
      if(data.elem.checked){
        $("#driver_multi_compose_no").val("").attr("readonly", "readonly").attr("lay-verify", "");
        $("#driver_multi_order_no").val("").attr("readonly", "readonly").attr("lay-verify", "");
      }else{
        $("#driver_multi_compose_no").removeAttr("readonly", "readonly").attr("lay-verify", "required");
        $("#driver_multi_order_no").removeAttr("readonly", "readonly").attr("lay-verify", "required");
      }
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