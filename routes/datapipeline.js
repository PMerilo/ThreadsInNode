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
const ensureAuthenticated = require("../views/helpers/auth");
const ensureAdminAuthenticated = require("../views/helpers/adminAuth");
const { sequelize, sum } = require('../models/User');
// For DateTime
const moment = require('moment')
// For Editing Data
const dfd = require("danfojs-node");

const Product = require('../models/Product');

const ChartJsImage = require('chartjs-to-image');      
router.use((req, res, next) => {
  res.locals.path = req.baseUrl;
  console.log(req.baseUrl);
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
  console.log(df2)
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
  console.log(df2)
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

  df = new dfd.DataFrame(data,{columns:["Dates","NoOfUsersJoined"]})
  group_df = df.groupby(["Dates"]).sum()
  console.log(group_df)
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

  const totalCustomers = await User.count({where: {role:"C"}});
  const totalAdmins = await User.count({where: {role:"A"}});
  const totalSellers = await User.count({where: {role:"S"}});

  json_data = [{ Customers:totalCustomers , Admins: totalAdmins, Sellers:totalSellers }]

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

  const Males = await User.count({where: {gender:"Male"}});
  const Females = await User.count({where: {gender:"Female"}});

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

router.get('/InventoryReport', ensureAuthenticated, async (req, res) => {
  const Inventory = await Product.findAll({where:{ownerID:req.user.id}})


  let data = [];
  let cols = ["Stocks","ProductName"];


  Inventory.forEach(element => {
    let rawData = [element.quantity, element.name];
    data.push(rawData)
    
    
  });

  df = new dfd.DataFrame(data,{columns:["Stocks","ProductName"]})
  // group_df = df.groupby(["Dates"]).sum()
  // console.log(group_df)
  // const df2 = dfd.toJSON(df,{format:"json"})
  res.status(200).json({ 'data':df })
});

module.exports = router;


