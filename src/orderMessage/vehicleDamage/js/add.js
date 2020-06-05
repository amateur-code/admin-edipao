layui.use(['jquery','form', 'layer', 'laytpl', 'table', 'upload'], function(){
  var $ = layui.jquery,
      form = layui.form,
      layer = layui.layer,
      laytpl = layui.laytpl,
      upload = layui.upload,
      edipao = layui.edipao;
  window.form = form;
  function Add(){
    var qs = edipao.urlGet();
    this.id = qs.id || "";
    this.orderNo = qs.orderNo;
    this.action = qs.action;
    this.picList = [];
  }
  Add.prototype.init = function () {
    var _this = this;
    this.verifyForm();
    if(_this.action == "edit"){
      _this.getDetail();
    }else{
      this.renderUpload();
    }
    this.bindEvents();
  }
  Add.prototype.bindEvents = function () {
    var _this = this;
    form.on("submit(submit)", function (data) {
      if(_this.picList.length == 0){
        layer.msg("请上传相关图片！", {icon: 2});
        return false;
      }
      data = data.field;
      var params = {
        loginStaffId: edipao.getLoginStaffId(),
        orderNo: _this.orderNo,
        type: data.type,
        remark: data.remark,
        images: _this.picList.join(","),
      }
      var url = "/admin/order/damage/add";
      if(_this.action == "edit") {
        params.id = _this.id;
        url = "/admin/order/damage/update";
      }
      edipao.request({
        url: url,
        data: params,
        method: "POST",
      }).done(function (res) {
        if(res.code == "0"){
          layer.msg("提交成功", {icon: 1});
          setTimeout(function () {
            xadmin.father_reload();
            xadmin.close();
          }, 1000);
        }
      });
      return false;
    });
    $('#addCancel').click(function () {
      xadmin.close();
      return false;
    });
  }
  Add.prototype.getDetail = function () {
    var _this = this;
    edipao.request({
      url: "/admin/order/damage/get",
      data: {
        loginStaffId: edipao.getLoginStaffId(),
        id: _this.id,
      },
      method: "POST",
    }).done(function (res) {
      if(res.code == "0"){
        form.val("main_form", res.data);
        _this.picList = res.data.images.split(",");
        _this.renderUploadPic();
      }
    });
  }
  Add.prototype.renderUpload = function () {
    var _this = this;
    upload.render({
      elem: '#upload_btn'
      ,size: 1024*5
      ,accept: 'images' //只允许上传图片
      ,acceptMime: 'image/*' //只筛选图片
      ,multiple: false
      ,url: layui.edipao.API_HOST + '/admin/order/damage/upload/image' //上传接口
      , data: {
        orderNo: _this.orderNo,
        loginStaffId: edipao.getLoginStaffId(),
      }
      ,done: function(res, index, upload){ //上传后的回调
        if(res.code == "0"){
          var pic = res.data;
          if(_this.picList.length == 20){
            layer.msg("最多上传20张图片", {icon: 2});
            return false;
          }
          _this.picList.push(pic);
          _this.renderUploadPic();
        }
      } 
    })
  }
  Add.prototype.renderUploadPic = function () {
    var _this = this;
    laytpl($("#upload_img_tpl").html()).render({list: _this.picList}, function (html) {
      $(".upload_pic_item").remove();
      $("#upload_pic_list").append(html);
      _this.bindDeletePic();
      zoomImg();
    });
  }
  Add.prototype.bindDeletePic = function () {
    var _this = this;
    $(".pic_del_btn").unbind().on("click", function (e) {
      var index = e.target.dataset.index * 1;
      _this.picList.splice(index, 1);
      _this.renderUploadPic();
    });
  }
  Add.prototype.verifyForm = function () {
    form.verify({
      nameVerify: function(value){
        if(value == undefined){
          return "必填项不能为空";
        }
        if(value == ""){
          return "必填项不能为空";
        }
      },
      remarkVerify: function (value) {
        if(value.length > 300){
          return "备注长度不能超过300个字符";
        }
      }
    })
  }
  var add = new Add();
  add.init();
});
