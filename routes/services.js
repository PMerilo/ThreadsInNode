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
const Chat = require('../models/Chat');
const ChatUser = require('../models/ChatUser');
const Notification = require('../models/Notification');

router.get('/', (req, res) => {
    res.render('services/index')
});

router.use(ensureAuthenticated);


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
    }).then(async count => {
        let requested = await Request.findByPk(req.body.id, { include: ["tailor"] })
        let payload = {};
        if (count == 1) {
            payload = { send: true, by: req.user.name, to: requested.tailor.id, id: requested.id }
        } else {
            payload = { send: false, by: null, to: null, id: null }
        }
        return res.json(payload);
    })
});

router.get('/book/:reqId', async (req, res) => {
    let reqId = req.params.reqId;
    let request = await Request.findByPk(reqId);
    let now = moment()
    let min = now.add(7, 'd').format('YYYY-MM-DD')
    let max = now.add(1, 'M').format('YYYY-MM-DD')
    let tailorId = request.tailorId
    // console.log(max)
    if (request && req.user.id == request.userId) {
        res.render('services/booking', { reqId, min, max, tailorId })
    }
    else {
        flashMessage(res, 'error', 'You do not have permission to access this page');
        res.redirect("/login");
    }
});

router.post('/book/:reqId', async (req, res, next) => {
    let reqId = req.params.reqId;
    let userId = req.user.id
    let { date, time, description, tailorID } = req.body;
    req.body.status = 2
    req.body.statusId = reqId
    let datetime = moment(`${date} ${time}`)
    if (!datetime.isBetween(moment().add(7, 'd'), moment().add(1, "M"), 'date', '[]')) {
        flashMessage(res, 'error', `Appointment date out of range. Please pick a date between ${moment().add(7, 'd').format('DD-MM-YYYY')} and ${moment().add(1, "M").format('DD-MM-YYYY')}`)
        res.redirect(`/services/book/${reqId}`)
    } else {
        await Appointment.findOrCreate({
            where: {
                datetime: datetime,
                tailorId: tailorID,
                confirmed: {
                    [Op.ne]: false
                }
            },
            defaults: {
                datetime: datetime,
                description: description,
                userId: userId,
                requestId: reqId,
                tailorId: tailorID,
                confirmed: null
            }
        })
            .then(async ([appt, created]) => {
                // console.log(created)
                if (created) {
                    await Appointment.destroy({
                        where: {
                            datetime: datetime,
                            tailorId: tailorID,
                            confirmed: false
                        }
                    })
                    let tailor = await User.findByPk(tailorID)
                    let chatId;
                    await Chat.findAll({ include: ChatUser })
                        .then(async (chats) => {
                            let found = false
                            console.log(chats)
                            if (chats) {
                                chats.forEach(chat => {
                                    // console.log((chat.chatusers[0].userId == tailor.id || chat.chatusers[0].userId == user.id) && (chat.chatusers[1].userId == tailor.id || chat.chatusers[1].userId == user.id))
                                    if ((chat.chatusers[0].userId == tailor.id || chat.chatusers[0].userId == req.user.id) && (chat.chatusers[1].userId == tailor.id || chat.chatusers[1].userId == req.user.id)) {
                                        found = true
                                        chatId = chat.id
                                    }
                                });
                            }
                            if (!found) {
                                await Chat.create({})
                                    .then((async (chat) => {
                                        await ChatUser.create({ userId: tailor.id, chatId: chat.id, type: "Request" })
                                        await ChatUser.create({ userId: req.user.id, chatId: chat.id, type: "Request" })
                                        chatId = chat.id
                                    }))
                            }
                        })
                    let newreq = {};
                    await Request.update({ tailorId: tailorID, chatId: chatId }, { where: { id: reqId, tailorID: null } }).then((count) => { if (count == 1) { newreq = { title: ` and Request ID ${reqId}`, body: 'a new request and ' } } else { newreq = { title: ` for Request ID ${reqId}`, body: '' } } })
                    flashMessage(res, 'success', 'Appointment booking sucessful!')
                    let io = req.app.get('io')
                    let payload = {
                        title: `New Appointment${newreq.title}`,
                        body: `You have ${newreq.body}an appointment scheduled for ${date}, ${time}`,
                        url: '/admin/request',
                        sender: '',
                        recipient: tailorID
                    }
                    io.to(`User ${tailorID}`).emit('request:notif', payload)
                    let notification = await Notification.create({
                        title: payload.title,
                        body: payload.body,
                        url: payload.url,
                        senderId: payload.sender
                    })
                    let user = await User.findByPk(tailorID)
                    notification.addUser(user)
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
    next()
}, serviceController.requestStatus);

router.post('/appointment/edit', async (req, res, next) => {
    let { id, date, time, description } = req.body
    let datetime = moment(`${date} ${time}`)
    let send;
    await Appointment.findByPk(id)
        .then(async (appt) => {
            if (!appt) {
                flashMessage(res, 'error', 'No Appointment Found!')
                // return res.json({})
            } else if (appt.date == date && appt.time == time && appt.description == description) {
                flashMessage(res, 'error', 'No changes were made')
                // return res.json({})
            } else if (!moment(datetime).isBetween(moment().add(7, 'd'), moment().add(1, "M"), 'date', '[]')) {
                flashMessage(res, 'error', `Appointment date out of range. Please pick a date between ${moment().add(7, 'd').format('DD-MM-YYYY')} and ${moment().add(1, "M").format('DD-MM-YYYY')}`)
                // return res.json({})
            } else {
                req.body.statusId = (await appt.getRequest()).id
                req.body.status = (appt.date != date || appt.time != time ? 2 : 3)
                await Appointment.update({ datetime: datetime, description: description, confirmed: null }, { where: { id: id } })
                    .then(async () => {
                        flashMessage(res, 'success', 'Appointment updated sucessfully!')
                        send = true
                        await Request.update({ statusCode: req.body.status }, { where: { id: req.body.statusId } })
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
    let to = await Appointment.findByPk(id)
    let payload = {};
    if (send) {
        payload = { send: send, by: req.user.name, to: to.tailorId }
    } else {
        payload = { send: send, by: null, to: null }
    }
    return res.json(payload)
});

router.post('/request/tailorChange', async (req, res) => {
    let { id, tailorId } = req.body;
    let requested;
    let send;
    let request = await Request.findOne({ where: { id: id, tailorId: tailorId } })
    await Request.update({ tailorChangeId: tailorId }, { where: { id: id, tailorId: { [Op.not]: tailorId } } })
        .then(async count => {
            if (count == 1) {
                send = true
                requested = await Request.findByPk(req.body.id, { include: ['tailor', 'tailorChange', 'user'] })
                flashMessage(res, 'success', 'Tailor change requested')
            } else if (request) {
                flashMessage(res, 'info', 'No changes made')
            } else {
                flashMessage(res, 'error', 'Failed to request tailor change')
            }
        })
    let payload = {};
    if (send) {
        payload = { send: send, from: requested.tailor.id, to: requested.tailorChange.name, by: requested.user.name }
    } else {
        payload = { send: send, from: null, to: null, by: null }
    }
    return res.json(payload)
});


router.delete('/appointment/cancel', serviceController.appointmentDelete);
router.delete('/tailorChange/cancel', serviceController.tailorChangeDelete);
router.delete('/request/cancel', serviceController.requestDelete);





module.exports = router