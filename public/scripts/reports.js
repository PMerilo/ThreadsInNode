// Simple-DataTables
// https://github.com/fiduswriter/Simple-DataTables/wiki
window.addEventListener('DOMContentLoaded', event => {

    const inventoryTable = document.getElementById('inventory-table');
    if (inventoryTable) {
        new simpleDatatables.DataTable(inventoryTable);
    }

    const salesTable = document.getElementById('sales-table');
    if (salesTable) {
        new simpleDatatables.DataTable(salesTable);
    }

    const trafficTable = document.getElementById('traffic-table');
    if (trafficTable) {
        new simpleDatatables.DataTable(trafficTable);
    }

    const sessionTable = document.getElementById('session-table');
    if (sessionTable) {
        new simpleDatatables.DataTable(sessionTable);
    }

});

$(document).ready(function(){
    $('.dbselect').hide()
    $('.chartselect').find('input').attr('checked', 'True')
})

$('#fileselect').change(function() {
    $('.chartselect').hide()
    $('.dbselect').hide()
    if ($('#fileselect').val() == 1) {
        $('.chartselect').show()
    } else if ($('#fileselect').val() == 3){
        $('.dbselect').show()
    }
})

const restockctx = document.getElementById('restockChart').getContext('2d');
const restockChart = new Chart(restockctx, {
    type: 'bar',
    data: {
        labels: data[0].x,
        datasets: [{
            label: '#',
            data: data[0].y,
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
                text: 'Restocks by product',
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

const outofstockctx = document.getElementById('outofstockChart').getContext('2d');
const outofstockChart = new Chart(outofstockctx, {
    type: 'bar',
    data: {
        labels: data[1].x,
        datasets: [{
            label: '#',
            data: data[1].y,
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
                text: 'Low stocks by product',
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
const productQtyctx = document.getElementById('productQtyChart').getContext('2d');
const productQtyChart = new Chart(productQtyctx, {
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
        },
        animation: false
        
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

const salesctx = document.getElementById('salesChart').getContext('2d');
const salesChart = new Chart(salesctx, {
    type: 'line',
    data: {
        labels: data[5].x,
        datasets: [{
            label: '#',
            data: data[5].y,
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
                text: 'Sales this month',
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


const visitorctx = document.getElementById('visitorChart').getContext('2d');
const visitorChart = new Chart(visitorctx, {
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


const piectx = document.getElementById('pieChart').getContext('2d');
const pieChart = new Chart(piectx, {
    type: 'pie',
    data: {
        labels: data[7].x,
        datasets: [{
            label: '# Orders',
            data: data[7].y,
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
                text: 'Cart Status',
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