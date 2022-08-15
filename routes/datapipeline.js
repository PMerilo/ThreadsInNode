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
const Order = require('../models/Orders');
const OrderItems = require('../models/OrderItems');

router.use((req, res, next) => {
  res.locals.path = req.baseUrl;
  console.log(req.baseUrl);
  //Checks url for normal users and admin
  next();
});

router.get('/NoOfUsersJoined', async (req, res) => {
  const usersJoined = await UsersJoinedLog.findAll({ where: { role: "C" } , order : [
    ['date', 'ASC']
  ]});


  let data = [];
  let cols = ["Dates", "NoOfUsersJoined"];


  usersJoined.forEach(element => {
    let rawData = [element.date, element.noOfUsersJoined];
    data.push(rawData)


  });

  df = new dfd.DataFrame(data, { columns: ["Dates", "NoOfUsersJoined"] })
  group_df = df.groupby(["Dates"]).sum()
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
    let rawData = [moment(element.createdAt).format("DD/MM/YYYY"), (element.product_price * element.qtyPurchased)];
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
  const product = await Product.findAll({ where: { OwnerID: req.params.id } });

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
  const product = await Product.findAll({ where: { OwnerID: req.params.id } });

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
  res.send({revenue : revenue, sales : sellerRevenue, orders: orders, customers : customers})
});

router.post('/storestats', async (req, res) => {
  const sellers = await OrderItems.findAll({ where: { seller_id: req.body.id }});
  const customers = await OrderItems.count({where : {seller_id : req.body.id}})
  const orders = await OrderItems.count({where : {seller_id : req.body.id}, distinct: true})
  var user = await User.findByPk(req.user.id)
  var balance = user.total_balance
  var bankacc = user.bankAccount
  
  var sellerRevenue = 0
  sellers.forEach(element => {
    let data = ((element.product_price * element.qtyPurchased) + element.shipping_rate)
    sellerRevenue += data
  });
  const revenue = ((sellerRevenue / 100) * 83).toFixed(2)
  res.send({revenue : revenue, orders: orders, customers : customers, balance:balance,bank:bankacc})
});
module.exports = router;


