$(document).ready(function () {
    setDate()
    setTimeout(() => filterData(), 30);
    updateStats()
})
var seller_id = $("#seller_id").val()
function updateStats() {
    var revenue = document.getElementById("revenue")
    var orders = document.getElementById("orders")
    var customers = document.getElementById("customers")
    var balance = document.getElementById("balance")
    console.log(revenue, customers, orders)
    $.ajax({
        url: "/datapipeline/storestats",
        method: 'POST',
        contentType: "application/json",
        data: JSON.stringify({ id: seller_id }),
        success: function (res) {
            console.log(res)
            revenue.innerText = "S$" + res.revenue
            orders.innerText = res.orders
            customers.innerText = res.customers
            balance.innerText = "S$" + res.balance
            var string = res.bank
            var n = string.length - 4
            var rest = string.length - n;
            var str = string.slice(0, Math.ceil(rest / 2) + 1) + '*'.repeat(n) + string.slice(-Math.floor(rest / 2) + 1);
            $("#bankacc").text("Bank Account No. : " + str)
        }
    })
}

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
console.log('/datapipeline/salesPerDay/' + seller_id)
var getSalesPerDayData = $.get('/datapipeline/salesPerDay/' + seller_id)
var ctxsales = document.getElementById("SalesReportLineChart").getContext('2d');
var Sales = []
var dates = []
const earliestDataset_Dates = dates[0]
const latestDataset_Dates = dates[-1]
getSalesPerDayData.done(function (data) {
    data.data.forEach(element => {
        Sales.push(element["Sales_sum"])
        dates.push(element["Dates"].slice(0, 10))
    });
    console.log(dates)
    console.log(Sales)


    window.mySalesChart = new Chart(ctxsales, {
        type: 'line',
        data: {
            labels: dates,
            datasets: [{
                label: "Revenue Per Day",
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
                    beginAtZero: true,
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

    mySalesChart.data.labels = filterDate;
    mySalesChart.data.datasets[0].data = filterSales;
    mySalesChart.update();
}


var getSalesData = $.get('/datapipeline/myProduct/' + seller_id)
var ctxpsales = document.getElementById("BestSellingProductChart").getContext('2d');
var ctxpopular = document.getElementById("PopularProductChart").getContext('2d');
var PSales = []
var Names = []
var Sold = []
getSalesData.done(function (data) {
    data.data.forEach(element => {
        PSales.push(element["Sales"])
        Names.push(element["Name"])
        Sold.push(element["Sold"])
    });


    window.ProductSalesChart = new Chart(ctxpsales, {
        type: 'bar',
        data: {
            labels: Names,
            datasets: [{
                label: "S$ ",
                lineTension: 0.3,
                backgroundColor: "rgba(78, 115, 223)",
                borderColor: "rgba(78, 115, 223, 1)",
                pointRadius: 3,
                pointBackgroundColor: "rgba(78, 115, 223, 1)",
                pointBorderColor: "rgba(78, 115, 223, 1)",
                pointHoverRadius: 3,
                pointHoverBackgroundColor: "rgba(78, 115, 223, 1)",
                pointHoverBorderColor: "rgba(78, 115, 223, 1)",
                pointHitRadius: 10,
                pointBorderWidth: 2,
                data: PSales,
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
                    beginAtZero: true,
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

    window.PopularProductChart = new Chart(ctxpopular, {
        type: 'bar',
        data: {
            labels: Names,
            datasets: [{
                label: "Sold",
                lineTension: 0.3,
                backgroundColor: "rgba(78, 115, 223)",
                borderColor: "rgba(78, 115, 223, 1)",
                pointRadius: 3,
                pointBackgroundColor: "rgba(78, 115, 223, 1)",
                pointBorderColor: "rgba(78, 115, 223, 1)",
                pointHoverRadius: 3,
                pointHoverBackgroundColor: "rgba(78, 115, 223, 1)",
                pointHoverBorderColor: "rgba(78, 115, 223, 1)",
                pointHitRadius: 10,
                pointBorderWidth: 2,
                data: Sold,
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
                    beginAtZero: true,
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

var getWishlistData = $.get('/datapipeline/myProductWishlist/' + seller_id)
var ctxwishlist = document.getElementById("WishlistedProductChart").getContext('2d');
var Name = []
var Wishlists = []
getWishlistData.done(function (data) {
    data.data.forEach(element => {
        Name.push(element["Name"])
        Wishlists.push(element["Wishlistcount"])
    });


    window.myWishlistChart = new Chart(ctxwishlist, {
        type: 'bar',
        data: {
            labels: Name,
            datasets: [{
                label: "wishlisted",
                lineTension: 0.3,
                backgroundColor: "rgba(78, 115, 223)",
                borderColor: "rgba(78, 115, 223, 1)",
                pointRadius: 3,
                pointBackgroundColor: "rgba(78, 115, 223, 1)",
                pointBorderColor: "rgba(78, 115, 223, 1)",
                pointHoverRadius: 3,
                pointHoverBackgroundColor: "rgba(78, 115, 223, 1)",
                pointHoverBorderColor: "rgba(78, 115, 223, 1)",
                pointHitRadius: 10,
                pointBorderWidth: 2,
                data: Wishlists,
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
                        beginAtZero: true,
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

var getInventoryData = $.get('/datapipeline/InventoryReport')
var ctx6 = document.getElementById("InventoryReportBarchart");
getInventoryData.done(function (data) {
    var stock = []
    var name = []
    console.log(data.data)
    data.data.forEach(element => {
        stock.push(element["Stocks"])
        name.push(element["ProductName"])
        console.log(element["Stocks"])
        console.log("hi")

    });

    var mybarChart = new Chart(ctx6, {
        type: 'bar',
        data: {
            labels: name,
            datasets: [{
                label: "Current Stock",
                lineTension: 0.3,
                backgroundColor: "rgba(78, 115, 223)",
                borderColor: "rgba(78, 115, 223, 1)",
                pointRadius: 3,
                pointBackgroundColor: "rgba(78, 115, 223, 1)",
                pointBorderColor: "rgba(78, 115, 223, 1)",
                pointHoverRadius: 3,
                pointHoverBackgroundColor: "rgba(78, 115, 223, 1)",
                pointHoverBorderColor: "rgba(78, 115, 223, 1)",
                pointHitRadius: 10,
                pointBorderWidth: 2,
                data: stock,
            }],
        },
        options: {
            maintainAspectRatio: false,
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
    })
});