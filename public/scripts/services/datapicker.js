function timeClick() {
    $('.timings button').click(function () {
        $('.timings button').removeClass('btn-success')
        $(this).addClass('btn-success')
        $('.timings button').not($(this)).addClass('btn-primary')
        $('input[name="time"]').val(this.value)
        // console.log($('input[name="time"]'))
    })
}

function getTimings() {
    $.get(`/api/appointments?date=${$('input[name=date]').val()}&id=${$('[name=tailorID]').val()}`, function (data) {
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
        
    }).then(timeClick)

}


$('input[name=date]').change(function() {
    $('input[name="time"]').val('')
    console.log($('[name=tailorID]').val())
    if($('[name=tailorID]').val() != "Select Tailor") {
        getTimings()
    }
})
$('[name=tailorID]').change(function() {
    $('input[name="time"]').val('')
    console.log($('input[name=date]').val())
    if($('input[name=date]').val()) {
        getTimings()
    }
})
