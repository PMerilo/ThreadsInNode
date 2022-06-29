var $table = $('#reqTable')
var $editModal = $('#exampleModal')
var $delModal = $('#delModal')

$(document).ready(function(){
    let data = {};
    $('.statusbtn').click(function() {
        data = {
            id: $(this).attr('data-bs-id'),
            status: $(this).text()
        }
        
        $('.statusbtn').removeClass("btn-success btn-primary")
        $('.statusbtn').not($(this)).addClass("btn-primary")
        $(this).addClass("btn-success")
    })

    $(".confirm").click(function(){
        // console.log($(this).attr('data-bs-id'))
        $.post("/admin/requests/edit", data, function(result) {
            $editModal.modal('hide');
            $table.bootstrapTable('refresh');
        });
    });

    $('.del').click(function() {
        // console.log($(this).attr('data-bs-id'))
        $.ajax({
            url: '/admin/requests/delete',
            type: 'DELETE',
            data: {
                id: $(this).attr('data-bs-id')
            },
            success: (result) => {
                $delModal.modal('hide');
                $table.bootstrapTable('refresh')
            }
          });
    })
});