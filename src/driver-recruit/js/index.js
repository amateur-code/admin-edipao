$(function(){
  $('.select_box').on('click', function(){
    if(!$('.select_list').hasClass('show')){
      $('.select_list').addClass('show');
      $(this).find('i').addClass('open');
    } else {
      $('.select_list').removeClass('show');
      $(this).find('i').removeClass('open');
    }
  })
  $('.select_list li').on('click', function(){
    $('.select_box').find('.txt').text($(this).text()).css({'color': '#19191A'});
    $('.select_list').removeClass('show');
    $('.select_box').find('i').removeClass('open');
  })

  $('#name, #phone').blur(function(){
    let scrollHeight = document.documentElement.scrollTop || document.body.scrollTop || 0;
    window.scrollTo(0, Math.max(scrollHeight - 1, 0));
  })

  $('.submit-btn').on('click', function(){
    if($('#name').val() == ''){
      common.toast('请输入姓名');
      return;
    }
    if($('#phone').val() == ''){
      common.toast('请输入手机号');
      return;
    }
    if(!(/^1\d{10}$/.test($('#phone').val()))){
      common.toast('请输入正确的手机号');
      return;
    }
    if($('.select_box').find('.txt').text() == '请选择类型'){
      common.toast('请选择驾照类型');
      return;
    }
    common.openRequest({ 
      url: 'open/driver/recruit/save',
      type: 'post',
      data: {
        name: $('#name').val(),
        phone: $('#phone').val(),
        driverLicenceType: $('.select_box').find('.txt').text()
      }
    }).done(function(res) {
      if(+res.code != 0){
        common.toast(res.message);
        return;
      }
      $('#name').val('');
      $('#phone').val('');
      $('.select_box').find('.txt').text('请选择驾照类型').css({'color': '#666'});
      common.toast('提交成功');
    })
  })
})