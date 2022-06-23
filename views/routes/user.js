const express = require('express');
const router = express.Router();
const flashMessage = require('../helpers/messenger');
const sequelizeUser = require("../../config/DBConfig")
const bcrypt = require('bcryptjs');
const passport = require('passport');
const User = require("../../models/User")
const ensureAuthenticated = require("../helpers/auth");


router.use((req, res, next) => {
  res.locals.path = req.baseUrl;
  console.log(req.baseUrl);
  //Checks url for normal users and admin
  next();
});


router.get('/login', (req, res) => {
  res.render('user/login');
});

router.get('/register', (req, res) => {
  res.render('user/register');
});


router.post('/register', async function (req, res) {

  let { name, email, password, password2 } = req.body;

  let isValid = true;
  if (password.length < 6) {
    flashMessage(res, 'error', 'Password must be at least 6 char-acters');
    isValid = false;
  }
  if (password != password2) {
    flashMessage(res, 'error', 'Passwords do not match');
    isValid = false;
  }

  try {
    if (
      (await User.findOne({
        where: { name: req.body.name },
      })) ||
      (await User.findOne({ where: { email: req.body.name } }))
    ) {
      flashMessage(res, 'error', 'Name or email is not unique');
      console.log("Name or email is not unique");

      return res.redirect("/register");
    }
    await User.create({
      name: req.body.name,
      email: req.body.email,
      password: req.body.password,
      gender: req.body.gender,
      phoneNumber: req.body.phoneNumber

    });
    flashMessage(res, 'success', email + ' registered successfully');
    res.redirect("/login");
  } catch (e) {
    console.log(e);
    res.redirect("/register");
  }
});

router.post('/login', (req, res, next) => {
  passport.authenticate('local', {
    // Success redirect URL
    successRedirect: '/profile',
    // Failure redirect URL 
    failureRedirect: '/login',
    /* Setting the failureFlash option to true instructs Passport to flash 
    an error message using the message given by the strategy's verify callback.
    When a failure occur passport passes the message object as error */
    failureFlash: true


  })(req, res, next);

})

router.post('/editProfile', ensureAuthenticated, async (req, res) => {
  x = 0;
  y = 0
  userr = await User.findOne({ where: { id: req.user.id } })
  if ((await User.findOne({ where: { email: req.body.email } })) && userr.email != req.body.email) {
    x = 1
  }
  if ((await User.findOne({ where: { name: req.body.name } })) && userr.name != req.body.name) {
    y = 1
  }
  if (x == 1 && y != 1){
    flashMessage(res, 'error', 'This email has already been registered');
    return res.redirect("/editProfile");
  }
  else if (x != 1 && y == 1){
    flashMessage(res, 'error', 'This name has already been registered');
    return res.redirect("/editProfile");
  }
  else if (x == 1 && y == 1) {
    flashMessage(res, 'error', 'Both name and email has already been registered');
    return res.redirect("/editProfile");
  }

  let name = req.body.name;
  let email = req.body.email;
  let phoneNumber = req.body.phoneNumber;
  let gender = req.body.gender;
  User.update({ name, email, phoneNumber, gender }, { where: { id: req.user.id } })
  res.redirect("/profile");

})

function checkAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {

    return next()
  }

  res.redirect("/profile")
}

router.get('/logout', ensureAuthenticated, (req, res) => {
  const message = 'You Have Logged out';
  flashMessage(res, 'success', message);
  req.logout();
  res.redirect('/');
});

module.exports = router;


