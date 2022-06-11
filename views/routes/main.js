const express = require('express');
const router = express.Router();
const flashMessage = require('../helpers/messenger');
const sequelizeUser = require("../../config/DBConfig");
const { serializeUser } = require('passport');
const User = require("../../models/User")
const ensureAuthenticated = require("../helpers/auth");


router.use((req, res, next) => {
    res.locals.path = req.baseUrl;
    console.log(req.baseUrl);
    //Checks url for normal users and admin
    next();
  });



router.get('/', (req,res) => {
    res.render("index")
})

router.get('/RewardsPage', (req,res) => {
    res.render("rewards")
})

router.get('/CustomerService', (req,res) => {
    res.render("customerservice")
})


router.get('/profile',ensureAuthenticated, (req,res) => {
    
    res.render("profile")
})

router.post('/flash', (req, res) => {
	const message = 'This is an important message';
	const error = 'This is an error message';
	const error2 = 'This is the second error message';

    // req.flash('message', message);
    // req.flash('error', error);
    // req.flash('error', error2);

    flashMessage(res, 'success', message);
    flashMessage(res, 'info', message);
    flashMessage(res, 'error', error);
    flashMessage(res, 'error', error2, 'fas fa-sign-in-alt', true);

	res.redirect('/');
});

router.get('/editProfile',ensureAuthenticated, (req,res) => {
    res.render("editProfile.handlebars")
})

router.get('/changePassword',ensureAuthenticated, (req,res) => {
    res.render("userEditPassword.handlebars")
})

router.get('/myOrders',ensureAuthenticated, (req,res) => {
    res.render("myOrders.handlebars")
})

router.get('/shoppingCart', (req,res) => {
    res.render("shoppingCart.handlebars")
})

router.get('/otherSupport', (req,res) => {
    res.render("qnaPages/otherSupport.handlebars")
})

router.get('/gettingStarted', (req,res) => {
    res.render("qnaPages/gettingStarted.handlebars")
})

router.get('/myAccountQNA', (req,res) => {
    res.render("qnaPages/myAccountQNA.handlebars")
})

router.get('/payment&shippingQNA', (req,res) => {
    res.render("qnaPages/payment&shippingQNA.handlebars")
})
router.get('/troubleshootingQNA', (req,res) => {
    res.render("qnaPages/troubleshootingQNA.handlebars")
})

router.get('/rewards&offersQNA', (req,res) => {
    res.render("qnaPages/rewards&offersQNA.handlebars")
})


router.get('/messages',ensureAuthenticated, (req,res) => {
    res.render("messages.handlebars")
})
router.get('/feedback',ensureAuthenticated, (req,res) => {
    res.render("feedback.handlebars")
})



module.exports = router;

