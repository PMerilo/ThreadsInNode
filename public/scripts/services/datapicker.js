function timeClick() {
    $('.datapicker').find('.timings button').click(function () {
        $('.datapicker').find('.timings button').removeClass('btn-success')
        $(this).addClass('btn-success')
        $('.datapicker').find('.timings button').not($(this)).addClass('btn btn-lg btn-primary')
        $('.datapicker').find('input[name="time"]').val(this.value)
        // console.log($('input[name="time"]'))
        $('.datapicker').find('.timelabel').text(`${$('.datapicker').find('input[name="date"]').val()} ${$('.datapicker').find('input[name="time"]').val()}`)

    })
    $('.datapicker').find('.timelabel').text(`${$('.datapicker').find('input[name="date"]').val()} ${$('.datapicker').find('input[name="time"]').val()}`)

    $('.datapicker').find(`[value="${$('.timelabel').text().split(' ')[1]}"]`).addClass('btn-success')
    $('.datapicker').find(`[value="${$('.timelabel').text().split(' ')[1]}"]`).removeClass('btn-primary')


}

function getTimings() {
    $.get(`/api/appointments?date=${$('.datapicker').find('input[name=date]').val()}&id=${$('.datapicker').find('[name=tailorID]').val()}`, function (data) {
        data = data.rows
        console.log(data)
        var timings = `
            <div class="'.datapicker' overflow-hidden mb-3">
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
        $('.datapicker').find('.timings').empty()
        $('.datapicker').find('.timings').append(timings)
        data.forEach(appt => {
            $('.datapicker').find(`[value="${appt.time}"]`).attr('disabled', '')
        });
        // console.log($('.timings button'))
        
    }).then(timeClick)

}


$('.datapicker').find('input[name=date]').change(function() {
    // $('input[name="time"]').val('')
    console.log($('[name=tailorID]').val())
    if($('[name=tailorID]').val() != "Select Tailor") {
        getTimings()
    }
})
$('.datapicker').find('[name=tailorID]').change(function() {
    $('input[name="time"]').val('')
    console.log($('input[name=date]').val())
    if($('input[name=date]').val()) {
        getTimings()
    }
})
