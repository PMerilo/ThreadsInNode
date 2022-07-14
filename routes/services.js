const express = require('express');
const router = express.Router();
const ensureAuthenticated = require('../views/helpers/auth')
const serviceController = require('../controllers/serviceController');
const User = require('../models/User');
const Appointment = require('../models/Appointment');
const Request = require('../models/Request');
const Service = require('../models/Service');
const flashMessage = require('../views/helpers/messenger');
const moment = require('moment');

router.use((req, res, next) => {
    res.locals.path = req.baseUrl;
    console.log(req.baseUrl);
    //Checks url for normal users and admin
    next();
});

router.get('/', (req, res) => {
    res.render('services/index')
});

router.get('/request', ensureAuthenticated, async (req, res) => {
    let object = await Service.findAll();
    // console.log(object)
    res.render('services/request', { object })
});

router.post('/request', ensureAuthenticated, async (req, res) => {
    let { fName, lName, email, title, service, tailorID, description } = req.body;
    await Request.create({
        title: title,
        fName: fName,
        lName: lName,
        email: email,
        serviceId: service,
        tailorID: tailorID,
        description: description,
        userId: req.user.id
    })
        .then((request) => {
            let reqId = request.id
            res.redirect(`/services/book/${request.id}`);
        })
        .catch(err => {
            console.log(err);
            flashMessage(res, 'error', 'Failed to Add to Create Request')
            res.redirect('/services/request')
        });
});

router.post('/request/edit', ensureAuthenticated, async (req, res) => {
    console.log(req.body)
    await Request.update({ title: req.body.title, description: req.body.description, serviceId: req.body.service }, {
        where: {
            id: req.body.id
        }
    });
    return res.json({});
});

router.get('/book/:reqId', ensureAuthenticated, async (req, res) => {
    let reqId = req.params.reqId;
    let request = await Request.findByPk(reqId);
    let now = moment()
    let today = now.format('YYYY-MM-DD')
    let max = now.add(1, 'M').format('YYYY-MM-DD')
    // console.log(max)
    if (request && req.user.id == request.userId) {
        res.render('services/booking', { reqId, today, max })
    }
    else {
        flashMessage(res, 'error', 'You do not have permission to access this page');
        res.redirect("/login");
    }
});

router.post('/book/:reqId', ensureAuthenticated, async (req, res) => {
    let reqId = req.params.reqId;
    let userId = req.user.id;
    let { date, time, description } = req.body;

    // console.log("time: "+time)
    if (!moment(date).isBetween(moment(), moment().add(1, "M"))) {
        flashMessage(res, 'error', 'Appointment date out of range')
        res.redirect(`/services/book/${reqId}`)
    } else {
        await Appointment.findOrCreate({
            where: {
                date: date,
                time: time,
            },
            defaults: {
                date: date,
                time: time,
                description: description,
                userId: req.user.id,
                requestId: reqId,
                userId: userId
            }
        })
        .then(([appt, created]) => {
            // console.log(created)
            if (created) {
                res.redirect('/user/requests');
            } else {
                flashMessage(res, 'error', 'Appointment time is booked')
                res.redirect(`/services/book/${reqId}`)
            }
        })
        .catch(err => {
            console.log(err);
            flashMessage(res, 'error', 'Failed to book Appointment')
            res.redirect('/services/book')
        });
    }

});



module.exports = router