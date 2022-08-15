// Set new default font family and font color to mimic Bootstrap's default styling
Chart.defaults.global.defaultFontFamily = 'Nunito', '-apple-system,system-ui,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Arial,sans-serif';
Chart.defaults.global.defaultFontColor = '#858796';

$(document).ready(function () {
  setDate()
  setTimeout(() => filterData(), 30);
})
var prev_btn = document.getElementById('prev-btn');
var next_btn = document.getElementById('next-btn');
var now = new Date();
var dd = String(now.getDate()).padStart(2, '0');
var mm = String(now.getMonth() + 1).padStart(2, '0'); //January is 0!
var yyyy = now.getFullYear();

const today = dd + '/' + mm + '/' + yyyy;
const lastweekdisplay = formatDate(getWeek(-1));

function number_format(number, decimals, dec_point, thousands_sep) {
  // *     example: number_format(1234.56, 2, ',', ' ');
  // *     return: '1 234,56'
  number = (number + '').replace(',', '').replace(' ', '');
  var n = !isFinite(+number) ? 0 : +number,
    prec = !isFinite(+decimals) ? 0 : Math.abs(decimals),
    sep = (typeof thousands_sep === 'undefined') ? ',' : thousands_sep,
    dec = (typeof dec_point === 'undefined') ? '.' : dec_point,
    s = '',
    toFixedFix = function (n, prec) {
      var k = Math.pow(10, prec);
      return '' + Math.round(n * k) / k;
    };
  // Fix for IE parseFloat(0.55).toFixed(0) = 0;
  s = (prec ? toFixedFix(n, prec) : '' + Math.round(n)).split('.');
  if (s[0].length > 3) {
    s[0] = s[0].replace(/\B(?=(?:\d{3})+(?!\d))/g, sep);
  }
  if ((s[1] || '').length < prec) {
    s[1] = s[1] || '';
    s[1] += new Array(prec - s[1].length + 1).join('0');
  }
  return s.join(dec);
}


// No Of Users Joined Chart
var getUsersJoinedData = $.get('/datapipeline/NoOfUsersJoined')
var ctxUsersJoined = document.getElementById("NoOfUsersJoinedChart").getContext('2d');
getUsersJoinedData.done(function (data) {
  var NoOfUsers = []
  var dates = []
  data.data.forEach(element => {
    NoOfUsers.push(element["NoOfUsersJoined_sum"])
    dates.push(element["Dates"].slice(0, 10))

  });

  var myLineChart = new Chart(ctxUsersJoined, {
    type: 'line',
    data: {
      labels: dates,
      datasets: [{
        label: "Number of Users Joined",
        lineTension: 0.3,
        backgroundColor: "rgba(78, 115, 223, 0.05)",
        borderColor: "rgba(78, 115, 223, 1)",
        pointRadius: 3,
        pointBackgroundColor: "rgba(78, 115, 223, 1)",
        pointBorderColor: "rgba(78, 115, 223, 1)",
        pointHoverRadius: 3,
        pointHoverBackgroundColor: "rgba(78, 115, 223, 1)",
        pointHoverBorderColor: "rgba(78, 115, 223, 1)",
        pointHitRadius: 10,
        pointBorderWidth: 2,
        data: NoOfUsers,
      }],
    },
    options: {
      maintainAspectRatio: false,
      layout: {
        padding: {
          left: 10,
          right: 25,
          top: 25,
          bottom: 0
        }
      },
      scales: {
        xAxes: [{
          time: {
            unit: 'date'
          },
          gridLines: {
            display: false,
            drawBorder: false
          },
          ticks: {
            maxTicksLimit: 7,

          }
        }],
        yAxes: [{
          ticks: {
            maxTicksLimit: 5,
            padding: 10,
            // Include a dollar sign in the ticks
            callback: function (value, index, values) {
              return number_format(value);
            }
          },
          gridLines: {
            color: "rgb(234, 236, 244)",
            zeroLineColor: "rgb(234, 236, 244)",
            drawBorder: false,
            borderDash: [2],
            zeroLineBorderDash: [2]
          }
        }],
      },
      legend: {
        display: false
      },
      tooltips: {
        backgroundColor: "rgb(255,255,255)",
        bodyFontColor: "#858796",
        titleMarginBottom: 10,
        titleFontColor: '#6e707e',
        titleFontSize: 14,
        borderColor: '#dddfeb',
        borderWidth: 1,
        xPadding: 15,
        yPadding: 15,
        displayColors: false,
        intersect: false,
        mode: 'index',
        caretPadding: 10,
        callbacks: {
          label: function (tooltipItem, chart) {
            var datasetLabel = chart.datasets[tooltipItem.datasetIndex].label || '';
            return datasetLabel + " " + number_format(tooltipItem.yLabel);
          }
        }
      }
    }
  });

})


var getTITSalesData = $.get('/datapipeline/totalSalesPerDay')
var ctxTITSales = document.getElementById("TITSales").getContext('2d');
var Sales = []
var dates = []
getTITSalesData.done(function (data) {
  data.data.forEach(element => {
    Sales.push(element["Sales_sum"])
    dates.push(element["Dates"].slice(0, 10))

  });

  window.myTITSalesChart = new Chart(ctxTITSales, {
    type: 'line',
    data: {
      labels: dates,
      datasets: [{
        label: "Sales S$",
        lineTension: 0.3,
        backgroundColor: "rgba(78, 115, 223, 0.05)",
        borderColor: "rgba(78, 115, 223, 1)",
        pointRadius: 3,
        pointBackgroundColor: "rgba(78, 115, 223, 1)",
        pointBorderColor: "rgba(78, 115, 223, 1)",
        pointHoverRadius: 3,
        pointHoverBackgroundColor: "rgba(78, 115, 223, 1)",
        pointHoverBorderColor: "rgba(78, 115, 223, 1)",
        pointHitRadius: 10,
        pointBorderWidth: 2,
        data: Sales,
      }],
    },
    options: {
      maintainAspectRatio: false,
      layout: {
        padding: {
          left: 10,
          right: 25,
          top: 25,
          bottom: 0
        }
      },
      scales: {
        xAxes: [{
          time: {
            unit: 'date'
          },
          gridLines: {
            display: false,
            drawBorder: false
          },
          ticks: {
            maxTicksLimit: 7,

          }
        }],
        yAxes: [{
          ticks: {
            maxTicksLimit: 5,
            padding: 10,
            // Include a dollar sign in the ticks
            callback: function (value, index, values) {
              return number_format(value);
            }
          },
          gridLines: {
            color: "rgb(234, 236, 244)",
            zeroLineColor: "rgb(234, 236, 244)",
            drawBorder: false,
            borderDash: [2],
            zeroLineBorderDash: [2]
          }
        }],
      },
      legend: {
        display: false
      },
      tooltips: {
        backgroundColor: "rgb(255,255,255)",
        bodyFontColor: "#858796",
        titleMarginBottom: 10,
        titleFontColor: '#6e707e',
        titleFontSize: 14,
        borderColor: '#dddfeb',
        borderWidth: 1,
        xPadding: 15,
        yPadding: 15,
        displayColors: false,
        intersect: false,
        mode: 'index',
        caretPadding: 10,
        callbacks: {
          label: function (tooltipItem, chart) {
            var datasetLabel = chart.datasets[tooltipItem.datasetIndex].label || '';
            return datasetLabel + " " + number_format(tooltipItem.yLabel);
          }
        }
      }
    }
  });
})


function getWeek(week) {
  var noofdays = week * 6
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate() + noofdays);
}

function formatDate(date) {
  var dd = String(date.getDate()).padStart(2, '0');
  var mm = String(date.getMonth() + 1).padStart(2, '0'); //January is 0!
  var yyyy = date.getFullYear();
  const formattedweek = dd + '/' + mm + '/' + yyyy;
  return formattedweek;
}

$(".previous-week").click(function () {
  var val = $("#weekcount").val()
  var weekcount = val - 1
  $("#weekcount").val(weekcount)
  var week = $(".date-span").text().slice(0, 10)
  var prevweek = formatDate(getWeek(weekcount))
  if (prevweek == week) {
    var prevweek = formatDate(getWeek(weekcount - 1))
  }
  $(".date-span").text(prevweek + " - " + week)
  $("#prev").val(prevweek)
  $("#next").val(week)
  setTimeout(() => filterData(), 300);
})

$(".next-week").click(function () {
  var val = $("#weekcount").val()
  var weekcount = parseInt(val) + 1
  $("#weekcount").val(weekcount)
  var week = $(".date-span").text().slice(-10)
  var nextweek = formatDate(getWeek(weekcount))
  if (prevweek == week) {
    var prevweek = formatDate(getWeek(weekcount + 1))
  }
  $(".date-span").text(week + " - " + nextweek)
  $("#prev").val(week)
  $("#next").val(nextweek)
  setTimeout(() => filterData(), 300);
})

function setDate() {
  $(".date-span").text(lastweekdisplay + " - " + today)
  $("#prev").val(lastweekdisplay)
  $("#next").val(today)
}

function filterData() {
  var prevweek = $("#prev").val();
  var nextweek = $("#next").val();
  const updated_dates = [...dates];
  const updated_sales = [...Sales];

  var indexStart = updated_dates.indexOf(prevweek);
  var indexEnd = updated_dates.indexOf(nextweek);

  if (indexStart < 0) {
    indexStart = 0
    prev_btn.style.display = "none";
  } else {
    prev_btn.style.display = "";
  }
  if (!(indexEnd in updated_dates)) {
    indexEnd = updated_dates.length - 1
    next_btn.style.display = "none";
  } else {
    next_btn.style.display = "";
  }

  $(".actual-date-span").text("Daily Revenue figures from " + updated_dates[indexStart] + " - " + updated_dates[indexEnd])

  const filterDate = updated_dates.slice(indexStart, indexEnd + 1);
  const filterSales = updated_sales.slice(indexStart, indexEnd + 1);

  myTITSalesChart.data.labels = filterDate;
  myTITSalesChart.data.datasets[0].data = filterSales;
  myTITSalesChart.update();
}



