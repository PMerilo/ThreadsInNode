// Display selected file name
$(".custom-file-input").on("change", function () {
    var fileName = $(this).val().split("\\").pop();
    $(this).siblings(".custom-file-label").addClass("selected").html(fileName);
  });
  
// Use fetch to call post route /video/upload
$('#posterUpload').on('change', function () {
let formdata = new FormData();
if(formdata!=undefined){
    let image = $("#posterUpload")[0].files[0];
    formdata.append('posterUpload', image);
    fetch('/upload', {
        method: 'POST',
        body: formdata
    })
        .then(res => res.json())
        .then((data) => {
            $('#poster').attr('src', data.file);
            $('#posterURL').attr('value', data.file); // sets posterURL hidden field
            if (data.err) {
                $('#posterErr').show();
                $('#posterErr').text(data.err.message);
            }
            else {
                $('#posterErr').hide();
            }
        })
}

});