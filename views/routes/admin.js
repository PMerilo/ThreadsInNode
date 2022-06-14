const express = require('express');
const router = express.Router();
const flashMessage = require('../helpers/messenger');
const sequelizeUser = require("../../config/DBConfig");
const { serializeUser } = require('passport');
const User = require("../../models/User");
const Ticket = require('../../models/Ticket');
const Feedback = require('../../models/Feedback');


router.use((req, res, next) => {
res.locals.path = req.baseUrl;
console.log(req.baseUrl);
//Checks url for normal users and admin
next();
});


router.get('/', (req,res) => {  
    res.render("admin/adminBase")
})

router.get('/adminProfile', (req,res) => {  
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

router.get('/TicketMangement', async (req,res) => {  
    tickets = (await Ticket.findAll()).map((x)=> x.dataValues)

    res.render("admin/TicketMangement",{tickets})
})
router.get('/FeedbackMangement', async (req,res) => {  
    feedbacks = (await Feedback.findAll()).map((x)=> x.dataValues)

    res.render("admin/FeedbackManagement",{feedbacks})
})

module.exports = router;

