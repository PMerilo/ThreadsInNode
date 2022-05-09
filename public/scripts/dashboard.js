
const backgroundColor = []
data[3].y.forEach(element => {
    console.log(element)
    if (element <= 30 ) {
        backgroundColor.push('rgba(255, 99, 132, 1)')
    } else if (element <= 100) {
        backgroundColor.push('rgba(255, 206, 86, 1)')
    } else {
        backgroundColor.push('green')
    }
});
const restockctx = document.getElementById('restockChart').getContext('2d');
const restockChart = new Chart(restockctx, {
    type: 'bar',
    data: {
        labels: data[3].x,
        datasets: [{
            label: 'Stocks',
            data: data[3].y,
            backgroundColor: backgroundColor,
            borderColor: backgroundColor,
            borderWidth: 1
        }]
    },
    options: {
        aspect_ratio: 1,
        plugins: {
            title: {
                display: true,
                align: 'start',
                text: 'Inventory Health',
                font: {
                    family: "'Roboto', sans-serif",
                    size: 24,
                },
                color: [
                    'rgba(0, 0, 0, 1)'
                ],
                padding: {
                    top: 20
                }
            }
        },
        scales: {
            yAxis: {
                min: 0,
                suggestedMax: 10
            }
        }
    }
});
const outofstockctx = document.getElementById('outofstockChart').getContext('2d');
const outofstockChart = new Chart(outofstockctx, {
    type: 'bar',
    data: {
        labels: data[6].x,
        datasets: [{
            label: 'Visitors',
            data: data[6].y,
            backgroundColor: [
                'rgba(255, 99, 132, 1)',
                'rgba(54, 162, 235, 1)',
                'rgba(255, 206, 86, 1)',
                'rgba(75, 192, 192, 1)',
                'rgba(153, 102, 255, 1)',
                'rgba(255, 159, 64, 1)'
            ],
            borderColor: [
                'rgba(255, 99, 132, 1)',
                'rgba(54, 162, 235, 1)',
                'rgba(255, 206, 86, 1)',
                'rgba(75, 192, 192, 1)',
                'rgba(153, 102, 255, 1)',
                'rgba(255, 159, 64, 1)'
            ],
            borderWidth: 1
        }]
    },
    options: {
        aspect_ratio: 1,
        plugins: {
            title: {
                display: true,
                align: 'start',
                text: 'Visitors Today',
                font: {
                    family: "'Roboto', sans-serif",
                    size: 24,
                },
                color: [
                    'rgba(0, 0, 0, 1)'
                ],
                padding: {
                    top: 20
                }
            }
        },
        scales: {
            yAxis: {
                min: 0,
                suggestedMax: 10
            }
        }
    }
});

const revenuectx = document.getElementById('revenueChart').getContext('2d');
const revenueChart = new Chart(revenuectx, {
    type: 'line',
    data: {
        labels: data[4].x,
        datasets: [{
            label: '$',
            data: data[4].y,
            backgroundColor: [
                'rgba(255, 99, 132, 1)',
                'rgba(54, 162, 235, 1)',
                'rgba(255, 206, 86, 1)',
                'rgba(75, 192, 192, 1)',
                'rgba(153, 102, 255, 1)',
                'rgba(255, 159, 64, 1)'
            ],
            borderColor: [
                'rgba(255, 99, 132, 1)',
                'rgba(54, 162, 235, 1)',
                'rgba(255, 206, 86, 1)',
                'rgba(75, 192, 192, 1)',
                'rgba(153, 102, 255, 1)',
                'rgba(255, 159, 64, 1)'
            ],
            borderWidth: 1
        }]
    },
    options: {
        aspect_ratio: 1,
        plugins: {
            title: {
                display: true,
                align: 'start',
                text: 'Revenue Over time',
                font: {
                    family: "'Roboto', sans-serif",
                    size: 24,
                },
                color: [
                    'rgba(0, 0, 0, 1)'
                ],
                padding: {
                    top: 20
                }
            }
        },
        scales: {
            yAxis: {
                min: 0,
                suggestedMax: 10
            }
        },
        animation: false
    }
});
