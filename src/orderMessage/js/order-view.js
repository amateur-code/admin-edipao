layui.use(['form', 'jquery', 'laytpl'], function () {

  var laytpl = layui.laytpl;
  var $ = layui.jquery;
  var edipao= layui.edipao;
  var form= layui.form;

  function View() {
    var qs = edipao.urlGet();
    this.orderId = qs.orderId;
    this.action = qs.action || "";
    this.user = JSON.parse(sessionStorage.user);
    this.prePay = [];
    this.arrivePay = [];
    this.tailPay = [];
    this.orderData = null;
    this.carFormList = [];
  }
  $.extend(View.prototype, {
    init: function () {
      var _this = this;
      if(this.action != "verify"){
        $("#verify_container").remove();
      }
      this.getOrder().done(function (res) {
        if(res.code == "0"){
          _this.orderData = res.data;
          _this.setData(res.data);
          _this.bindEvents();
        }else{
          layer.msg(res.message, {icon: 5,anim: 6});
        }
      });
    },
    bindEvents: function () {
      $("#verify_submit").unbind().on("click", function (e) {
        var data = form.val("verify_form");

      });
    },
    setFeeList: function () {
      //保存费用项
      var _this = this;
      laytpl($("#fee_list_tpl").html()).render({
        prePay: _this.prePay,
        tailPay: _this.tailPay,
        arrivePay: _this.arrivePay,
      }, function (html) {
        $("#fee_list_container").html(html);
      });
    },
    setData: function (data) {
       //渲染订单数据
      var _this =this;
      _this.prePay = JSON.parse(data.prePayFeeItems) || [];
      _this.tailPay = JSON.parse(data.tailPayFeeItems) || [];
      _this.arrivePay = JSON.parse(data.arrivePayFeeItems) || [];
      _this.setFeeList();
      laytpl($("#base_info_tpl").html()).render(data, function(html){
        $("#base_info").html(html);
      });
      laytpl($("#income_info_tpl").html()).render(data, function(html){
        $("#income_info").html(html);
      });
      form.val("form_ascription", data);
      form.val("form_dispatch", data);
      var carFormStr = "";
      var carFormHtml = $("#car_info_tpl").html();
      var imageStr = $("#image_tpl").html();
      data.truckDTOList.forEach(function (item, index) {
        if(!item.fetchImages) item.fetchImages = "";
        item.fetchImages = item.fetchImages.split(",");
        laytpl(imageStr).render(item, function (imageHtml) {
          var filterStr = "form_car_" + index;
          _this.carFormList.push(filterStr);
          carFormHtml = carFormHtml.replace(/CARFORM/g,filterStr);
          carFormHtml = carFormHtml.replace("IMAGESTR", imageHtml);
          carFormStr += carFormHtml;
          if(index == data.truckDTOList.length -1){
            $("#car_form_container").html(carFormStr);
          }
        });
      });
      form.render();
      _this.carFormList.forEach(function (item, index) {
        form.val(item, data.truckDTOList[index]);
      });
    },
    getOrder: function () {
      //获取订单详情
      var _this = this;
      return edipao.request({
        url: "/admin/order/detail",
        method: "GET",
        data: {
          loginStaffId: _this.user.staffId,
          orderNo: _this.orderId
        }
      });
    }
  });
  var view = new View();
  view.init();
});