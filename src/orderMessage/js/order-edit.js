layui.use(['form', 'jquery', 'layer', 'laytpl'], function () {
  var $ = layui.jquery;
  var form = layui.form;
  var layer = layui.layer;
  var laytpl = layui.laytpl;
  function Edit(){}
  Edit.prototype.init = function(){
    this.getOrder().done(function (res) {

      this.bindEvents();
    });
  }
  Edit.prototype.getOrder = function () {
    return $.ajax({
      url: ipUrl+"admin/order/detail",
      method: "GET",
      data: {
        loginStaffId: "17718571615",
        orderNo: "OR00000001"
      }
    });
  }
  Edit.prototype.bindEvents = function(){
    $(".add_fee").unbind().on("click", function (e) {
      laytpl($("#fee_tpl").html()).render({}, function(html){
        var type = e.target.type;
        layer.open({
          title: "增加费用",
          type: 1,
          area: '400px',
          content: html,
          btn:["取消", "确认"],
          success:function () {
            form.render("checkbox");
            $("#add_fee_item").unbind().on("click", function(e){
              laytpl($("#fee_item_tpl").html()).render({}, function(html){
                layer.open({
                  title: "增加费用项",
                  type: 1,
                  area: '400px',
                  content: html,
                  btn:["取消", "确认"],
                  success:function () {
                    
                  }
                });
              })
            });
          }
        });
      });
    });
  }
  var edit = new Edit();
  edit.init();
});