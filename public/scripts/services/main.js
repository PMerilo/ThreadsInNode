var $table = $('#reqTable')
var $editModal = $('#exampleModal')
var $delModal = $('#delModal')

$(document).ready(function(){
    
    $(".confirm").click(function(){
        let data = {
            id: $(this).attr("data-bs-id"),
            title: $('input', $editModal).val(),
            description: $('textarea', $editModal).val(),
            service: $('[name=service]', $editModal).val()
        };
        console.log(data)
        $.post("/services/request/edit", data, function(result) {
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
    });

    console.log($('.toggle-view'))
    
});