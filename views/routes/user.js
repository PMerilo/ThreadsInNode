const express = require('express');
const router = express.Router();
const flashMessage = require('../helpers/messenger');
const sequelizeUser = require("../../config/DBConfig")
const bcrypt = require('bcryptjs');
const passport = require('passport');
const User = require("../../models/User")
const ensureAuthenticated = require("../helpers/auth")
const nodemailer = require("nodemailer");
const Mail = require("../../config/MailConfig");


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

router.get('/forgetpassword', (req, res) => {
  res.render('forgetPassword');
});
router.post('/forgetpassword', async (req, res) => {
  let { email } = req.body;
  emailvariable = email;
  console.log(emailvariable)


  // if (await TempUser.findOne({ where: { email: email } })){
  //   return res.redirect('/forgetpassword_otp')
  // }
  if (await User.findOne({ where: { email: email } })) {
    otp = Math.floor(100000 + Math.random() * 900000)
    console.log(otp, 'HLEOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOO HERE')
    


    Mail.send(res, {
      to: email,
      subject: "Your OTP is ready "+ otp,
      text: "Thank you for subscribing to our news letter",
      template: "../views/MailTemplates/NewsLetter",
      html: `<div class="page">
      <div class="container">
        <div class="email_header">
          
          <img class="logo" src="https://raw.githubusercontent.com/PMerilo/ThreadsInNode/master/public/images/logo.png" alt="Threads In Times" />
          <h1>Email Confirmation</h1>
        </div>
        <div class="email_body">
          <p><b>Hi ,</b></p>
          <p>Your OTP is example</b></p>
          
          </a>
          <p>Thanks for supporting,<br/>
            <b>The Threads in Times Team</b>
          </p>
        </div>
        <div class="email_footer">:copyright: Threads in Times 2020</div>
      </div>
    </div>`
    })
  
    // await TempUser.create({
    //   email: req.body.email,
    // })
    flashMessage(res, 'success', 'An OTP has been sent out. Please check your email!');
    return res.redirect('/forgetpassword_otp')
  }
  flashMessage(res, 'error', 'Email does not exist!');
  return res.redirect('/forgetpassword')
})

router.get('/forgetpassword_otp', (req, res) => {
  if (otp == "placeholder"){
    flashMessage(res, 'error', 'You do not have permission for that page');
    return res.redirect("/")
  }
  // otp = "placeholder"
  res.render('otpPage');

});

router.post('/forgetpassword_otp', async (req, res) => {
  console.log(otp)
  if (otp == req.body.otp) {
    console.log('hello111111')
    otp = "placeholder"
    otp2 = 'allowpwchange'
    flashMessage(res, 'success', 'Valid OTP entered. Please change your password!');
    return res.redirect('/forgetpasswordchange')
  }
  flashMessage(res, 'error', 'Incorrect OTP!');
  return res.redirect('/forgetpassword_otp')
})

router.get("/forgetpasswordchange", (req, res) => {
  console.log(otp2)
  if (otp2 == 'disallowpwchange') {
    flashMessage(res, 'error', 'You do not have permission for that page');
    res.redirect('/')
  }
  res.render('forgetpasswordchange')
})

router.post('/forgetpasswordchange', async (req, res) => {
  let { newpassword, newpassword2 } = req.body
  if (newpassword.length < 6) {
    flashMessage(res, 'error', 'Password must be at least 6 characters');
    return res.redirect('/forgetpasswordchange')
  }
  if (newpassword2 != newpassword) {
    flashMessage(res, 'error', 'New passwords do not match');
    return res.redirect('/forgetpasswordchange')
  }
  // user1 = await TempUser.findOne({ where: { email: emailvariable } })

  User.update({ password: newpassword }, { where: { email: emailvariable } })
  // TempUser.destroy({ where: { email: user1.email } })
  otp = "placeholder"
  otp2 = "disallowpwchange"
  emailvariable = 'placeholder'
  flashMessage(res, 'success', 'Password updated successfully');
  return res.redirect('/login')
})

router.post('/register', async function (req, res) {

  let { name, email, password, password2 } = req.body;

  let isValid = true;
  if (password.length < 6) {
    flashMessage(res, 'error', 'Password must be at least 6 characters');
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
router.post('/profile', ensureAuthenticated, (req, res) => {
  User.destroy({ where: { id: req.user.id } })
  req.logout();
  flashMessage(res, 'success', 'Account successfully deleted. Bye bye...');
  return res.redirect("/");

})
router.post('/changePassword', ensureAuthenticated, async (req, res) => {
  userr1 = await User.findOne({ where: { id: req.user.id } })
  const validPassword = await bcrypt.compare(req.body.oldpassword, userr1.password);
  if (!validPassword) {
    flashMessage(res, 'error', 'Incorrect password');
    return res.redirect('/changePassword')
  }
  let { oldpassword, newpassword, newpassword2 } = req.body;
  if (newpassword.length < 6) {
    flashMessage(res, 'error', 'Password must be at least 6 characters');
    return res.redirect('/changePassword')
  }
  if (newpassword2 != newpassword) {
    flashMessage(res, 'error', 'New passwords do not match');
    return res.redirect('/changePassword')
  }
  if (oldpassword == newpassword) {
    flashMessage(res, 'error', 'New and old passwords are the same');
    return res.redirect('/changePassword')
  }
  User.update({ password: newpassword }, { where: { id: req.user.id } })
  flashMessage(res, 'success', 'Password updated successfully');
  return res.redirect('/profile')
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
  if (x == 1 && y != 1) {
    flashMessage(res, 'error', 'This email has already been registered');
    return res.redirect("/editProfile");
  }
  else if (x != 1 && y == 1) {
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
  flashMessage(res, 'success', 'Account successfully edited');
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


