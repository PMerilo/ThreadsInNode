const Appointment = require('../models/Appointment')
const Request = require('../models/Request')

const appointmentDelete = async (req, res) => {
    await Appointment.destroy({ where: { id: req.body.id } })
    return res.json({})
}

const requestDelete = async (req, res) => {
    await Request.destroy({ where: { id: req.body.id } })
    return res.json({})
}

const tailorChangeDelete = async (req, res) => {
    await Request.update({tailorChangeId: null}, { where: { id: req.body.id } })
    return res.json({})
}

module.exports = {
    appointmentDelete,
    requestDelete,
    tailorChangeDelete,
}