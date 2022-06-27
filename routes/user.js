const express = require('express');
const router = express.Router();
const flashMessage = require('../views/helpers/messenger');
const sequelizeUser = require("../config/DBConfig")
const bcrypt = require('bcryptjs');
const passport = require('passport');
const User = require("../models/User")
const UsersJoinedLog = require("../models/Logs/JoinedUsersLogs")
const ensureAuthenticated = require("../views/helpers/auth");
const moment = require('moment')

router.use((req, res, next) => {
  res.locals.path = req.baseUrl;
  console.log(req.baseUrl);
  //Checks url for normal users and admin
  next();
});



router.get("/login-google",passport.authenticate("google",{scope:["profile","email"] }))


    
router.get("/login-google/callback",
  passport.authenticate("google", {
     // Success redirect URL
     successRedirect: '/login/checkrole',
     // Failure redirect URL 
     failureRedirect: '/login',
     /* Setting the failureFlash option to true instructs Passport to flash 
     an error message using the message given by the strategy's verify callback.
     When a failure occur passport passes the message object as error */
     failureFlash: true
  }),
  (req,res) =>{
    res.redirect("/login/checkrole")
  }
)


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

        await UsersJoinedLog.create({
          date: moment().format('L'),
          description: req.body.name + " joined as a Customer",
          role: "C",
          noOfUsersJoined: 1
        })

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
      flashMessage(res, 'success', "Success You are logged in as: "+ req.user.name);
      res.redirect('/profile');
    } else if(role == "A"){
      flashMessage(res, 'success', "Success You are logged in as Administrator: "+ req.user.name);
      res.redirect("/admin")
    }else if(role=="S"){
      flashMessage(res, 'success', "Success You are logged in as Seller: "+ req.user.name);
      res.redirect("/seller")
    }

    else{
      res.redirect("/login")
    }
})

router.get('/sellerRegister', (req, res) => {
    res.render('seller/sellerRegister');
});


router.post('/sellerRegister', async function (req, res) {

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
  
          return res.redirect("/sellerRegister");
        }
        await User.create({
          name: req.body.name,
          email: req.body.email,
          password: req.body.password,
          gender: req.body.gender,
          phoneNumber: req.body.phoneNumber,
          role: "S"

        });
        await UsersJoinedLog.create({
          date: moment().format('L'),
          description: req.body.name + " joined as a Seller",
          role: "S",
          noOfUsersJoined: 1
        })
        flashMessage(res, 'success', email + ' registered Seller Account successfully');
        res.redirect("/login");
      } catch (e) {
        console.log(e);
        res.redirect("/sellerRegister");
      }
    });


router.get('/requests', (req, res) => {
  res.render('services/requests')
})

module.exports = router;


