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
let datetime;


$(document).ready(function () {
    $("#tailorModal .confirm").click(function () {
        console.log($(this).attr("data-bs-reqid"))
        let data = {
            id: $(this).attr("data-bs-reqid"),
            tailorId: $tailorModal.find('select').val()
        };
        $.post("/services/request/tailorChange", data, function (result) {
            if (result.send) {
                sendNotif('request:notif', "Tailor Change", `Customer ${result.by} wants to change their tailor from you to ${result.to}`, '/admin/requests', '', result.from)
            }
            $tailorModal.modal('hide');
            $table.bootstrapTable('refresh');
            location.reload()
        });
    });

    $("#editModal .confirm").click(function () {
        let data = {
            id: $(this).attr("data-bs-id"),
            title: $('input', $editModal).val(),
            description: $('textarea', $editModal).val(),
            service: $('[name=service]', $editModal).val()
        };
        $.post("/services/request/edit", data, function (result) {
            if (result.send) {
                sendNotif('request:notif', "Request Changes", `Customer ${result.by} changed their request details of ID ${result.id}. Click here to see them.`, '/admin/requests', '', result.to)
            }
            $editModal.modal('hide');
            $table.bootstrapTable('refresh');
            location.reload()

        });
    });

    $("#editApptModal .confirm").click(function () {
        let data = {
            id: $(this).attr("data-bs-id"),
            date: $('[name=date]', $editApptModal).val(),
            time: $('[name=time]', $editApptModal).val(),
            description: $('textarea', $editApptModal).val(),
        };
        $.post("/services/appointment/edit", data, function (result) {
            if (result.send) {
                sendNotif('request:notif', "Appointment Changes", `Customer ${result.by} changed their appointment details. Click here to see them.`, '/admin/requests', '', result.to)
            }
            $editApptModal.modal('hide');
            $table.bootstrapTable('refresh');
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

    $('[title="Add Item"]').click(function () {
        $addItemModal.find('.confirm').attr('data-bs-id', $(this).attr('data-bs-id'))
        $addItemModal.modal("show")
    })

    $('#addItemModal .confirm').click(function () {
        let data = {
            id: $(this).attr("data-bs-id"),
            name: $('[name="name"]', $addItemModal).val(),
            type: $('[name="type"]', $addItemModal).val(),
            color: $('[name="color"]', $addItemModal).val(),
            description: $('textarea', $addItemModal).val(),
        };
        $.post("/services/item/add", data, function (result) {
            if (result.send) {
                sendNotif('request:notif', 'Request Item Added', `A request item in request ${data.id} was added. Click here to see it`, `/admin/requests`, ``, result.recipient)
            }
            $editItemModal.modal('hide');
            $table.bootstrapTable('refresh');
        });

        $('[name="name"]', $addItemModal).val('')
        $('[name="type"]', $addItemModal).val('')
        $('[name="color"]', $addItemModal).val('')
        $('textarea', $addItemModal).val('')
        $addItemModal.modal('hide')
        location.reload()

    })

    $('[href="#addApptModal"]').click(function () {
        let today = new Date()
        $addApptModal.find('.confirm').attr('data-bs-id', $(this).attr('data-bs-reqId'))
        $addApptModal.find('[name=time]').val('')
        $addApptModal.find('[name=tailorID]').val($(this).attr('data-bs-id'))
        console.log($('.datapicker').find('[name=tailorID]').val());
        
        getTimings()
    })

    $('#addApptModal .confirm').click(function () {
        let data = {
            date: $('[name="date"]', $addApptModal).val(),
            time: $('[name="time"]', $addApptModal).val(),
            tailorId: $('[name="tailorID"]', $addApptModal).val(),
            reqId: $(this).attr('data-bs-id')
        };
        $.post("/services/appointment/add", data, function (result) {
            if (result.send) {
                sendNotif('request:notif', 'Appointment Booked', `You have an appointment scheduled for ${result.datetime}. Click here to see it`, `/admin/requests`, ``, result.to)
            }
            $addApptModal.modal('hide');
            $table.bootstrapTable('refresh');
            location.reload()
        });

        $('[name="date"]', $addApptModal).val('')
        $('[name="time"]', $addApptModal).val('')
        $('[name="tailorID"]', $addApptModal).val('')
        $addApptModal.modal('hide')

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

    $('.delivery').click(function () {
        $('#deliverModal').find('.deliveryBtn').attr('data-bs-id', $(this).attr('data-bs-id'))
    })

    $('.deliveryBtn').click(function () {
        let data = {
            id: $(this).attr('data-bs-id'),
            method: $(this).val(),
        }

        $.post("/services/deliver", data, function (result) {

            $editItemModal.modal('hide');
            $table.bootstrapTable('refresh');
        });

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
    'click [title="Cancel Appointment"]': function (e, value, row, index) {
        $delApptModal.find('.del').attr('data-bs-id', row.id)
        $delApptModal.modal("show")
    },
    
    'click [title="Edit Appointment"]': function (e, value, row, index) {
        $editApptModal.find('.confirm').attr('data-bs-id', row.id)
        $editApptModal.find('[name=date]').val(row.date)
        $editApptModal.find('[name=time]').val(row.time)
        $editApptModal.find('[name=tailorID]').val(row.tailorId)
        $editApptModal.modal("show")
        datetime = [row.date, row.time]
        RgetTimings()
        
        // $.get(`/api/appointments?date=${row.date}&id=${row.tailorId}`, function (data) {
        //     data = data.rows
        //     var timings = `
        //         <div class="container overflow-hidden mb-3">
        //             <label class="form-label">Time</label>
        //             <div class="border border-1 rounded mx-auto row g-2 pb-2 m-0">
        //                 <div class="col-lg-2 col-md-6 d-grid">
        //                     <button type="button" class="btn btn-lg btn-primary" value="09:00:00">9:00AM</button>
        //                 </div>
        //                 <div class="col-lg-2 col-md-6 d-grid">
        //                     <button type="button" class="btn btn-lg btn-primary" value="10:30:00">10:30AM</button>
        //                 </div>
        //                 <div class="col-lg-2 col-md-6 d-grid">
        //                     <button type="button" class="btn btn-lg btn-primary" value="12:00:00">12:00PM</button>
        //                 </div>
        //                 <div class="col-lg-2 col-md-6 d-grid">
        //                     <button type="button" class="btn btn-lg btn-primary" value="15:00:00">3:00PM</button>
        //                 </div>
        //                 <div class="col-lg-2 col-md-6 d-grid">
        //                     <button type="button" class="btn btn-lg btn-primary" value="16:30:00">4:30PM</button>
        //                 </div>
        //                 <div class="col-lg-2 col-md-6 d-grid">
        //                     <button type="button" class="btn btn-lg btn-primary" value="18:00:00">6:00PM</button>
        //                 </div>
        //             </div>
        //         </div>
        //         <input type="hidden" class="form-control" name="time">
        //     `
        //     $('.timings').empty()
        //     $('.timings').append(timings)
        //     data.forEach(appt => {
        //         $(`[value="${appt.time}"]`).attr('disabled', '')
        //     });
        //     // console.log($('.timings button'))

        // }).then(function (e) {
        //     $editApptModal.find('.confirm').attr('data-bs-id', row.id)
        //     $editApptModal.find('[name=date]').val(row.date)
        //     $editApptModal.find('[name=time]').val(row.time)
        //     $editApptModal.find('[name=description]').val(row.description)
        //     $editApptModal.find('[name=tailorID]').val(row.tailorId)
        //     console.log($('.timings button.original'))

        //     $(`.timings [value='${row.time}']`).addClass('original btn-success')
        //     $(`.timings [value='${row.time}']`).removeClass('btn-primary')
        //     $('.timings button').not($(`.timings [value='${row.time}']`)).addClass('btn-primary')
        //     $('.original').removeAttr('disabled')

        //     $('.timings button').click(function () {
        //         $('.timings button').removeClass('btn-success')
        //         $('.original').addClass('btn-outline-success')
        //         if ($(this).val() == $('.original').val()) {
        //             $('.original').removeClass('btn-outline-success')
        //             $('.original').addClass('btn-success')
        //         } else {
        //             $(this).addClass('btn-success')
        //         }
        //         $('input[name="time"]').val(this.value)
        //     })
        // })

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

window.qtyEvents = {
    'change [name="qty"]': function (e, value, row, index) {
        var id = row.id
        var quantity = e.currentTarget.value
        $.post('/services/item/updateqty', {
            id: id,
            qty: quantity,
        })
    }
}