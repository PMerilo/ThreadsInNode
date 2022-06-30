// Set new default font family and font color to mimic Bootstrap's default styling
Chart.defaults.global.defaultFontFamily = 'Nunito', '-apple-system,system-ui,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Arial,sans-serif';
Chart.defaults.global.defaultFontColor = '#858796';

// Pie Chart Example
var getUserRolesData = $.get('/datapipeline/UserRoles')
var ctx = document.getElementById("UserRolesPieChart");
getUserRolesData.done(function(data){
var Customers = data.df[0].Customers
var Admins = data.df[0].Admins
var Sellers = data.df[0].Sellers
var myPieChart = new Chart(ctx, {
  type: 'doughnut',
  data: {
    labels: ["Customers", "Admins", "Sellers"],
    datasets: [{
      data: [Customers,Admins,Sellers],
      backgroundColor: ['#4e73df', '#1cc88a', '#36b9cc'],
      hoverBackgroundColor: ['#2e59d9', '#17a673', '#2c9faf'],
      hoverBorderColor: "rgba(234, 236, 244, 1)",
    }],
  },
  options: {
    maintainAspectRatio: false,
    tooltips: {
      backgroundColor: "rgb(255,255,255)",
      bodyFontColor: "#858796",
      borderColor: '#dddfeb',
      borderWidth: 1,
      xPadding: 15,
      yPadding: 15,
      displayColors: false,
      caretPadding: 10,
    },
    legend: {
      display: false
    },
    cutoutPercentage: 80,
  },
});
})