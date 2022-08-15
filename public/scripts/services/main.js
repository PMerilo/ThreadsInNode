var $table = $('table')
var $editModal = $('#editModal')
var $editApptModal = $('#editApptModal')
var $delModal = $('#delModal')
var $delApptModal = $('#delApptModal')
var $tailorModal = $('#tailorModal')
var $editItemModal = $('#editItemModal')
var $removeItemModal = $('#delItemModal')


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

    $('input[name=date]').change(function () {
        $('input[name="time"]').val('')
        // console.log($('[name=tailorID]').val())
        if ($('[name=tailorID]').val() != "Select Tailor") {
            $.get(`/api/appointments?date=${row.date}&id=${row.tailorId}`, function (data) {
                console.log(data)
                data = data.rows
                var timings = `
                    <div class="container overflow-hidden mb-3">
                        <label class="form-label">Time</label>
                        <div class="border border-1 rounded mx-auto row g-2 pb-2 m-0">
                            <div class="col-lg-2 col-md-6 d-grid">
                                <button type="button" class="btn btn-lg btn-primary" value="09:00:00">9:00AM</button>
                            </div>
                            <div class="col-lg-2 col-md-6 d-grid">
                                <button type="button" class="btn btn-lg btn-primary" value="10:30:00">10:30AM</button>
                            </div>
                            <div class="col-lg-2 col-md-6 d-grid">
                                <button type="button" class="btn btn-lg btn-primary" value="12:00:00">12:00PM</button>
                            </div>
                            <div class="col-lg-2 col-md-6 d-grid">
                                <button type="button" class="btn btn-lg btn-primary" value="15:00:00">3:00PM</button>
                            </div>
                            <div class="col-lg-2 col-md-6 d-grid">
                                <button type="button" class="btn btn-lg btn-primary" value="16:30:00">4:30PM</button>
                            </div>
                            <div class="col-lg-2 col-md-6 d-grid">
                                <button type="button" class="btn btn-lg btn-primary" value="18:00:00">6:00PM</button>
                            </div>
                        </div>
                    </div>
                    <input type="hidden" class="form-control" name="time">
                `
                $('.timings').empty()
                $('.timings').append(timings)
                data.forEach(appt => {
                    $(`[value="${appt.time}"]`).attr('disabled', '')
                });
                // console.log($('.timings button'))

            })
        }
    })

});
window.operateEvents = {
    'click [title="Cancel Appointment"]': function (e, value, row, index) {
        $delApptModal.find('.del').attr('data-bs-id', row.id)
        $delApptModal.modal("show")
    },

    'click [title="Edit Appointment"]': function (e, value, row, index) {
        $.get(`/api/appointments?date=${row.date}&id=${row.tailorId}`, function (data) {
            data = data.rows
            var timings = `
                <div class="container overflow-hidden mb-3">
                    <label class="form-label">Time</label>
                    <div class="border border-1 rounded mx-auto row g-2 pb-2 m-0">
                        <div class="col-lg-2 col-md-6 d-grid">
                            <button type="button" class="btn btn-lg btn-primary" value="09:00:00">9:00AM</button>
                        </div>
                        <div class="col-lg-2 col-md-6 d-grid">
                            <button type="button" class="btn btn-lg btn-primary" value="10:30:00">10:30AM</button>
                        </div>
                        <div class="col-lg-2 col-md-6 d-grid">
                            <button type="button" class="btn btn-lg btn-primary" value="12:00:00">12:00PM</button>
                        </div>
                        <div class="col-lg-2 col-md-6 d-grid">
                            <button type="button" class="btn btn-lg btn-primary" value="15:00:00">3:00PM</button>
                        </div>
                        <div class="col-lg-2 col-md-6 d-grid">
                            <button type="button" class="btn btn-lg btn-primary" value="16:30:00">4:30PM</button>
                        </div>
                        <div class="col-lg-2 col-md-6 d-grid">
                            <button type="button" class="btn btn-lg btn-primary" value="18:00:00">6:00PM</button>
                        </div>
                    </div>
                </div>
                <input type="hidden" class="form-control" name="time">
            `
            $('.timings').empty()
            $('.timings').append(timings)
            data.forEach(appt => {
                $(`[value="${appt.time}"]`).attr('disabled', '')
            });
            // console.log($('.timings button'))

        }).then(function (e) {
            $editApptModal.find('.confirm').attr('data-bs-id', row.id)
            $editApptModal.find('[name=date]').val(row.date)
            $editApptModal.find('[name=time]').val(row.time)
            $editApptModal.find('[name=description]').val(row.description)
            $editApptModal.find('[name=tailorID]').val(row.tailorId)
            console.log($('.timings button.original'))

            $(`.timings [value='${row.time}']`).addClass('original btn-success')
            $(`.timings [value='${row.time}']`).removeClass('btn-primary')
            $('.timings button').not($(`.timings [value='${row.time}']`)).addClass('btn-primary')
            $('.original').removeAttr('disabled')
            $editApptModal.modal("show")

            $('.timings button').click(function () {
                $('.timings button').removeClass('btn-success')
                $('.original').addClass('btn-outline-success')
                if ($(this).val() == $('.original').val()) {
                    $('.original').removeClass('btn-outline-success')
                    $('.original').addClass('btn-success')
                } else {
                    $(this).addClass('btn-success')
                }
                $('input[name="time"]').val(this.value)
            })
        })

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