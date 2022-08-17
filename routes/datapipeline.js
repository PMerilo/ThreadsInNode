const express = require('express');
const router = express.Router();
const flashMessage = require('../views/helpers/messenger');
const sequelizeUser = require("../config/DBConfig")
const bcrypt = require('bcryptjs');
const passport = require('passport');
// Our Modals
const User = require("../models/User")

const UsersJoinedLog = require("../models/Logs/JoinedUsersLogs")
const NewsLetterLog = require("../models/Logs/NewsLetterLogs")
const CustomerSatisfactionLog = require("../models/Logs/CustomerSatisfactionLog")
const ensureAuthenticated = require("../views/helpers/auth");
const ensureAdminAuthenticated = require("../views/helpers/adminAuth");
const { sequelize, sum } = require('../models/User');
// For DateTime
const moment = require('moment')
// For Editing Data
const dfd = require("danfojs-node");
const Product = require('../models/Product');
const Survey = require('../models/Survey');
const Order = require('../models/Orders');
const OrderItems = require('../models/OrderItems');
const Request = require('../models/Request');

const ChartJsImage = require('chartjs-to-image');      
router.use((req, res, next) => {
  res.locals.path = req.baseUrl;
  // console.log(req.baseUrl);
  //Checks url for normal users and admin
  next();
});

router.get('/NoOfUsersJoined', async (req, res) => {
  const usersJoined = await UsersJoinedLog.findAll({where: {role:"C"}});


  let data = [];
  let dataMonth = []
  let dataYear = []
  let cols = ["Dates","NoOfUsersJoined"];

  usersJoined.forEach(element => {
    let rawData = [element.date, element.noOfUsersJoined];
    let rawDataMonth = [element.date, element.noOfUsersJoined];
    rawDataMonth[0] = moment(rawData[0]).format("MMMM")

    let rawDataYear = [element.date, element.noOfUsersJoined];
    rawDataYear[0] = moment(rawData[0]).format("YYYY")
    
    data.push(rawData)
    dataMonth.push(rawDataMonth)
    dataYear.push(rawDataYear)

    
    
  });

  // Set Day Data
  dfDay = new dfd.DataFrame(data,{columns:cols})
  group_dfDay = dfDay.groupby(["Dates"]).sum()
  const df2 = dfd.toJSON(group_dfDay,{format:"json"})

  // Set Month Data
  dfMonth = new dfd.DataFrame(dataMonth,{columns:cols})
  group_dfMonth = dfMonth.groupby(["Dates"]).sum()
  const df3 = dfd.toJSON(group_dfMonth,{format:"json"})

  // Set Year Data
  dfYear = new dfd.DataFrame(dataYear,{columns:cols})
  group_dfYear = dfYear.groupby(["Dates"]).sum()
  const df4 = dfd.toJSON(group_dfYear,{format:"json"})
  
  var NoOfUsers_day = [];
  var dates_day = [];
  // console.log(df2)
  df2.forEach((element) => {
    NoOfUsers_day.push(element["NoOfUsersJoined_sum"]);
    dates_day.push(element["Dates"].toString().slice(0,10));
  });
  console.log(dates_day)
  console.log(NoOfUsers_day)
  const myChart = new ChartJsImage();
  myChart.setConfig({
    type: 'line',
    data: { labels: dates_day, datasets: [{ label: 'Numbers of Users Joined', data: NoOfUsers_day }] },
  });

  myChart.toFile('./public/images/ChartImages/UsersJoinedChart.png');


  
  
  

  res.status(200).json({ 'dataDay':df2, 'dataMonth':df3, 'dataYear':df4});
});

router.get('/NoOfNewsLetterSubscriptions', async (req, res) => {
  const NewsLetterLogs = (await NewsLetterLog.findAll()).map((x) => x.dataValues)


  let data = [];
  let dataMonth = []
  let dataYear = []
  let cols = ["Dates","NoOfNewsLetterSubscriptions"];


  NewsLetterLogs.forEach(element => {
    let rawData = [element.date, element.noOfUsersJoined];
    let rawDataMonth = [element.date, element.noOfUsersJoined];
    rawDataMonth[0] = moment(rawData[0]).format("MMMM")

    let rawDataYear = [element.date, element.noOfUsersJoined];
    rawDataYear[0] = moment(rawData[0]).format("YYYY")
    
    data.push(rawData)
    dataMonth.push(rawDataMonth)
    dataYear.push(rawDataYear)

    
    
  });

  // Set Day Data
  dfDay = new dfd.DataFrame(data,{columns:cols})
  group_dfDay = dfDay.groupby(["Dates"]).sum()
  const df2 = dfd.toJSON(group_dfDay,{format:"json"})

  // Set Month Data
  dfMonth = new dfd.DataFrame(dataMonth,{columns:cols})
  group_dfMonth = dfMonth.groupby(["Dates"]).sum()
  const df3 = dfd.toJSON(group_dfMonth,{format:"json"})

  // Set Year Data
  dfYear = new dfd.DataFrame(dataYear,{columns:cols})
  group_dfYear = dfYear.groupby(["Dates"]).sum()
  const df4 = dfd.toJSON(group_dfYear,{format:"json"})
  

  var NoOfUsers_day = [];
  var dates_day = [];
 
  df2.forEach((element) => {
    NoOfUsers_day.push(element["NoOfNewsLetterSubscriptions_sum"]);
    dates_day.push(element["Dates"].toString().slice(0,10));
  });
  
  const myChart = new ChartJsImage();
  myChart.setConfig({
    type: 'line',
    data: { labels: dates_day, datasets: [{ label: 'Numbers of NewsLetter Subscriptions', data: NoOfUsers_day }] },
  });

  myChart.toFile('./public/images/ChartImages/UsersSubscriptionChart.png');
  


  res.status(200).json({ 'dataDay':df2, 'dataMonth':df3, 'dataYear':df4 });
});

router.get('/NoOfUsersJoinedMonth', async (req, res) => {
  const usersJoined = await UsersJoinedLog.findAll({where: {role:"C"}});


  let data = [];
  let cols = ["Dates","NoOfUsersJoined"];
  
  usersJoined.forEach(element => {
    let rawData = [element.date, element.noOfUsersJoined];
    rawData[0] = moment(rawData[0]).format("MMMM")
    data.push(rawData)


  });

  df = new dfd.DataFrame(data, { columns: ["Dates", "NoOfUsersJoined"] })
  group_df = df.groupby(["Dates"]).sum()
  
  const df2 = dfd.toJSON(group_df,{format:"json"})
  res.status(200).json({ 'data':df2 })
  // data = data.map(x => {
  //   return({Dates: x[0], NoOfUsersJoined_sum:x[1]});
  // });
  
  // let unique_dates = []
  // let newData = []
  // data.forEach(element => {
  //   if(!unique_dates.includes(element.Dates)){
  //     unique_dates.push(element.Dates)
  //     newData.push(element)
  //   }else{
  //     newData[unique_dates.indexOf(element.Dates)].NoOfUsersJoined_sum += element.NoOfUsersJoined_sum
      
  //   }
  // });
  // res.status(200).json({ 'data':newData })
});

router.get('/NoOfUsersJoinedYear', async (req, res) => {
  const usersJoined = await UsersJoinedLog.findAll({where: {role:"C"}});


  let data = [];
  let cols = ["Dates","NoOfUsersJoined"];
  // var months = {
  //   1: "January",
  //   2: "February",
  //   3: "March",
  //   4: "April",
  //   5: "May",
  //   6: "June",
  //   7: "July",
  //   8: "August",
  //   9: "September",
  //   10: "October",
  //   11: "November",
  //   12: "December"


  // };
  usersJoined.forEach(element => {
    let rawData = [element.date, element.noOfUsersJoined];
    rawData[0] = moment(rawData[0]).format("YYYY")
    data.push(rawData)
    
    
  });

  // df = new dfd.DataFrame(data,{columns:["Dates","NoOfUsersJoined"]})
  // group_df = df.groupby(["Dates"]).sum()
  // console.log(group_df)
  // const df2 = dfd.toJSON(group_df,{format:"json"})
  // res.status(200).json({ 'data':df2 })
  
  
  

    data = data.map(x => {
      return({Dates: x[0], NoOfUsersJoined_sum:x[1]});
    });
    
    let unique_dates = []
    let newData = []
    data.forEach(element => {
      if(!unique_dates.includes(element.Dates)){
        unique_dates.push(element.Dates)
        newData.push(element)
      }else{
        newData[unique_dates.indexOf(element.Dates)].NoOfUsersJoined_sum += element.NoOfUsersJoined_sum
        
      }
    });
    

    
   

    
  res.status(200).json({ 'data':newData })
});

router.get('/UserRoles', async (req, res) => {

  const totalCustomers = await User.count({ where: { role: "C" } });
  const totalAdmins = await User.count({ where: { role: "A" } });
  const totalSellers = await User.count({ where: { role: "S" } });

  json_data = [{ Customers: totalCustomers, Admins: totalAdmins, Sellers: totalSellers }]

  df = new dfd.DataFrame(json_data)

  const myPieChart = new ChartJsImage();
  myPieChart.setConfig({
    type: 'doughnut',
    data: { labels: ["Customer","Admins","Sellers"], datasets: [{ label: 'User Roles Types', data: [totalCustomers,totalAdmins,totalSellers]}] },
  });
  
  myPieChart.toFile('./public/images/ChartImages/UsersRolesPieChart.png');
  
  res.status(200).json({ df })
});

router.get('/UserGenders', async (req, res) => {

  const Males = await User.count({ where: { gender: "Male" } });
  const Females = await User.count({ where: { gender: "Female" } });

  const myPieChart = new ChartJsImage();
  myPieChart.setConfig({
    type: 'doughnut',
    
    data: { 
      labels: ["Males","Females"], datasets: [{ label: 'User Gender Types', data: [Males,Females],backgroundColor: ["rgb(128, 128, 255)", "rgb(255, 26, 26)" ],color:["yellow","black"]}] 
    },
    
    
  });
  
  myPieChart.toFile('./public/images/ChartImages/UsersGendersPieChart.png');
  json_data = [{ Male:Males , Female: Females }]

  df = new dfd.DataFrame(json_data)

  res.status(200).json({ df })
});

router.get('/CustomerSatisfaction', ensureAuthenticated, async (req, res) => {
  const customerSatisfactionLogs = await CustomerSatisfactionLog.findAll(); 
  let rating1 = 0;
  let rating2 = 0;
  let rating3 = 0;
  let rating4 = 0;
  let rating5 = 0;

  let data = [];
  let cols = ["1 Star Rating","2 Star Rating","3 Star Rating","4 Star Rating","5 Star Rating"];


  customerSatisfactionLogs.forEach(element => {
    if(element.rating == 1){
      rating1++
    }else if(element.rating == 2){
      rating2++
    }else if(element.rating == 3){
      rating3++
    }else if(element.rating == 4){
      rating4++
    }else if(element.rating == 5){
      rating5++
    }
    
    
    
    
  });
  let rawData = [rating1,rating2,rating3,rating4,rating5];
    data.push(rawData)

  df = new dfd.DataFrame(data,{columns:cols})
  myBarChart = new ChartJsImage();
  myBarChart.setConfig({
    type: 'bar',
    data: {
      labels: ["1 Star Rating","2 Star Rating","3 Star Rating","4 Star Rating","5 Star Rating"],
      datasets: [{
        label: "Number Of Users",
        lineTension: 0.3,
        backgroundColor: ["red", "orange", "yellow", "green", "blue"],
        borderColor: "rgba(78, 115, 223, 1)",
        data: [rating1,rating2,rating3,rating4,rating5],
      }],
    }
  });

  myBarChart.toFile('./public/images/ChartImages/CustomerSatisfactionBarChart.png');
  res.status(200).json({ 'data':df })
  
});


// Survey Questions

router.get('/SurveyQuestionsAge', async (req, res) => {
  const surveyQuestions = await Survey.findAll(); 
  let data = [];
  let cols = ["Above 60","40 to 60","20 to 40","Below 20"];
  let ageabove60 = 0;
  let age40to60 = 0;
  let age20to40 = 0;
  let agebelow20 = 0;

  surveyQuestions.forEach(element => {
    if(element.age == "Above 60"){
      ageabove60++
    }
    else if(element.age == "40 to 60"){
      age40to60++
    }
    else if(element.age == "20 to 40"){
      age20to40++
    }
    else if(element.age == "Below 20"){
      agebelow20++
    }
  });
  let rawData = [ageabove60,age40to60,age20to40,agebelow20];
  data.push(rawData)
  df = new dfd.DataFrame(data,{columns:cols})
  res.status(200).json({ 'data':df })
})

router.get('/SurveyQuestionsOccupation', async (req, res) => {
  const surveyQuestions = await Survey.findAll(); 
  let data = [];
  let cols = ["student","fulltime","freelancer","other"];
  let student = 0;
  let fulltime = 0;
  let freelancer = 0;
  let other = 0;

  surveyQuestions.forEach(element => {
    if(element.occupation == "student"){
      student++
    }
    else if(element.occupation == "full-time-job"){
      fulltime++
    }
    else if(element.occupation == "freelancer"){
      freelancer++
    }
    else if(element.occupation == "other"){
      other++
    }
  });
  let rawData = [student,fulltime,freelancer,other];
  data.push(rawData)

  
  df = new dfd.DataFrame(data,{columns:["student","fulltime","freelancer","other"]})
  res.status(200).json({ 'data':df })
})



router.get('/InventoryReport', ensureAuthenticated, async (req, res) => {
  const Inventory = await Product.findAll({ where: { ownerID: req.user.id } })


  let data = [];
  let cols = ["Stocks", "ProductName"];


  Inventory.forEach(element => {
    let rawData = [element.quantity, element.name];
    data.push(rawData)


  });

  df = new dfd.DataFrame(data, { columns: ["Stocks", "ProductName"] })
  // group_df = df.groupby(["Dates"]).sum()
  // console.log(group_df)
  // const df2 = dfd.toJSON(df,{format:"json"})
  res.status(200).json({ 'data': df })
});

router.get('/requestsbytailor', ensureAuthenticated, async (req, res) => {
  const requests = await Request.findAll({
    include: [
      { model: User, as: 'tailor', required: true }
    ]
  })

  let data = [];
  let cols = ["Tailor", "Count"];


  requests.forEach(element => {
    // console.log(element.toJSON())
    let rawData = [element.tailor.name, element.id];
    data.push(rawData)


  });

  df = new dfd.DataFrame(data, { columns: ["Tailor", "Request"] })
  group_df = df.groupby(["Tailor"]).count()
  // console.log(group_df)
  const df2 = dfd.toJSON(group_df, { format: "json" })
  res.status(200).json({ 'data': df2 })
});

router.get('/salesPerDay/:id', async (req, res) => {
  const sales = await OrderItems.findAll({ where: { seller_id: req.params.id } , order : [
    ['createdAt', 'ASC'],
    ['productSku', 'ASC']
  ]});

  let data = [];
  let cols = ["Dates", "Sales"];

  sales.forEach(element => {
    let rawData = [moment(element.createdAt).format("DD/MM/YYYY"), element.seller_cut];
    data.push(rawData)
  });

  df = new dfd.DataFrame(data, { columns: ["Dates", "Sales"] })
  group_df = df.groupby(["Dates"]).sum()
  const df2 = dfd.toJSON(group_df, { format: "json" })
  res.status(200).json({ 'data': df2 })
});

router.get('/totalSalesPerDay', async (req, res) => {
  const sales = await Order.findAll({order : [
    ['createdAt', 'ASC'],
    ['orderTotal', 'ASC']]});

  let data = [];
  let cols = ["Dates", "Sales"];

  sales.forEach(element => {
    let rawData = [moment(element.createdAt).format("DD/MM/YYYY"), element.orderTotal];
    data.push(rawData)
  });

  df = new dfd.DataFrame(data, { columns: ["Dates", "Sales"] })
  group_df = df.groupby(["Dates"]).sum()
  const df2 = dfd.toJSON(group_df, { format: "json" })
  res.status(200).json({ 'data': df2 })
});

router.get('/myProduct/:id', async (req, res) => {
  const product = await Product.findAll({limit: 10, order: [['sold', 'DESC'], ['sales', 'DESC']], where: { OwnerID: req.params.id } });

  let data = [];
  let cols = ["Name", "Sales", "Sold"];
  
  product.forEach(element => {
    let rawData = [element.name, element.sales, element.sold];
    data.push(rawData)
  });

  df = new dfd.DataFrame(data, { columns: ["Name", "Sales", "Sold"] })
  const df2 = dfd.toJSON(df, { format: "json" })
  res.status(200).json({ 'data': df })
});

router.get('/myProductWishlist/:id', async (req, res) => {
  const product = await Product.findAll({limit: 10, order: [['wishlistcount', 'DESC'], ['sold', 'DESC']], where: { OwnerID: req.params.id } });

  let data = [];
  let cols = ["Name", "Wishlistcount"];
  
  product.forEach(element => {
    let rawData = [element.name, element.wishlistcount];
    data.push(rawData)
  });

  df = new dfd.DataFrame(data, { columns: ["Name", "Wishlistcount"] })
  const df2 = dfd.toJSON(df, { format: "json" })
  res.status(200).json({ 'data': df })
});

router.post('/stats', async (req, res) => {
  const sellers = await OrderItems.findAll()
  const sales = (await Order.sum('orderTotal')).toFixed(2)
  const customers = await Order.count('orderOwnerID')
  const orders = await Order.count('id')
  
  var sellerRevenue = 0
  sellers.forEach(element => {
    let data = ((element.product_price * element.qtyPurchased) + element.shipping_rate)
    sellerRevenue += data
  });
  const revenue = (sales - ((sellerRevenue / 100) * 83)).toFixed(2)
  res.send({revenue : revenue, sales : sellerRevenue.toFixed(2), orders: orders, customers : customers})
});

router.post('/storestats', async (req, res) => {
  const sellers = await OrderItems.findAll({ where: { seller_id: req.body.id }});
  const customers = await OrderItems.count({where : {seller_id : req.body.id}})
  const orders = await OrderItems.count({where : {seller_id : req.body.id}, distinct: true})
  var user = await User.findByPk(req.user.id)
  var balance = (user.total_balance).toFixed(2)
  var bankacc = user.bankAccount
  
  var sellerRevenue = 0
  sellers.forEach(element => {
    let data = element.seller_cut
    sellerRevenue += data
  });
  sellerRevenue = sellerRevenue.toFixed(2)
  res.send({revenue : sellerRevenue, orders: orders, customers : customers, balance:balance,bank:bankacc})
});
module.exports = router;


