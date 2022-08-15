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
const { Op, col } = require('sequelize');
const Chat = require('../models/Chat');
const ChatUser = require('../models/ChatUser');
const Notification = require('../models/Notification');
const RequestItem = require('../models/RequestItem');

router.get('/', (req, res) => {
    res.render('services/index')
});

router.use(ensureAuthenticated);


router.get('/tailoring/request', async (req, res) => {
    let tailors = await User.findAll({ include: { model: Tailor, required: true } })
    let now = moment()
    let min = now.add(7, 'd').format('YYYY-MM-DD')
    let max = now.add(1, 'M').format('YYYY-MM-DD')
    res.render('services/requestform', { min, max, tailors })
});

router.post('/tailoring/request', async (req, res) => {
    let { title, date, time, tailorID, name, type, color, qty, description } = req.body;
    console.log(req.body)
    let datetime = moment(`${date} ${time}`)
    let items = []
    for (let i = 0; i < 3; ++i) {
        if (i == 0 && [name[i], color[i], qty[i], type[i], description[i]].length != 5) {
            flashMessage(res, 'error', `Your request item has missing information`)
            return res.redirect('/services/tailoring/request')
        } else if (i != 0 && ([].length > 0 && [name[i], color[i], qty[i], type[i], description[i]].length < 5)) {
            flashMessage(res, 'error', `Your request item has missing information`)
            return res.redirect('/services/tailoring/request')
        } else if ([name[i], color[i], qty[i], type[i], description[i]].length == 5) {
            items.push({
                name: name[i],
                color: color[i],
                qty: qty[i],
                type: type[i],
                description: description[i]
            })
        }

    }
    if (!datetime.isBetween(moment().add(7, 'd'), moment().add(1, "M"), 'date', '[]')) {
        flashMessage(res, 'error', `Appointment date out of range. Please pick a date between ${moment().add(7, 'd').format('DD-MM-YYYY')} and ${moment().add(1, "M").format('DD-MM-YYYY')}`)
        return res.redirect('/services/tailoring/request')
    }

    await Appointment.findOne({
        where: {
            tailorId: tailorID,
            datetime: datetime,
            confirmed: {
                [Op.or]: ['Pending', 'Confirmed']
            }
        }
    })
        .then(async (appointment) => {
            if (appointment !== null) {
                flashMessage(res, 'error', 'Appointment time is booked')
                return res.redirect('/services/tailoring/request')
            } else {
                await Appointment.destroy({
                    where: {
                        datetime: datetime,
                        tailorId: tailorID,
                        confirmed: 'Rejected'
                    }
                })
            }
        })


    let tailor = await User.findByPk(tailorID, { include: { model: Chat, include: { model: User, where: { id: req.user.id }, required: true } } })
    let request = await Request.create({
        title: title,
        status: 'Pending Appointment Confirmation',
        adminstatus: 'Please confirm this Appointment',
        userColor: 'blue',
        adminColor: 'yellow',
        userId: req.user.id,
        tailorId: tailorID,
    })
        .then(async (request) => {
            if (tailor.chats.length == 1) {
                await request.setChat(tailor.chats[0])
            } else {
                await request.createChat({})
                let chat = await request.getChat()
                await chat.addUser(tailor)
                await chat.addUser(req.user)
            }

            await Appointment.create({
                tailorId: tailorID,
                datetime: datetime,
                confirmed: 'Pending',
                type: 'Measurement',
                userId: req.user.id,
                requestId: request.id,
            })
                .catch(err => {
                    console.log(err);
                    flashMessage(res, 'error', 'Failed to Add to Create Appointment')
                    return res.redirect('/services/tailoring/request')
                })
            return request
        })
        .catch(err => {
            console.log(err);
            flashMessage(res, 'error', 'Failed to Add to Create Request')
            return res.redirect('/services/tailoring/request')
        })

    for (const item of items) {
        console.log(items)
        await RequestItem.create({
            name: item.name,
            color: item.color,
            qty: item.qty,
            type: item.type,
            description: item.description
        }).then((requestitem) => {
            request.addRequestitem(requestitem)
        })
    }

    let io = req.app.get('io')
    let payload = {
        title: "New Request",
        body: "You have a new request. Click here to see it",
        url: "/admin/requests",
        senderId: req.user.id,
    }
    await Notification.create({
        title: payload.title,
        body: payload.body,
        url: payload.url,
    })
        .then(notification => {
            notification.addUser(tailor)
            io.to(`User ${tailorID}`).emit('notification', payload)
        })


    return res.redirect('/user/requests')
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

// router.get('/book/:reqId', async (req, res) => {
//     let reqId = req.params.reqId;
//     let request = await Request.findByPk(reqId);
//     let now = moment()
//     let min = now.add(7, 'd').format('YYYY-MM-DD')
//     let max = now.add(1, 'M').format('YYYY-MM-DD')
//     let tailorId = request.tailorId
//     // console.log(max)
//     if (request && req.user.id == request.userId) {
//         res.render('services/booking', { reqId, min, max, tailorId })
//     }
//     else {
//         flashMessage(res, 'error', 'You do not have permission to access this page');
//         res.redirect("/login");
//     }
// });

// router.post('/book/:reqId', async (req, res, next) => {
//     let reqId = req.params.reqId;
//     let userId = req.user.id
//     let { date, time, description, tailorID } = req.body;
//     req.body.status = 2
//     req.body.statusId = reqId
//     let datetime = moment(`${date} ${time}`)

//     next()
// }, serviceController.requestStatus);

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


router.post('/item/edit', async (req, res) => {
    let { id, name, type, color, description } = req.body
    let item = await RequestItem.findByPk(req.body.id, { include: Request })
    let tailor = await item.request.getTailor()
    let payload = {
        recipient: tailor.id,
    }
    await RequestItem.update({ name: name, type: type, color: color, description: description }, { where: { id: id } })
        .then((count) => {
            if (count == 1) {
                payload.send = true
            } else {
                payload.send = false
            }
        })
        .catch((e) => {
            console.log(e);
            payload.send = false
        })
    res.json(payload)

});


router.delete('/item/remove', async (req, res) => {
    let item = await RequestItem.findByPk(req.body.id, { include: Request })
    let tailor = await item.request.getTailor()
    console.log(tailor);
    let payload = {
        send: true,
        title: 'Request Item Deleted',
        body: `The request item ${item.name} in request ${item.request.id} was deleted. Click here to see changes`,
        by: req.user.name,
        to: tailor.id,
        url: `/admin/requests`,
    }
    await RequestItem.destroy({ where: { id: req.body.id } })
    res.json(payload)

});

router.delete('/appointment/cancel', serviceController.appointmentDelete);
router.delete('/tailorChange/cancel', serviceController.tailorChangeDelete);
router.delete('/request/cancel', serviceController.requestDelete);





module.exports = router