$('input[name=date]').change(function () {
    // console.log(this.value)
    $.get(`/api/appointments/${this.value}`, function (data) {
        data = data.rows
        var timings = `
        <label>Time</label>
        <div class="">
            <div class="border border-1 rounded col-12 mx-auto d-flex justify-content-between py-3">
                <button type="button" class="btn btn-lg btn-primary flex-fill mx-3" value="09:00:00">9:00AM</button>
                <button type="button" class="btn btn-lg btn-primary flex-fill mx-3" value="10:30:00">10:30AM</button>
                <button type="button" class="btn btn-lg btn-primary flex-fill mx-3" value="12:00:00">12:00PM</button>
                <button type="button" class="btn btn-lg btn-primary flex-fill mx-3" value="15:00:00">3:00PM</button>
                <button type="button" class="btn btn-lg btn-primary flex-fill mx-3" value="16:30:00">4:30PM</button>
                <button type="button" class="btn btn-lg btn-primary flex-fill mx-3" value="18:00:00">6:00PM</button>
            </div>
        </div>
        <input type="hidden" class="form-control" name="time">
        `
        $('.timings').empty()
        $('.timings').append(timings)
        data.forEach(appt => {
            $(`[value="${appt.time}"]`).attr('disabled','')
        });
        // console.log($('.timings button'))
        $('.timings button').click(function() {
            $('.timings button').removeClass('btn-success')
            $(this).addClass('btn-success')
            $('.timings button').not($(this)).addClass('btn-primary')
            $('input[name="time"]').val(this.value)
            // console.log($('input[name="time"]'))
        })
    })
    
})
