function num(obj) {
  var fa = ''
  if (obj.classList.contains('allowMinus')) { //或者$(this).hasClass('allowMinus')
    obj.value.substring(0, 1) === '-' && (fa = '-')
  }
  if (obj.value !== '' && obj.value.substr(0, 1) === '.') {
    obj.value = "";
  }
  obj.value = obj.value.replace(/^0*(0\.|[1-9])/, '$1');//解决 粘贴不生效
  obj.value = obj.value.replace(/[^\d.]/g, "");  //清除“数字”和“.”以外的字符
  obj.value = obj.value.replace(/\.{2,}/g, "."); //只保留第一个. 清除多余的
  obj.value = obj.value.replace(".", "$#$").replace(/\./g, "").replace("$#$", ".");
  obj.value = obj.value.replace(/^(\-)*(\d+)\.(\d\d).*$/, '$1$2.$3');//只能输入两个小数
  if (obj.value.indexOf(".") < 0 && obj.value !== "") {//以上已经过滤，此处控制的是如果没有小数点，首位不能为类似于 01、02的金额
    if (obj.value.substr(0, 1) === '0' && obj.value.length === 2) {
      obj.value = obj.value.substr(1, obj.value.length);
    }
  }
  obj.value = fa + obj.value
}
layui.use(["jquery", "layer", "form", "laytpl", "laydate"], function () {
  var edipao = layui.edipao,
    laytpl = layui.laytpl,
    form = layui.form,
    laydate = layui.laydate,
    layer = layui.layer;
  function Edit() {
    this.timeList = {};
    this.belongLineList = {
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
    laytpl($("#formTpl").html()).render({timeList: _this.timeList, detail: _this.detail, belongLineList: _this.belongLineList}, function (html) {
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
      if(e.target.classList.contains("delete_belongLine_btn")){
        var index = e.target.dataset.index;
        $(".belongLine_item_" + index).remove();
        delete _this.belongLineList[index];
        _this.togglebelongLineTxt();
      }
    });
    $("#add_belongLine_btn").unbind().on("click", function () {
      var index = new Date().getTime();
      var belongLineList = {};
      belongLineList[index + ""] = {
        name: ""
      }
      laytpl($("#belongLine_tpl").html()).render({
        belongLineList: belongLineList,
      }, function (html) {
        $("#belongLine_container").append(html);
        _this.togglebelongLineTxt();
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
  Edit.prototype.togglebelongLineTxt = function () {
    if($(".belongLine_item").length == 0){
      $("#empty_belongLine").removeClass("hide");
    }else{
      $("#empty_belongLine").addClass("hide");
    }
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