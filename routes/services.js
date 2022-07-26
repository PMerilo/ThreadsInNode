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
const Tailor = require('../models/Tailor');
const { Op } = require('sequelize');

router.get('/', (req, res) => {
    res.render('services/index')
});

router.use(ensureAuthenticated, (req, res, next) => {
    next()
});


router.get('/request', async (req, res) => {
    res.render('services/requestform')
});

router.post('/request', async (req, res) => {
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

router.post('/request/edit', async (req, res) => {
    await Request.update({ title: req.body.title, description: req.body.description, serviceId: req.body.service }, {
        where: {
            id: req.body.id
        }
    });
    return res.json({});
});

router.get('/book/:reqId', async (req, res) => {
    let reqId = req.params.reqId;
    let request = await Request.findByPk(reqId);
    let now = moment()
    let max = now.add(1, 'M').format('YYYY-MM-DD')
    let tailorId = request.tailorId
    // console.log(max)
    if (request && req.user.id == request.userId) {
        res.render('services/booking', { reqId, max, tailorId })
    }
    else {
        flashMessage(res, 'error', 'You do not have permission to access this page');
        res.redirect("/login");
    }
});

router.post('/book/:reqId', async (req, res) => {
    let reqId = req.params.reqId;
    let userId = req.user.id
    let { date, time, description, tailorID } = req.body;
    console.log(req.body)
    let datetime = moment(`${date} ${time}`)
    if (!datetime.isBetween(moment(), moment().add(1, "M"))) {
        flashMessage(res, 'error', 'Appointment date out of range')
        res.redirect(`/services/book/${reqId}`)
    } else {
        await Appointment.findOrCreate({
            where: {
                datetime: datetime,
                tailorId: tailorID
            },
            defaults: {
                datetime: datetime,
                description: description,
                userId: userId,
                requestId: reqId,
                tailorId: tailorID
            }
        })
            .then(async ([appt, created]) => {
                // console.log(created)
                if (created) {
                    await Request.update({ tailorId: tailorID }, { where: { id: reqId, tailorID: null } })
                    flashMessage(res, 'success', 'Appointment booking sucessful!')
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

router.post('/appointment/edit', async (req, res) => {
    let { id, date, time, description } = req.body
    console.log(req.body)
    let datetime = moment(`${date} ${time}`)
    await Appointment.findByPk(id)
        .then(async (appt) => {
            if (!appt) {
                flashMessage(res, 'error', 'No Appointment Found!')
                // return res.json({})
            } else if (appt.date == date && appt.time == time && appt.description == description) {
                flashMessage(res, 'error', 'No changes were made')
                // return res.json({})
            } else if (!moment(date).isBetween(moment(), moment().add(1, "M"))) {
                flashMessage(res, 'error', 'Appointment date out of range')
                // return res.json({})
            } else {
                await Appointment.update({ datetime: datetime, description: description }, { where: { id: id } })
                    .then(() => {
                        flashMessage(res, 'success', 'Appointment updated sucessfully!')
                        // return res.json({})
                    })
                    .catch(err => {
                        console.log(err);
                        flashMessage(res, 'error', 'Failed to book Appointment')
                        // return res.json({})
                    });
            }
        })
        .catch((e) => {
            console.log(e)
        })
    return res.json({})
});

router.post('/request/tailorChange', async (req, res) => {
    let { id, tailorId } = req.body;
    let request = await Request.findOne({ where: { id: id, tailorId: tailorId } })
    await Request.update({ tailorChangeId: tailorId }, { where: { id: id, tailorId: { [Op.not]: tailorId } } })
        .then(count => {
            if (count == 1) {
                flashMessage(res, 'success', 'Tailor change requested')
            } else if (request) {
                flashMessage(res, 'info', 'No changes made')
            } else {
                flashMessage(res, 'error', 'Failed to request tailor change')
            }
        })
    return res.json({})
});


router.delete('/appointment/cancel', serviceController.appointmentDelete);
router.delete('/tailorChange/cancel', serviceController.tailorChangeDelete);
router.delete('/request/cancel', serviceController.requestDelete);



module.exports = router