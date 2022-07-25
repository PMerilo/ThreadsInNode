const express = require('express');
const router = express.Router();
const flashMessage = require('../views/helpers/messenger');
const sequelizeUser = require("../config/DBConfig")
const bcrypt = require('bcryptjs');
const passport = require('passport');
const User = require("../models/User")
const Product = require("../models/Product")
const ensureAuthenticated = require("../views/helpers/auth");
const ensureAdminAuthenticated = require("../views/helpers/adminAuth");
const { sequelize } = require('../models/User');
const moment = require('moment')
const dfd = require("danfojs-node")
const tf = dfd.tensorflow

router.get('/NoOfUsersJoined', async (req, res) => {
  let dates = ["02/13/2021","02/13/2021","067/13/2021"];
  let noOfUsers = [7,2,87];
  
  let currentDate = moment().format('L'); // 02/13/2021
  let checknoOfUsers = await User.count();
  
  if(!dates.includes(currentDate)){
    dates.push(currentDate)
    noOfUsers.push(checknoOfUsers)
  }
   

  json_data = [{ Dates:dates , NoOfUsers: noOfUsers, }]

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


