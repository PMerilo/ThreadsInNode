const express = require('express');
const router = express.Router();
const flashMessage = require('../helpers/messenger');
const sequelizeUser = require("../../config/DBConfig")
const bcrypt = require('bcryptjs');
const passport = require('passport');
const User = require("../../models/User")
const ensureAuthenticated = require("../helpers/auth");
const ensureAdminAuthenticated = require("../helpers/adminAuth")

router.use((req, res, next) => {
  res.locals.path = req.baseUrl;
  console.log(req.baseUrl);
  //Checks url for normal users and admin
  next();
});


module.exports = router;


