$(document).ready(function() {


  $('.copy-btn').click(function() {
      var copyText = $(this).parent('div').prev().find('.vcode').text().split(': ')[1]
      var copyText2 = $(this).prev().val()
      console.log(copyText2)
      var $temp = $("<input>");
      $("body").append($temp);
      $temp.val(copyText).select();
      $temp.select()
      document.execCommand("copy");
      $temp.remove()
      new SnackBar({
        message:"Code Copied",
        status: "info",
        fixed: true
      });
  }) 
})