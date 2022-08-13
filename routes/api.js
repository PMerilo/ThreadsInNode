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
const { Op, where } = require('sequelize');
const Tailor = require('../models/Tailor');
const Notification = require('../models/Notification');
const Chat = require('../models/Chat');
const ChatUser = require('../models/ChatUser');
const ensureAuthenticated = require('../views/helpers/auth');

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

router.get("/getroles/:id", async (req, res) => {
    let x = [];
    let user = await User.findByPk(req.params.id)
    if (!user) {
        return res.json([])
    }
    if (user.getTailor()) {
        x.push("tailors")
    }
    let chats = await ChatUser.findAll({ where: { userId: req.params.id } })
    if (chats) {
        chats.forEach(chat => {
            x.push(`Chat ${chat.chatId}`)
        })
    }
    return res.json(x)
})

router.get("/getnotifications", async (req, res) => {
    // console.log(req.query)
    let user = await User.findByPk(req.query.id)
    let notifications;
    if (user) {
        notifications = await user.getNotifications()
    }
    // console.log(notifications)
    return res.json(notifications)
})

router.get("/create", async (req, res) => {
    // let chat = await Chat.create({})
    let tailor = await User.findByPk(1)
    let user = await User.findByPk(2)

    // chat.setUsers([tailor, user])

    chats = await Chat.findAll({ include: ChatUser })
    let chat1 = {};
    chats.forEach(chat => {
        console.log((chat.chatusers[0].userId == tailor.id || chat.chatusers[0].userId == user.id) && (chat.chatusers[1].userId == tailor.id || chat.chatusers[1].userId == user.id))
        if ((chat.chatusers[0].userId == tailor.id || chat.chatusers[0].userId == user.id) && (chat.chatusers[1].userId == tailor.id || chat.chatusers[1].userId == user.id)) {
            chat1 = { chat }
        }
    });

    return res.json({ chat1 })
})
module.exports = router;