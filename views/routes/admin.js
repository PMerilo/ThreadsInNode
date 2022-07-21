const express = require('express');
const router = express.Router();
const flashMessage = require('../helpers/messenger');
const sequelizeUser = require("../../config/DBConfig");
const { serializeUser } = require('passport');
const User = require("../../models/User")



router.use((req, res, next) => {
    res.locals.path = req.baseUrl;
    console.log(req.baseUrl);
    //Checks url for normal users and admin
    next();
});


router.get('/', (req, res) => {
    res.render("admin/adminBase")
})

router.get('/adminProfile', (req, res) => {
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

router.get('/UserManagement', async (req, res) => {
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
    await User.update({ name, email, phoneNumber, gender, isban }, { where: { id: req.params.id } })
    flashMessage(res, 'success', 'Account successfully edited');
    res.redirect('/admin/UserManagement')
})

router.get('/deleteUser/:id', async function
    (req, res) {
    try {
        let user = await User.findByPk(req.params.id);
        User.destroy({ where: { id: user.id } });
        flashMessage(res, 'success', 'Account successfully deleted.');
        res.redirect('/admin/UserManagement');
    }
    catch (err) {
        console.log(err);
    }
});

module.exports = router;

