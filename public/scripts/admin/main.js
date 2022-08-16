var $table = $('table')
var $editModal = $('#editModal')
var $editApptModal = $('#editApptModal')
var $delModal = $('#delModal')
var $delApptModal = $('#delApptModal')
var $tailorModal = $('#tailorModal')
var $editItemModal = $('#editItemModal')
var $removeItemModal = $('#delItemModal')
var $addItemModal = $('#addItemModal')
var $addApptModal = $('#addApptModal')

var $approveApptModal = $('#approveApptModal')
var $delModal = $('#delModal')
var $changeTailorModal = $('#changeTailorModal')
var $statusModal = $('#statusModal')
var $addItemModal = $('#addItemModal')
var $editItemModal = $('#editItemModal')
var $removeItemModal = $('#delItemModal')

let datetime;


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

    $('.status').click(function () {
        $('.statusbtn').removeClass("btn-success btn-primary")
        $('.statusbtn').addClass("btn-primary")

        $statusModal.find('.confirm').hide()
        $statusModal.find('.confirm').removeAttr('data-bs-status')
        $statusModal.find('.confirm').attr('data-bs-id', $(this).attr('data-bs-id'))
        $('.statusbtn').parent().removeClass('d-grid')
        $.get(`/api/appointment/${$(this).attr('data-bs-id')}`, ({ rows }) => {
            console.log(rows.length);
            if (rows[0].request.adminstatus == 'In Progress') {
                $('.statusbtn[value="Request Fitting Appointment"').parent().toggleClass('d-grid')
            } else if (rows.length > 1) {
                $('.statusbtn[value="Finished Request"').parent().toggleClass('d-grid')
            } else if (rows[0].request.adminstatus == 'Awaiting Fitting Appointment Booking') {
                $('.statusbtn[value="Cancel Fitting Appointment Request"').parent().toggleClass('d-grid')
            } else if (rows[0].confirmed == 'Confirmed') {
                $('.statusbtn[value="Finished Appointment"').parent().toggleClass('d-grid')
            }
        })

    })
    
    $('.statusbtn').click(function () {
        $statusModal.find('.confirm').attr("data-bs-status", $(this).val()) 
        $statusModal.find('.confirm').show()
        $('.statusbtn').removeClass("btn-success btn-primary")
        $('.statusbtn').not($(this)).addClass("btn-primary")
        $(this).addClass("btn-success")

    })

    $("#statusModal .confirm").click(function () {
        let data = {
            statusId: $(this).attr("data-bs-id"),
            status: $(this).attr("data-bs-status")
        }
        console.log(data);
        $.post("/admin/request/status", data, function (result) {
            $statusModal.modal('hide');
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


    $("#editItemModal .confirm").click(function () {
        let data = {
            id: $(this).attr("data-bs-id"),
            name: $('[name="name"]', $editItemModal).val(),
            type: $('[name="type"]', $editItemModal).val(),
            color: $('[name="color"]', $editItemModal).val(),
            description: $('textarea', $editItemModal).val(),
        };

        $.post("/services/item/edit", data, function (result) {
            if (result.send) {
                sendNotif('request:notif', 'Request Item Changed', `The request item in request ${data.id} was changed. Click here to see changes`, `/admin/requests`, ``, result.recipient)
            }
            $editItemModal.modal('hide');
            $table.bootstrapTable('refresh');
        });
    });

    $('.itemtable').on('load-success.bs.table', function (data) {
        if ($(data.currentTarget).find('tbody tr').length > 2) {
            console.log($(data.currentTarget).closest('.bootstrap-table').siblings('button'));
            $(data.currentTarget).closest('.bootstrap-table').siblings('button').hide()
        }
    })

    $('.del').click(function () {
        $.ajax({
            url: $(this).attr('data-bs-url'),
            type: 'DELETE',
            data: {
                id: $(this).attr('data-bs-id')
            },
            success: (result) => {
                console.log(result)
                $(this).closest('.modal').modal('hide');
                $table.bootstrapTable('refresh')
                if (result.send) {
                    sendNotif('request:notif', result.title, result.body, result.url, '', result.to)
                }
                location.reload()
            }
        });

    });

    $('.delete').click(function () {
        $('#delModal').find('.del').attr('data-bs-id', $(this).attr('data-bs-id'))
    })



    $('.edit').click(function () {
        let s = $(this).closest('.card').find('.req-title').text()
        s = s.split(' - ')
        $('#editModal').find('input[name=title]').val(s[1])
        $('#editModal').find(`option`).attr("selected", false)
        $('#editModal').find(`textarea`).text($(this).closest('.card').find('.req-description').text().trim())
        $('#editModal').find(`option:contains("${s[0]}")`).attr("selected", '')

        $('#editModal').find('.btn.confirm').attr('data-bs-id', $(this).attr('data-bs-id'))

    })

    $('.edit-tailor').click(function () {
        $('#tailorModal').find('[name="tailor"]').val($(this).attr('data-bs-id'))
        $('#tailorModal').find('.confirm').attr('data-bs-reqid', $(this).attr('data-bs-reqid'))
    })

    $('.cancel-tailor').click(function () {
        $('#cancelTailorModal').find('.del').attr('data-bs-id', $(this).attr('data-bs-id'))
    })

    // $('input[name=date]').change(function () {

    //     let owndate = [$(this).val(), $(this).closest('.modal-body').find('[name=time]').val()]
    //     $('input[name="time"]').val('')
    //     let tailorId = $(this).closest('.modal-body').find('[name=tailorID]').val()
    //     let date = $(this).val()
    //     $.get(`/api/appointments?date=${date}&id=${tailorId}`, function (data) {
    //         data = data.rows
    //         var timings = `
    //                 <div class="container overflow-hidden mb-3">
    //                     <label class="form-label">Time</label>
    //                     <div class="border border-1 rounded mx-auto row g-2 pb-2 m-0">
    //                         <div class="col-lg-2 col-md-6 d-grid">
    //                             <button type="button" class="btn btn-lg btn-primary" value="09:00:00">9:00AM</button>
    //                         </div>
    //                         <div class="col-lg-2 col-md-6 d-grid">
    //                             <button type="button" class="btn btn-lg btn-primary" value="10:30:00">10:30AM</button>
    //                         </div>
    //                         <div class="col-lg-2 col-md-6 d-grid">
    //                             <button type="button" class="btn btn-lg btn-primary" value="12:00:00">12:00PM</button>
    //                         </div>
    //                         <div class="col-lg-2 col-md-6 d-grid">
    //                             <button type="button" class="btn btn-lg btn-primary" value="15:00:00">3:00PM</button>
    //                         </div>
    //                         <div class="col-lg-2 col-md-6 d-grid">
    //                             <button type="button" class="btn btn-lg btn-primary" value="16:30:00">4:30PM</button>
    //                         </div>
    //                         <div class="col-lg-2 col-md-6 d-grid">
    //                             <button type="button" class="btn btn-lg btn-primary" value="18:00:00">6:00PM</button>
    //                         </div>
    //                     </div>
    //                 </div>
    //                 <input type="hidden" class="form-control" name="time">
    //             `
    //         $('.timings').empty()
    //         $('.timings').append(timings)
    //         data.forEach(appt => {
    //             console.log([appt.date, appt.time], owndate);
    //             if ([appt.date, appt.time] == owndate) {
    //                 $(`[value="${appt.time}"]`).addClass('btn-success')
    //                 $(`[value="${appt.time}"]`).removeClass('btn-primary')
    //             } else {
    //                 $(`[value="${appt.time}"]`).attr('disabled', '')
    //             }
    //         });
    //         // console.log($('.timings button'))

    //     })
    // })



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
    'click [title="Edit Item"]': function (e, value, row, index) {
        $editItemModal.find('[name="name"]').val(row.name)
        $editItemModal.find('[name="type"]').val(row.type)
        $editItemModal.find('[name="color"]').val(row.color)
        $editItemModal.find('[name="description"]').val(row.description)


        $editItemModal.find('.confirm').attr('data-bs-id', row.id)
        $editItemModal.modal("show")
    },
}
