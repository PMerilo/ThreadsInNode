const express = require('express');
const router = express.Router();
const moment = require('moment')
const User = require("../models/User");
const Ticket = require('../models/Ticket');
const Feedback = require('../models/Feedback');
const Message = require("../models/Messages")
const Reward = require('../models/Reward')
const Request = require('../models/Request');
const Service = require('../models/Service');
const Appointment = require('../models/Appointment');
const { Op } = require('sequelize');

router.get('/requests', async (req, res) => {
    // console.log(
    //     await Request.findAll({
    //             where: {
    //                 [Op.or]: [
    //                     { userId: req.user.id },
    //                     { tailorID: req.user.id }
    //                 ]

    //             },
    //             include: ['service', "user", 'appointments'],
    //         })
    // )
    return res.json({
        total: await Request.count(),
        rows: await Request.findAll({
            include: { all: true, nested: true },
            where: {
                [Op.or]: [
                    { userId: req.user.id },
                    { "$tailor.userId$": req.user.id }
                ]

            }
        })
    })

});

router.get('/appointments', async (req, res) => {
    if (req.query.date && req.query.id) {
        let date = moment(`${req.query.date}`)
        let date2 = moment(`${req.query.date}`).add(1, 'd')
        return res.json({
            total: await Appointment.count(),
            rows: await Appointment.findAll({ where: { datetime: { [Op.gte]: date, [Op.lt]: date2 }, tailorId: req.query.id, confirmed: { [Op.ne]: false } } })
        })
    }
    else {
        return res.status(400).send("Invalid Query Params")
    }

});

router.get('/appointment/:id', async (req, res) => {
    return res.json({
        total: await Appointment.count(),
        rows: await Appointment.findAll({
            where: {
                [Op.or]: {
                    userId: req.user.id,
                    tailorId: req.user.id
                },
                requestId: req.params.id
            },
            order: [["createdAt", "DESC"]],
            limit: 1

        })
    })
});

module.exports = router;