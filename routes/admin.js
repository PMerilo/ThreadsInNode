const express = require('express');
const router = express.Router();
const flashMessage = require('../views/helpers/messenger');
const sequelizeUser = require("../config/DBConfig");
const { serializeUser } = require('passport');
const User = require("../models/User");
const Ticket = require('../models/Ticket');
const Feedback = require('../models/Feedback');
const Message = require("../models/Messages")
const Reward = require('../models/Reward')
const ensureAuthenticated = require("../views/helpers/auth");
const ensureAdminAuthenticated = require("../views/helpers/adminAuth");
const Request = require('../models/Request');
const Tailor = require('../models/Tailor');
const TempUser = require("../models/TempUser");

router.all('/*', ensureAdminAuthenticated, function (req, res, next) {
    req.app.locals.layout = 'admin'; // set your layout here
    next(); // pass control to the next handler
});

router.get('/', (req, res) => {
    res.render("admin/adminBase")
})

router.get('/profile', ensureAuthenticated, (req, res) => {
    res.render("admin/adminProfile")
})

router.post('/admin/flash', (req, res) => {
    const message = 'This is an important message';
    const error = 'This is an error message';
    const error2 = 'This is the second error message';

    // req.flash('message', message);
    // req.flash('error', error);
    // req.flash('error', error2);

    flashMessage(res, 'success', message);
    flashMessage(res, 'info', message);
    flashMessage(res, 'error', error);
    flashMessage(res, 'error', error2, 'fas fa-sign-in-alt', true);

    res.redirect('/');
});

router.get('/requests', (req, res) => {
    res.render("admin/requests")
});

router.post('/requests/edit', async (req, res) => {
    await Request.update({ status: req.body.status }, {
        where: {
          id: req.body.id
        },
    });
    return res.json({});
});

router.delete('/requests/delete', async (req, res) => {
    await Request.destroy({
        where: {
          id: req.body.id
        }
    });
    return res.json({})
});

router.get('/TicketMangement', ensureAdminAuthenticated, async (req, res) => {
    tickets = (await Ticket.findAll()).map((x) => x.dataValues)
    res.render("admin/TicketMangement", { tickets })
})

router.post('/TicketMangement/deleteTicket', ensureAdminAuthenticated, async (req, res) => {
    let { ticketID, ticketTitle, owner, ownerID } = req.body;

    deletedTicket = req.body.ticketID
    let date_ob = new Date();
    // current date
    // adjust 0 before single digit date
    let date = ("0" + date_ob.getDate()).slice(-2);

    // current month
    let month = ("0" + (date_ob.getMonth() + 1)).slice(-2);

    // current year
    let year = date_ob.getFullYear();

    // current hours
    let hours = date_ob.getHours();
    // current minutes
    let minutes = date_ob.getMinutes();

    // current seconds
    let seconds = date_ob.getSeconds();
    try {
        await Message.create({
            title: "Ticket Issue Unresolved Case: " + req.body.ticketTitle,
            description: "We were unable to resolve your issue we apologize for the inconvenience.",
            dateAdded: year + "-" + month + "-" + date + " " + hours + ":" + minutes + ":" + seconds,
            owner: req.body.owner,
            ownerID: req.body.ownerID,
            sender: req.user.name,
            senderID: req.user.id
        });

    } catch (e) {
        console.log(e)
        flashMessage(res, 'danger', "Ticket Reply Could Not Be Sent Owner Account May be Disabled");
        res.redirect("/admin/TicketMangement")
    }
    recepientuser = await User.findOne({ where: { id: req.body.ownerID } })
    newMessageCount = recepientuser.MessagesCount + 1
    User.update({ MessagesCount: newMessageCount }, { where: { id: req.body.ownerID } })
    Ticket.destroy({ where: { id: ticketID } })



    flashMessage(res, 'success', "Ticket Deleted Successfully! ID: " + ticketID);
    res.redirect("/admin/TicketMangement")
})

router.post('/TicketMangement/reply', ensureAdminAuthenticated, async (req, res) => {
    let date_ob = new Date();
    // current date
    // adjust 0 before single digit date
    let date = ("0" + date_ob.getDate()).slice(-2);

    // current month
    let month = ("0" + (date_ob.getMonth() + 1)).slice(-2);

    // current year
    let year = date_ob.getFullYear();

    // current hours
    let hours = date_ob.getHours();
    // current minutes
    let minutes = date_ob.getMinutes();

    // current seconds
    let seconds = date_ob.getSeconds();

    let { ticketID, title, urgency, description, owner, ownerID } = req.body;


    Ticket.urgency = req.body.urgency

    try {
        await Message.create({
            title: req.body.title,
            description: req.body.description,
            dateAdded: year + "-" + month + "-" + date + " " + hours + ":" + minutes + ":" + seconds,
            owner: req.body.owner,
            ownerID: req.body.ownerID,
            sender: req.user.name,
            senderID: req.user.id
        });

    } catch (e) {
        console.log(e)
        flashMessage(res, 'danger', "Ticket Reply Could Not Be Sent Owner Account May be Disabled");
        res.redirect("/admin/TicketMangement")
    }
    recepientuser = await User.findOne({ where: { id: req.body.ownerID } })
    newMessageCount = recepientuser.MessagesCount + 1
    User.update({ MessagesCount: newMessageCount }, { where: { id: req.body.ownerID } })
    flashMessage(res, 'success', "Ticket Reply Sent Successfully! to ID: " + req.body.owner);
    Ticket.destroy({ where: { id: ticketID } })
    res.redirect("/admin/TicketMangement")
})

router.get('/FeedbackMangement', ensureAdminAuthenticated, async (req, res) => {
    feedbacks = (await Feedback.findAll()).map((x) => x.dataValues)

    res.render("admin/FeedbackManagement", { feedbacks })
})

router.post('/FeedbackMangement/deleteFeedback', ensureAdminAuthenticated, async (req, res) => {
    let { feedbackID } = req.body;

    deletedFeedback = req.body.feedbackID
    Feedback.destroy({ where: { id: feedbackID } })
    flashMessage(res, 'success', "Feedback Deleted Successfully! ID: " + feedbackID);
    res.redirect("/admin/FeedbackMangement")
})

router.get('/UserManagement', ensureAdminAuthenticated, async (req, res) => {
    Users = (await User.findAll()).map((x) => x.dataValues)

    res.render("admin/userManagement", { Users })
})

router.get('/editUser/:id', (req, res) => {
    User.findByPk(req.params.id)
        .then((user) => {
            res.render('admin/editUser', { user });
        })
        .catch(err => console.log(err));
});

router.post('/editUser/:id', async (req, res) => {
    x = 0;
    y = 0
    userr = await User.findOne({ where: { id: req.params.id } })
    if ((await User.findOne({ where: { email: req.body.email } })) && userr.email != req.body.email) {
        x = 1
    }
    if ((await User.findOne({ where: { name: req.body.name } })) && userr.name != req.body.name) {
        y = 1
    }
    if (x == 1 && y != 1) {
        flashMessage(res, 'error', 'This email has already been registered');
        return res.redirect("/admin/UserManagement");
    }
    else if (x != 1 && y == 1) {
        flashMessage(res, 'error', 'This name has already been registered');
        return res.redirect("/admin/UserManagement");
    }
    else if (x == 1 && y == 1) {
        flashMessage(res, 'error', 'Both name and email has already been registered');
        return res.redirect("/admin/UserManagement");
    }
    let name = req.body.name;
    let email = req.body.email;
    let phoneNumber = req.body.phoneNumber;
    let gender = req.body.gender;
    let isban = req.body.isban;
    let bankAccount = req.body.bankAccount;
    await User.update({ name, email, phoneNumber, bankAccount, gender, isban }, { where: { id: req.params.id } })
    await TempUser.update({ email }, { where: { email: userr.email } })
    flashMessage(res, 'success', 'Account successfully edited');
    res.redirect('/admin/UserManagement')
})

router.get('/deleteUser/:id', async function
    (req, res) {
    try {
        let user = await User.findByPk(req.params.id);
        User.destroy({ where: { id: user.id } });
        TempUser.destroy({ where: { email: user.email } });
        flashMessage(res, 'success', 'Account successfully deleted.');
        res.redirect('/admin/UserManagement');
    }
    catch (err) {
        console.log(err);
    }
});


router.get("/Dashboard", ensureAdminAuthenticated, async (req, res) => {
    res.render("admin/AdminDashboard")
})

router.get('/manageVouchers', async (req, res) => {
    vouchers = (await Reward.findAll()).map((x) => x.dataValues)
    res.render('rewards/viewVouchers', { vouchers });
});

router.get('/addVouchers', ensureAuthenticated, (req, res) => {
    res.render("rewards/addVouchers")
})

router.post('/addVouchers', ensureAdminAuthenticated, async (req, res) => {
    let { name, voucher_code, description, spools_needed, discount_amount, quantity, expiry_date } = req.body;
    try {
        await Reward.create({
            name: req.body.name,
            voucher_code: req.body.voucher_code,
            description: req.body.description,
            spools_needed: req.body.spools_needed,
            discount_amount: req.body.discount_amount,
            quantity: req.body.quantity,
            expiry_date: req.body.expiry_date
        });
        flashMessage(res, "success", name + 'Voucher Added Successfully');
        res.redirect("/admin")
    } catch (e) {
        console.log(e)
        res.redirect("/admin")
    }
})

router.get('/editVoucher/:id', ensureAuthenticated, async (req, res) => {

    voucher = await Reward.findOne({ where: { id: req.params.id } })
    res.render("rewards/editVouchers", { voucher })
})


router.post('/editVoucher/:id', ensureAuthenticated, async (req, res) => {
    let { name, voucher_code, description, spools_needed, discount_amount, quantity, expiry_date } = req.body;

    Reward.update({
        name: name,
        voucher_code: voucher_code,
        description: description,
        spools_needed: spools_needed,
        discount_amount: discount_amount,
        quantity: quantity,
        expiry_date: expiry_date
    }, { where: { id: req.params.id } })

    flashMessage(res, 'success', name + " Edited Successfully!");
    res.redirect("/admin")

})

router.post('/deleteVoucher', ensureAuthenticated, (req, res) => {
    let { id, name } = req.body;
    Reward.destroy({ where: { id: id } })
    flashMessage(res, 'success', name + " Deleted successfully");
    res.redirect("/admin/manageVouchers")
})

router.get('/tailor/register', async (req, res) => {
    res.render("admin/tailor")
});

router.post('/tailor/register', async (req, res) => {
    await Tailor.create({userId: req.user.id})
    flashMessage(res,"success", 'Registered as Tailor Successfully');
    res.redirect("/admin")
});

module.exports = router;

