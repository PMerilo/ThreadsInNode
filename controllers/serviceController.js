const Appointment = require('../models/Appointment')
const Request = require('../models/Request')
const { Op } = require('sequelize');
const moment = require('moment');
const Tailor = require('../models/Tailor');



const checkAppointment = async (req, res, next) => {
    await Appointment.unscoped().findAll({
        include: Request,
        where: {
            "$request.statusCode$": 2,
            confirmed: {
                [Op.is]: null
            },
            datetime: {
                [Op.lt]: moment().add(5, 'd')
            }
        }
    }).then(async (appt) => {
        appt.forEach(async function (a) {
            await Appointment.unscoped().update({ confirmed: false }, { where: { id: a.id } })
            await Request.update({ statusCode: -1 }, { where: { id: a.requestId } })
        });
    })
    next();
}

const appointmentDelete = async (req, res) => {
    let x = await Appointment.findByPk(req.body.id)
    await Request.update({ status: 'Appointment Cancelled', adminStatus: "User Cancelled Appointment", userColor: "red", adminColor: 'blue' }, { where: { id: x.requestId } })
    let appt = await Appointment.findByPk(req.body.id)
    await Appointment.destroy({ where: { id: req.body.id } }).then((count) => {
        let payload = {};
        if (count == 1) {
            payload = { send: true, title: 'Appointment Cancelled', body: `Appointment on ${appt.datetimeHuman} was canceled by ${req.user.name}`, by: req.user.name, url: '/admin/requests', to: appt.tailorId }
        } else {
            payload = { send: false, title: null, body: null, by: null, url: null, to: null }
        }
        return res.json(payload);
    })
}

const requestDelete = async (req, res) => {
    let requested = await Request.findByPk(req.body.id)
    await Request.destroy({ where: { id: req.body.id } }).then((count) => {
        let payload = {};
        if (count == 1) {
            payload = { send: true, title: 'Request Cancelled', body: `Request ID ${req.body.id} was canceled by ${req.user.name}`, by: req.user.name, url: '/admin/requests', to: requested.tailorId }
        } else {
            payload = { send: false, title: null, body: null, by: null, url: null, to: null }
        }
        return res.json(payload);
    })
}

const tailorChangeDelete = async (req, res) => {
    let requested = await Request.findByPk(req.body.id)
    await Request.update({ tailorChangeId: null }, { where: { id: req.body.id } }).then((count) => {
        if (count == 1) {
            payload = { send: true, title: 'Tailor Change Cancelled', body: `Tailor Change requested was canceled by ${req.user.name} for Request ID ${req.body.id}`, by: req.user.name, url: '/admin/requests', to: requested.tailorId }
        } else {
            payload = { send: false, title: null, body: null, by: null, url: null, to: null }
        }
        return res.json(payload);
    })
}

const requestStatus = async (req, res, next) => {
    let adminstatus
    let adminColor
    let userColor
    console.log(req.body.status);
    if (req.body.status == 'Finished Appointment' || req.body.status == 'Cancel Fitting Appointment Request') {
        status = 'In Progress'
        adminstatus = 'In Progress'
        userColor = 'blue'
        adminColor = 'blue'
    } else if (req.body.status == 'Request Fitting Appointment') {
        status = 'Ready for fitting! Please book your appointment'
        adminstatus = 'Awaiting Fitting Appointment Booking'
        userColor = 'yellow'
        adminColor = 'yellow'
    } else if (req.body.status == 'Finished Request') {
        status = 'Request is completed! Ready for pickup'
        
        adminstatus = 'Request completed! Ready for pickup!'
        userColor = 'green'
        adminColor = 'green'
    } else if (req.body.status ==  "In Progress") {
        status = 'Request in progress'
        adminstatus = 'Request in progress'
        userColor = 'blue'
        adminColor = 'blue'
    }
    await Request.update({ status: status, adminstatus: adminstatus, userColor: userColor, adminColor: adminColor  }, { where: { id: req.body.statusId } })
    next()
}

module.exports = {
    appointmentDelete,
    requestDelete,
    tailorChangeDelete,
    requestStatus,
    checkAppointment,
}