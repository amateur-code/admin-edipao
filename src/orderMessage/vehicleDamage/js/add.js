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
    this.id = qs.id;
    this.action = qs.action;
    this.picList = [];
  }
  Add.prototype.init = function () {
    var _this = this;
    this.verifyForm();
    if(_this.action == "edit"){

    }else{
      this.renderUpload();
      this.bindEvents();
    }
  }
  Add.prototype.bindEvents = function () {
    form.on("submit(submit)", function (data) {
      data = data.field;
      console.log(data)
      return false;
    });
    $('#addCancel').click(function () {
      xadmin.close();
      return false;
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
      ,url: layui.edipao.API_HOST+'/admin/truck/upload/image' //上传接口
      , data: {
        loginStaffId: edipao.getLoginStaffId(),
        type: 2,
        truckId: "1",
        index: _this.picList.length + 1,
      }
      ,done: function(res, index, upload){ //上传后的回调
        if(res.code == "0"){
          var pic = res.data;
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
