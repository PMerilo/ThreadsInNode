const express = require('express');
const router = express.Router();
const flashMessage = require('../views/helpers/messenger');
const sequelizeUser = require("../config/DBConfig")
const bcrypt = require('bcryptjs');
const passport = require('passport');
// Our Modals
const User = require("../models/User")

const UsersJoinedLog = require("../models/Logs/JoinedUsersLogs")
const ensureAuthenticated = require("../views/helpers/auth");
const ensureAdminAuthenticated = require("../views/helpers/adminAuth");
const { sequelize, sum } = require('../models/User');
// For DateTime
const moment = require('moment')
// For Editing Data
const dfd = require("danfojs-node");
const Product = require('../models/Product');
const Request = require('../models/Request');
const Tailor = require('../models/Tailor');


router.use((req, res, next) => {
  res.locals.path = req.baseUrl;
  console.log(req.baseUrl);
  //Checks url for normal users and admin
  next();
});

router.get('/NoOfUsersJoined', async (req, res) => {
  const usersJoined = await UsersJoinedLog.findAll({ where: { role: "C" } });


  let data = [];
  let cols = ["Dates", "NoOfUsersJoined"];


  usersJoined.forEach(element => {
    let rawData = [element.date, element.noOfUsersJoined];
    data.push(rawData)


  });

  df = new dfd.DataFrame(data, { columns: ["Dates", "NoOfUsersJoined"] })
  group_df = df.groupby(["Dates"]).sum()
  console.log(group_df)
  const df2 = dfd.toJSON(group_df, { format: "json" })
  res.status(200).json({ 'data': df2 })
});

router.get('/UserRoles', async (req, res) => {

  const totalCustomers = await User.count({ where: { role: "C" } });
  const totalAdmins = await User.count({ where: { role: "A" } });
  const totalSellers = await User.count({ where: { role: "S" } });

  json_data = [{ Customers: totalCustomers, Admins: totalAdmins, Sellers: totalSellers }]

  df = new dfd.DataFrame(json_data)

  res.status(200).json({ df })
});

router.get('/UserGenders', async (req, res) => {

  const Males = await User.count({ where: { gender: "Male" } });
  const Females = await User.count({ where: { gender: "Female" } });


  json_data = [{ Male: Males, Female: Females }]

  df = new dfd.DataFrame(json_data)

  res.status(200).json({ df })
});

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
      { model: User, as: 'tailor' }
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
  const df2 = dfd.toJSON(group_df,{format:"json"})
  res.status(200).json({ 'data': df2 })
});

module.exports = router;


