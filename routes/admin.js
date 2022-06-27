const express = require('express');
const router = express.Router();
const flashMessage = require('../views/helpers/messenger');
const sequelizeUser = require("../config/DBConfig");
const { serializeUser } = require('passport');
const User = require("../models/User")


router.all('/*', function (req, res, next) {
    req.app.locals.layout = 'admin'; // set your layout here
    next(); // pass control to the next handler
});


router.get('/', (req,res) => {  
    res.render("admin/adminBase")
})

router.get('/profile', (req,res) => {  
    res.render("admin/adminProfile")
})

router.post('/admin/flash', (req, res) => {
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

router.get('/request', (req,res) => {  
    res.render("admin/adminProfile")
})


module.exports = router;

