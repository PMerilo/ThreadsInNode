$('#notificationdropdown').blur( function(){
    if ($(this).attr('class').includes('show')) {

      $(this).find('i').toggleClass('bi-bell')
      $(this).find('i').toggleClass('bi-bell-fill')
    }
})

$('#notificationdropdown').click( function(){

  $(this).find('i').toggleClass('bi-bell')
  $(this).find('i').toggleClass('bi-bell-fill')
  
})

$(document).ready(function(){
  if($('li span.p-1').length > 0) {
    $('i.position-relative').append('<span class="position-absolute start-100 top-0 translate-middle p-1 bg-danger border border-light rounded-circle"><span class="visually-hidden">New alerts</span></span>')
  }
})
