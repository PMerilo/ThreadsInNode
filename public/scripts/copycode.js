$('.copy-btn').click( function() {
    var copyText = $(this).parent('div').prev().find('.vcode').text().split(': ')[1]
    var $temp = $("<input>");
    $("body").append($temp);
    $temp.val(copyText).select();
    $temp.select()
    document.execCommand("copy");
    $temp.remove()
    alert("Code copied!")
  }) 
  