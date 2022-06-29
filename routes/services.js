const express = require('express');
const router = express.Router();
const ensureAuthenticated = require('../views/helpers/auth')
const serviceController = require('../controllers/serviceController');
const User = require('../models/User');
const Appointment = require('../models/Appointment');
const Request = require('../models/Request');
const flashMessage = require('../views/helpers/messenger');

router.use((req, res, next) => {
    res.locals.path = req.baseUrl;
    console.log(req.baseUrl);
    //Checks url for normal users and admin
    next();
});

router.get('/', (req, res) => {
    res.render('services/index')
});

router.get('/request', ensureAuthenticated, (req, res) => {
    res.render('services/request')
});

router.post('/request', ensureAuthenticated, async (req, res) => {
    let {fName, lName, email, title, service, tailorID, description} = req.body;
    console.log(req.body)
    await Request.create({
        title: title,
        fName: fName, 
        lName: lName, 
        email: email, 
        service: service,
        tailorID: tailorID, 
        description: description, 
        userID: req.user.id
    })
        .then((request) => {
            res.redirect('/user/myRequests');
        })
        .catch(err => {
            console.log(err);
            flashMessage(res, 'error', 'Failed to Add to Create Request' )
            res.redirect('/services/request')
        });
});

router.get('/booking', (req, res) => {
    res.render('services/booking')

});

router.post('/booking', (req, res) => {
    let date = moment(req.body.date + req.body.time, 'DD/MM/YYYY, hh:mm A')
    let description = req.body.description
    let userID = req.user.id
});



module.exports = router