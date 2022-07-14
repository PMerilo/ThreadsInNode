const express = require('express');
const router = express.Router();

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
    console.log("request receieved")
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
            where: {
                [Op.or]: [
                    { userId: req.user.id },
                    { tailorID: req.user.id }
                ]

            },
            include: ['service', "user", 'appointments'],
        })
    })
    
});

router.get('/appointments/:date', async (req, res) => {
    console.log("request receieved")
    return res.json({
        total: await Appointment.count(),
        rows: await Appointment.findAll({
            where: {
                date: req.params.date
            }
        })
    })
});

module.exports = router;