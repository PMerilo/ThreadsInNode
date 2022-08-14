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
const ensureAuthenticated = require('../views/helpers/auth');
const Msg = require('../models/Msg');
const Chat = require('../models/Chat');

router.post("/live", async (req, res) => {
    const { content, liveId, userId } = req.body
    let [chat, created] = await Chat.findOrCreate({ where: { liveId: liveId, livechat: true }, defaults: { liveId: liveId, livechat: true } })
    chat.createMsg({
        content: content,
        userId: userId,
        seen: true
    })
    return res.json({})
})

router.post("/closeroom", async (req, res) => {
    const { chatId } = req.body
    await Chat.update({ open: false }, { where: { liveId: chatId } })
    return res.json({})
})

router.all("/*", ensureAuthenticated)

router.post("/", async (req, res) => {
    const { content, userId, chatId } = req.body
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

router.post('/markasseen', async (req, res) => {
    let { chatId } = req.body
    let chat = await Msg.update({ seen: true }, { where: { seen: false, userId: { [Op.ne]: req.user.id }, chatId: chatId }, include: { model: Chat, include: { model: User, where: { id: req.user.id }, required: true }, required: true }, raw: true })
    res.json({})
})
module.exports = router;