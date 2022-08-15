function RtimeClick() {
    $('.editApptpicker').find('.timings button').click(function () {
        $('.editApptpicker').find('.timings button').removeClass('btn-success btn-outline-success')
        $(this).addClass('btn-success')
        $('.ori').not($(this)).addClass('btn-outline-success')
        $('.editApptpicker').find('.timings button').not($(this)).not('.ori').addClass('btn btn-lg btn-primary')
        $('.editApptpicker').find('input[name="time"]').val(this.value)
        // console.log($('input[name="time"]'))
        $('.timelabel').text(`${$('.editApptpicker').find('input[name="date"]').val()} ${$('.editApptpicker').find('input[name="time"]').val()}`)
    })
    $('.timelabel').text(`${$('.editApptpicker').find('input[name="date"]').val()} ${$('.editApptpicker').find('input[name="time"]').val()}`)
    
    $('.editApptpicker').find(`[value="${$('.timelabel').text().split(' ')[1]}"]`).addClass('btn-success')
    $('.editApptpicker').find(`[value="${$('.timelabel').text().split(' ')[1]}"]`).removeClass('btn-primary')
    $('.editApptpicker').find(`[value="${$('.timelabel').text().split(' ')[1]}"]`).removeClass('btn-outline-success')

}

function RgetTimings() {
    $.get(`/api/appointments?date=${$('.editApptpicker').find('input[name=date]').val()}&id=${$('.editApptpicker').find('[name=tailorID]').val()}`, function (data) {
        data = data.rows
        // console.log(data)
        var timings = `
        <div class="overflow-hidden mb-3">
        <label class="form-label">Time</label>
        <div class="mx-auto row g-2 pb-2 m-0">
        <div class="col-lg-2 col-md-6 d-flex">
        <button type="button" class="btn btn-lg btn-primary flex-fill" value="09:00:00">9:00AM</button>
        </div>
        <div class="col-lg-2 col-md-6 d-flex">
        <button type="button" class="btn btn-lg btn-primary flex-fill" value="10:30:00">10:30AM</button>
        </div>
        <div class="col-lg-2 col-md-6 d-flex">
        <button type="button" class="btn btn-lg btn-primary flex-fill" value="12:00:00">12:00PM</button>
        </div>
        <div class="col-lg-2 col-md-6 d-flex">
        <button type="button" class="btn btn-lg btn-primary flex-fill" value="15:00:00">3:00PM</button>
        </div>
        <div class="col-lg-2 col-md-6 d-flex">
        <button type="button" class="btn btn-lg btn-primary flex-fill" value="16:30:00">4:30PM</button>
        </div>
        <div class="col-lg-2 col-md-6 d-flex">
        <button type="button" class="btn btn-lg btn-primary flex-fill" value="18:00:00">6:00PM</button>
        </div>
        </div>
        </div>
        `
        $('.editApptpicker').find('.timings').empty()
        $('.editApptpicker').find('.timings').append(timings)
        data.forEach(appt => {
            if ($('.editApptpicker').find('input[name="date"]').val() == datetime[0] && $('.editApptpicker').find(`[value="${appt.time}"]`).val() == datetime[1]) {
                $('.editApptpicker').find(`[value="${appt.time}"]`).addClass('btn-outline-success')
                $('.editApptpicker').find(`[value="${appt.time}"]`).addClass('ori')
                $('.editApptpicker').find(`[value="${appt.time}"]`).removeClass('btn-primary')
            } else {
                $('.editApptpicker').find(`[value="${appt.time}"]`).attr('disabled', '')
            }
        });

        // console.log($('.timings button'))

    }).then(RtimeClick)

}


$('.editApptpicker').find('input[name=date]').change(function () {
    // $('input[name="time"]').val('')
    console.log($('[name=tailorID]').val())
    if ($('[name=tailorID]').val() != "Select Tailor") {
        RgetTimings()
    }

})

