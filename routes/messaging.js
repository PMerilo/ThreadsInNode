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
const Tailor = require('../models/Tailor');
const Notification = require('../models/Notification');
const ensureAuthenticated = require('../views/helpers/auth');
const Msg = require('../models/Msg');
const Chat = require('../models/Chat');

router.all("/*", ensureAuthenticated)

router.post("/", async (req, res) => {
    const { content, userId, chatId } = req.body
    console.log(req.body)
    let msg = await Msg.create({
        content: content,
        userId: userId,
        chatId: chatId
    })

    return res.json(msg)
})

router.get("/", async (req, res) => {
    const { id } = req.query
    let messages = await Chat.findByPk(
        id,
        {
            include:
                [
                    Msg,
                    {
                        model: User,
                        where: {
                            id: { [Op.ne]: req.user.id }
                        }
                    }
                ],
            order: [
                [Msg, 'createdAt']
            ]
        })
    // console.log(messages.msgs)
    return res.json(messages)
})
module.exports = router;