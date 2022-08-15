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
const Request = require('../models/Request')
const { Op } = require('sequelize');
const Mail = require("../config/MailConfig");
const TempUser = require("../models/TempUser");
const mail = require("../config/NewMailConfig");
const PDFDocument = require('pdfkit');
const path = require('path');

const userController = require('../controllers/userController')

router.use((req, res, next) => {
  res.locals.path = req.baseUrl;
  console.log(req.baseUrl);
  //Checks url for normal users and admin
  next();
});



router.get("/login-google", passport.authenticate("google", { scope: ["profile", "email"] }))



router.get("/login-google/callback",
  passport.authenticate("google", {
    // Failure redirect URL 
    failureRedirect: '/login',
    /* Setting the failureFlash option to true instructs Passport to flash 
    an error message using the message given by the strategy's verify callback.
    When a failure occur passport passes the message object as error */
    failureFlash: true
  }), userController.loginRedirect
);


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

    return res.redirect("/register");

  }
  if (password != password2) {
    flashMessage(res, 'error', 'Passwords do not match');
    isValid = false;

    return res.redirect("/register");


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
    code1 = Math.random().toString(36).substring(2, 15)
    code2 = Math.random().toString(36).substring(2, 15)
    await TempUser.create({
      email: req.body.email,
      backupcode1: code1,
      backupcode2: code2,
      backupcode1check: 'not used',
      backupcode2check: 'not used'

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

router.post('/login',
  passport.authenticate('local', {
    // Failure redirect URL 
    failureRedirect: '/login',
    /* Setting the failureFlash option to true instructs Passport to flash 
    an error message using the message given by the strategy's verify callback.
    When a failure occur passport passes the message object as error */
    failureFlash: true
  }), userController.loginRedirect);

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

router.get('/sellerRegister', (req, res) => {
  res.render('seller/sellerRegister');
});


router.post('/sellerRegister', async function (req, res) {

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

      return res.redirect("/sellerRegister");
    }
    await User.create({
      name: req.body.name,
      email: req.body.email,
      password: req.body.password,
      gender: req.body.gender,
      phoneNumber: req.body.phoneNumber,
      bankAccount: req.body.bankAccount,
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


router.get('/user/requests', ensureAuthenticated, async (req, res) => {
  let requests = await Request.findAll({
    include: { all: true, nested: true },
    where: {
      [Op.or]: [
        { userId: req.user.id },
        { "$tailor.userId$": req.user.id }
      ]

    }
  })
  // console.log(requests)
  res.render('services/requests', { requests })
})

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
    userr1 = await User.findOne({ where: { email: email } })
    mail.Send({
      email_recipient: email,
      subject: `Your Threads in Times OTP is ready`,
      template_path: "../views/MailTemplates/ForgetPassword.html",
      context: { name: userr1.name, otp: otp },
    });

    // Mail.send(res, {
    //   to: email,
    //   subject: "Your OTP is ready " + otp,
    //   text: "Thank you for subscribing to our news letter",
    //   template: "../views/MailTemplates/NewsLetter",
    //   html: `<div class="page">
    //   <div class="container">
    //     <div class="email_header">

    //       <img class="logo" src="https://raw.githubusercontent.com/PMerilo/ThreadsInNode/master/public/images/logo.png" alt="Threads In Times" />
    //       <h1>Email Confirmation</h1>
    //     </div>
    //     <div class="email_body">
    //       <p><b>Hi ,</b></p>
    //       <p>Your OTP is example</b></p>

    //       </a>
    //       <p>Thanks for supporting,<br/>
    //         <b>The Threads in Times Team</b>
    //       </p>
    //     </div>
    //     <div class="email_footer">:copyright: Threads in Times 2020</div>
    //   </div>
    // </div>`
    // })

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
  if (otp == "placeholder") {
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
router.get("/backupcodes", async (req, res) => {
  temp = (await TempUser.findAll({ where: { email: req.user.email } })).map((x) => x.dataValues)
  res.render('backupcodes', { temp })
})

router.post('/backupcodes', async (req, res) => {
  console.log('hleloefe')
  code1 = Math.random().toString(36).substring(2, 15);
  code2 = Math.random().toString(36).substring(2, 15)
  await TempUser.update({
    backupcode1: code1, backupcode2: code2, backupcode1check: 'not used', backupcode2check: 'not used'
  }, { where: { email: req.user.email } });
  return res.redirect('/backupcodes')

})

router.get("/forgetpwbackupcodes", (req, res) => {
  if (otp == "placeholder") {
    flashMessage(res, 'error', 'You do not have permission for that page');
    return res.redirect("/")
  }
  res.render('forgetpwbackupcodes')
})
router.post('/forgetpwbackupcodes', async (req, res) => {
  let { backupcode } = req.body
  tempuser = await TempUser.findOne({ where: { email: emailvariable } })
  if (backupcode == tempuser.backupcode1) {
    if (tempuser.backupcode1check == "not used") {
      otp = "placeholder"
      otp2 = 'allowpwchange'
      await TempUser.update({ backupcode1check: 'used' }, { where: { email: tempuser.email } });
      flashMessage(res, 'success', 'Valid backup code entered. Please change your password!');
      return res.redirect('/forgetpasswordchange')
    }

  }
  if (backupcode == tempuser.backupcode2) {
    if (tempuser.backupcode2check == "not used") {
      otp = "placeholder"
      otp2 = 'allowpwchange'
      await TempUser.update({ backupcode2check: 'used' }, { where: { email: tempuser.email } });
      flashMessage(res, 'success', 'Valid backup code entered. Please change your password!');
      return res.redirect('/forgetpasswordchange')
    }

  }
  console.log(backupcode)
  flashMessage(res, 'error', 'Invalid backup code!');
  return res.redirect('/forgetpwbackupcodes')

  // if(backupcode){

  // }

})

router.get("/downloadbackupcodes", ensureAuthenticated, async (req, res) => {
  const content = 'Some content!'
  var pdfDoc = new PDFDocument({ bufferPages: true, font: 'Courier' });
  let WavePath = path.join(__dirname, '../public/images/Letterhead.png')
  bc = await TempUser.findOne({ where: { email: req.user.email } })
  back1 = bc.backupcode1
  back2 = bc.backupcode2


  const stream = res.writeHead(200, {
    'Content-Type': 'application/pdf',
    'Content-Disposition': `attachment;filename=backupcodes.pdf`,
  });
  pdfDoc.on('data', (chunk) => stream.write(chunk));

  pdfDoc.on('end', () => stream.end());
  pdfDoc.image(WavePath, 0, 0, { align: 'center', valign: 'center', width: 600 })
  pdfDoc
    .fillColor('#444444')
    .font('Courier-Bold')
    .fontSize(35)
    .text('Threads In Times', { align: 'left' })

  pdfDoc
    .fillColor('red')
    .fontSize(13)
    .text(`Backup Code 1: ${back1}`)
    .text(`Backup Code 2: ${back2}`)
  pdfDoc.end();
})

module.exports = router;


