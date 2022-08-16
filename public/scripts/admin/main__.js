var $approveApptModal = $('#approveApptModal')
var $delModal = $('#delModal')
var $changeTailorModal = $('#changeTailorModal')
var $statusModal = $('#statusModal')
var $addItemModal = $('#addItemModal')
var $editItemModal = $('#editItemModal')
var $removeItemModal = $('#delItemModal')


$(document).ready(function () {

    $('.apprBtn').click(function () {
        $('.apprBtn').removeClass("btn-success btn-primary")
        $('.apprBtn').not($(this)).addClass("btn-primary")
        $(this).addClass('btn-success')
        $('[name="confirmed"]').val($(this).val())
    })

    $("#approveApptModal .confirm").click(function () {
        let data = {
            id: $(this).attr("data-bs-id"),
            status: $('[name="confirmed"]').val(),
        };
        $.post("/admin/appointment/status", data, function (result) {
            $approveApptModal.modal('hide');
            location.reload()
        });
    });
    
    $('.change-tailor').click(function () {
        $('#changeTailorModal').find('.confirm').attr('data-bs-id', $(this).attr('data-bs-id'))
        $('#changeTailorModalLabel').text(`Confirm change of tailor to ${$(this).parentsUntil('card').find('.tailor-change-name').text()}?`)
    })

    $("#changeTailorModal .confirm").click(function () {
        let data = {
            id: $(this).attr("data-bs-id"),
        };
        console.log(data)
        $.post("/admin/request/tailorChange", data, function (result) {
            
            $changeTailorModal.modal('hide');
            location.reload()
        });
    });

    $('.del').click(function () {
        $.ajax({
            url: $(this).attr('data-bs-url'),
            type: 'DELETE',
            data: {
                id: $(this).attr('data-bs-id')
            },
            success: (result) => {
                $(this).closest('.modal').modal('hide');
                location.reload()
            }
        });
    });

    $('.delete').click(function () {
        $delModal.find('.del').attr('data-bs-id', $(this).attr('data-bs-id'))
    })

    $('.status').click(function () {
        let data = {
            statusId: $(this).attr('data-bs-id')
        }
        $('.statusbtn').click(function() {

            data.status = $(this).val()
            
            $('.statusbtn').removeClass("btn-success btn-primary")
            $('.statusbtn').not($(this)).addClass("btn-primary")
            $(this).addClass("btn-success")
    
            $("#statusModal .confirm").click(function () {
                $.post("/admin/request/status", data, function (result) {
                    $statusModal.modal('hide');
                    location.reload()
                });
            });
        })
    })

    
    


});
window.operateEvents = {

    'click [title="Approve Appointment"]': function (e, value, row, index) {
        $approveApptModal.find(`.apprBtn`).removeClass('btn-success btn-primary')
        $approveApptModal.find(`.apprBtn`).addClass('btn-primary')
        $approveApptModal.find('.confirm').attr('data-bs-id', row.id)
        $approveApptModal.find(`.apprBtn[value="${row.confirmed}"]`).addClass('btn-success')
        $approveApptModal.find(`.apprBtn[value="${row.confirmed}"]`).removeClass('btn-primary')
        $('[name="confirmed"]').val(row.confirmed)
        $approveApptModal.modal("show")

    },
    
}
window.itemoperateEvents = {
    'click [title="Remove Item"]': function (e, value, row, index) {
        $removeItemModal.find('.del').attr('data-bs-id', row.id)
        $removeItemModal.modal("show")
    },
    'click [title="Edit Item"]': function (e, value, row, index) {
        $editItemModal.find('[name="name"]').val(row.name)
        $editItemModal.find('[name="type"]').val(row.type)
        $editItemModal.find('[name="color"]').val(row.color)
        $editItemModal.find('[name="description"]').val(row.description)


        $editItemModal.find('.confirm').attr('data-bs-id', row.id)
        $editItemModal.modal("show")
    },
}