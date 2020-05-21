layui.use(['jquery','form', 'layer', 'laytpl', 'table', 'upload'], function(){
  var $ = layui.jquery,
      form = layui.form,
      layer = layui.layer,
      laytpl = layui.laytpl,
      table = layui.table,
      upload = layui.upload,
      edipao = layui.edipao;
  function Add(){
    var qs = edipao.urlGet();
    this.id = qs.id;
    this.action = qs.action;
    this.picList = [];
  }
  Add.prototype.init = function () {
    var _this = this;
    this.renderUpload();
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
    
  }
  var add = new Add();
  add.init();
});
