const express = require('express');
const router = express.Router();
const flashMessage = require('../views/helpers/messenger');
const sequelizeUser = require("../config/DBConfig")
const bcrypt = require('bcryptjs');
const passport = require('passport');
const User = require("../models/User")
const ensureAuthenticated = require("../views/helpers/auth");
const ensureAdminAuthenticated = require("../views/helpers/adminAuth");
const { sequelize } = require('../models/User');
const moment = require('moment')
const dfd = require("danfojs-node")
const tf = dfd.tensorflow


router.use((req, res, next) => {
  res.locals.path = req.baseUrl;
  console.log(req.baseUrl);
  //Checks url for normal users and admin
  next();
});

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

module.exports = router;


