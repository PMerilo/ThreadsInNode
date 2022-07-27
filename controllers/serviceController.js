const Appointment = require('../models/Appointment')
const Request = require('../models/Request')
const { Op } = require('sequelize');
const moment = require('moment');



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
    await Request.update({ statusCode: 1 }, { where: { id: x.requestId } })
    await Appointment.destroy({ where: { id: req.body.id } })
    return res.json({})
}

const requestDelete = async (req, res) => {
    await Request.destroy({ where: { id: req.body.id } })
    return res.json({})
}

const tailorChangeDelete = async (req, res) => {
    await Request.update({ tailorChangeId: null }, { where: { id: req.body.id } })
    return res.json({})
}

const requestStatus = async (req, res, next) => {
    await Request.update({ statusCode: req.body.status }, { where: { id: req.body.statusId } })
    next()
}

module.exports = {
    appointmentDelete,
    requestDelete,
    tailorChangeDelete,
    requestStatus,
    checkAppointment,
}