const express = require('express');
const router = express.Router();
const flashMessage = require('../helpers/messenger');
const sequelizeUser = require("../../config/DBConfig");
const { serializeUser } = require('passport');
const User = require("../../models/User")

router.get('/', (req,res) => {
    res.render("index")
})

router.get('/RewardsPage', (req,res) => {
    res.render("rewards")
})

router.get('/CustomerService', (req,res) => {
    res.render("customerservice")
})


router.get('/profile', (req,res) => {
    
    
   
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

router.get('/editProfile', (req,res) => {
    res.render("editProfile.handlebars")
})

router.get('/changePassword', (req,res) => {
    res.render("userEditPassword.handlebars")
})

router.get('/myOrders', (req,res) => {
    res.render("myOrders.handlebars")
})

router.get('/shoppingCart', (req,res) => {
    res.render("shoppingCart.handlebars")
})

router.get('/otherSupport', (req,res) => {
    res.render("otherSupport.handlebars")
})



module.exports = router;

