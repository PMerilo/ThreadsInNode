const express = require('express');
const router = express.Router();
const ensureAuthenticated = require('../views/helpers/auth')
const serviceController = require('../controllers/serviceController');
const User = require('../models/User');
const Appointment = require('../models/Appointment');
const Request = require('../models/Request');

router.use((req, res, next) => {
    res.locals.path = req.baseUrl;
    console.log(req.baseUrl);
    //Checks url for normal users and admin
    next();
});

router.get('/', (req, res) => {
    res.render('services/index')
});

router.get('/request', (req, res) => {
    res.render('services/request')
});

router.post('/request', (req, res) => {
    let title = req.body.title
    let fName = req.body.fName
    let lName = req.body.lName
    let email = req.body.email
    let service = req.body.service
    let tailorID = req.body.tailorID
    let description = req.body.description
    let userID = req.user.id
    Request.create(
        {fName, lName, email, service, tailorID, datetime, description, userID, reqestID}
    )
        .then((request) => {
            // console.log(request.toJSON());
            res.redirect('/user/myRequests');
            })
        .catch(err => console.log(err))
    res.render('services/request')
    
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