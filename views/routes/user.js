const express = require('express');
const router = express.Router();
const flashMessage = require('../helpers/messenger');
const sequelizeUser = require("../../config/DBConfig")
const bcrypt = require('bcryptjs');
const passport = require('passport');
const User = require("../../models/User")
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
      const message = 'You been logged in!';
      flashMessage(res, 'success', message);
  })

function checkAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return next()
    }
    res.redirect("/profile")
    }

router.get('/logout', (req, res) => {
    const message = 'You Have Logged out';
    flashMessage(res, 'success', message);
    req.logout();
    res.redirect('/');
});

module.exports = router;


