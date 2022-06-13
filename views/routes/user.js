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
          successRedirect: '/login/checkrole',
          // Failure redirect URL 
          failureRedirect: '/login',
          /* Setting the failureFlash option to true instructs Passport to flash 
          an error message using the message given by the strategy's verify callback.
          When a failure occur passport passes the message object as error */
          failureFlash: true
          
          
      })(req, res, next);
      
  })

function checkAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        
        return next()
    }

    res.redirect("/profile")
    }

router.get('/logout',ensureAuthenticated, (req, res) => {
    const message = 'You Have Logged out';
    flashMessage(res, 'success', message);
    req.logout();
    res.redirect('/');
});

router.get('/login/checkrole',ensureAuthenticated, (req,res) => {
    var role = req.user.role
    if(role=="C"){
      res.redirect('/profile');
    } else if(role == "A"){
      res.redirect("/admin")
    }else{
      res.redirect("/login")
    }
})

module.exports = router;


