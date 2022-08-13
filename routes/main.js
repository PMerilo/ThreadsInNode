const express = require('express');
const router = express.Router();
const flashMessage = require('../views/helpers/messenger');
const sequelizeUser = require("../config/DBConfig");
const { serializeUser } = require('passport');
const bcrypt = require('bcryptjs');
const sequelize = require('sequelize');
const Nanoid = require('nanoid');
//Our Models
const User = require("../models/User")
const Ticket = require("../models/Ticket")
const Feedback = require("../models/Feedback")
const Product = require("../models/Product")
const Reward = require('../models/Reward')
const Wishlist = require('../models/Wishlist')
const Message = require("../models/Messages")
const CartProduct = require("../models/CartProduct")
const Appointment = require("../models/Appointment")
const FAQ = require("../models/FAQ")
const Luhn = require("luhn-js")
const { v4: uuidv4 } = require('uuid');
const TempUser = require("../models/TempUser");
//Ensures User is autenticated before accessing
//page
const ensureAuthenticated = require("../views/helpers/auth");
const moment = require("moment");
// Required for file upload const 
fs = require('fs');
const upload = require('../views/helpers/imageUpload');
const console = require('console');
const stripeSecretKey = process.env.STRIPE_SECRET_KEY
const stripePublicKey = process.env.STRIPE_PUBLIC_KEY

// For mail
const nodemailer = require("nodemailer");
// const { where } = require('sequelize/types');
const Mail = require("../config/MailConfig");
const Cart = require('../models/Cart');
const Order = require('../models/Orders');
const OrderItems = require('../models/OrderItems');
const Notification = require('../models/Notification');
const UserNotification = require('../models/UserNotifications');
const Tailor = require('../models/Tailor');

// for forgetpassword
otp = 'placeholder'
otp2 = 'disallowpwchange'
emailvariable = 'placeholder'

// router.use((req, res, next) => {
//     res.locals.path = req.baseUrl;
//     console.log(req.baseUrl);
//Checks url for normal users and admin
//     next();
// });

router.get('/', async (req, res) => {

    products = (await Product.findAll()).map((x) => x.dataValues)


    const io = req.app.get('io')
    io.emit('test', 'from main')

    res.render("index", { products })
})

router.post('/addtoCart', ensureAuthenticated, async (req, res) => {
    var sku = req.body.sku;
    console.log(sku)
    purchasedProduct = await Product.findOne({ where: { sku: req.body.sku } })
    if (purchasedProduct.quantity > 0) {
        try {
            let [cart, cartStatus] = await Cart.findOrCreate({
                where: {
                    userId: req.user.id
                },
                defaults: {
                    id: req.user.id
                }
            })
            await CartProduct.findOrCreate({
                where: {
                    cartId: cart.id,
                    productSku: sku
                },
                defaults: {
                    qtyPurchased: 0
                }
            })
            await CartProduct.increment({ qtyPurchased: 1 }, { where: { cartId: cart.id, productSku: sku } })
            // flashMessage(res,"success", req.body.name + ' Purchased Successfully');
            // res.redirect("/")
        } catch (e) {
            console.log(e)
            res.redirect("/")
        }
    } else {
        flashMessage(res, "danger", req.body.name + ' is Out of Stock');
        res.redirect("/")
    }
})

router.post('/updateCart', ensureAuthenticated, async (req, res) => {
    var quantity = req.body.quantity
    var sku = req.body.sku
    console.log(quantity)
    cartProduct = await CartProduct.findOne({ where: { cartId: req.user.id, productSku: sku } })
    product = await Product.findOne({ where: { sku: sku } })
    productQuantity = cartProduct.qtyPurchased
    console.log(productQuantity)
    if (parseInt(quantity) <= 0) {
        quantity = 1
        console.log(quantity)
        // CartProduct.update({qtyPurchased: newqty},{where:{id:req.user.id+sku}} )
        // console.log(cartProduct.qtyPurchased + "hi")
    }
    if (parseInt(product.quantity) == 0) {
        // CartProduct.destroy({where:{id:req.user.id+sku}})
        await CartProduct.destroy({ where: { cartId: req.user.id, productSku: sku } })
        flashMessage(res, 'error', product.name + 'is out of stock!')
    } else {
        CartProduct.update({ qtyPurchased: quantity }, { where: { cartId: req.user.id, productSku: sku } })
    }

})

router.post('/deleteitem/:sku', ensureAuthenticated, async (req, res) => {
    // cartProduct = await CartProduct.findOne({where:{sku:req.params.sku}})
    // flashMessage(res, 'success', product.name + 'has been deleted from your cart!')
    await CartProduct.destroy({ where: { cartId: req.user.id, productSku: req.params.sku } })
    res.redirect('/cart')
})

router.post('/deletecart', ensureAuthenticated, async (req, res) => {
    var ownerID = req.user.id
    await Cart.destroy({ where: { id: ownerID } })
    res.redirect('/cart')
})

router.post('/discount', ensureAuthenticated, async (req, res) => {
    let date_ob = new Date();
    var todaysdate = date_ob.getFullYear() + "-" + ("0" + (date_ob.getMonth() + 1)).slice(-2) + "-" + ("0" + date_ob.getDate()).slice(-2)
    console.log(todaysdate)
    var ownerID = req.user.id
    var discountcodeused = req.body.code
    var status = req.body.status
    console.log(discountcodeused)
    var discountcodeinDB = await Reward.findOne({ where: { voucher_code: discountcodeused } })

    // res.send({discount_amount:discount_amount, status:"success"})
    // res.send({discount_amount:discount_amount, status:"spools_shortage"})
    // res.send({discount_amount:discount_amount, status:"voucher_expired"})
    // res.send({discount_amount:discount_amount, status:"voucher_ran_out"})
    try {
        if (discountcodeinDB) {
            var discount_amount = discountcodeinDB.discount_amount
            var rewardexpirydate = discountcodeinDB.expiry_date
            rewardexpirydate = moment(rewardexpirydate).format("YYYY-MM-DD")
            console.log(rewardexpirydate)
            if (discountcodeinDB.quantity > 0) {
                if (rewardexpirydate > todaysdate) {
                    if (discountcodeinDB.spools_needed <= req.user.spools) {
                        console.log(discount_amount)
                        res.send({ discount_amount: discount_amount, status: "success" })
                    } else {
                        res.send({ discount_amount: discount_amount, status: "spools_shortage" })
                    }
                } else {
                    res.send({ discount_amount: discount_amount, status: "voucher_expired" })
                }
            } else {
                res.send({ discount_amount: discount_amount, status: "voucher_ran_out" })
            }
        } else {
            res.send({ discount_amount: discount_amount, status: "no_such_voucher" })
        }

    } catch (e) {
        console.log(e)
        res.redirect("/")
    }
})

router.post('/wishlist', ensureAuthenticated, async (req, res) => {
    var sku = req.body.sku
    var status = req.body.status
    console.log(sku, status)
    checkProductinWishlist = await Wishlist.findOne({ where: { id: req.user.id + sku } })
    product = await Product.findOne({ where: { sku: sku } })

    if (status == "check") {
        if (checkProductinWishlist) {
            res.send({ response: "add", status: "check" })
        } else {
            res.send({ response: "remove", status: "check" })
        }
    } else if (status == "add/remove") {

        try {
            if (checkProductinWishlist) {
                Wishlist.destroy({ where: { id: req.user.id + sku } })
                var newwishlistcount = product.wishlistcount - 1
                Product.update({ wishlistcount: newwishlistcount }, { where: { sku: sku } })
                console.log('Item removed')
                res.send({ response: "remove", status: "add/remove" })
            } else {

                await Wishlist.create({
                    id: req.user.id + sku,
                    sku: sku,
                    name: product.name,
                    description: product.description,
                    price: product.price,
                    category: product.category,
                    Owner: req.user.name,
                    OwnerID: req.user.id
                });
                var newwishlistcount = product.wishlistcount + 1
                Product.update({ wishlistcount: newwishlistcount }, { where: { sku: sku } })
                console.log('Item added')
                res.send({ response: "add", status: "add/remove" })
            }
            // flashMessage(res,"success", req.body.name + ' Purchased Successfully');
            // res.redirect("/")
        } catch (e) {
            console.log(e)
            res.redirect("/")
        }
    }
})

router.post('/checkout', ensureAuthenticated, async (req, res) => {

    isValid = true
    if (!Luhn.isValid(req.body.card_number.replaceAll(" ", ""))) {
        res.send({ status: "error", icon: "error", title: "Oops..", text: "Creditcard Number Is Invalid!!" })
    } else {


        var order = await Order.create({
            orderUUID: ("#" + uuidv4().slice(-12)).toUpperCase(),
            orderOwnerID: req.user.id,
            orderOwnerName: req.body.fname,
            orderTotal: cart.cartTotal,
            discountcodeused: cart.discountcodeused,
            address: req.body.address,
            unit_number: req.body.unit_number,
            postal_code: req.body.postal_code,
            email: req.body.email,
            phone_number: req.body.phone,
            userId: req.user.id
        })

        var cartproducts = await Cart.findOne({ where: { id: req.user.id }, include: { model: Product } })
        // console.log(JSON.stringify(cartproducts))
        cartproducts.products.forEach(element => {
            OrderItems.create({
                orderId: order.id,
                productSku: element.sku,
                qtyPurchased: element.cartproduct.qtyPurchased,
                product_name: element.name,
                product_price: element.price,
                seller_name: element.Owner,
                seller_name: element.OwnerID,
                orderStatus: "Processing",
            })
            // var sold = element.sold + element.cartproduct.qtyPurchased
            // var sales = element.sales + (element.cartproduct.qtyPurchased*element.price)
            // var qty = element.quantity - element.cartproduct.qtyPurchased
            Product.update({ quantity: element.quantity - element.cartproduct.qtyPurchased, sold: element.sold + element.cartproduct.qtyPurchased, sales: element.sales + (element.cartproduct.qtyPurchased * element.price) }, { where: { sku: element.sku } })
        });
        var discountcode = await Reward.findOne({ where: { voucher_code: cartproducts.discountcodeused } })
        User.update({ spools: req.user.spools + order.orderTotal }, { where: { id: req.user.id } })
        if (discountcode) {
            User.update({ spools: req.user.spools - discountcode.spools_needed }, { where: { id: req.user.id } })
            Reward.update({ quantity: discountcode.quantity - 1 }, { where: { voucher_code: cartproducts.discountcodeused } })
        }
        await Cart.destroy({ where: { id: req.user.id } })
        res.send({ status: "success ", icon: "success", title: "Order Completed" })
        console.log("Order created")
    }
})

router.post('/checkoutsave', ensureAuthenticated, async (req, res) => {
    var subtotal = req.body.subtotal
    var discountcode = req.body.discount_code
    console.log(subtotal)
    console.log(discountcode)
    Cart.update({ cartTotal: subtotal, discountcodeused: discountcode }, { where: { id: req.user.id } })
})

router.get('/RewardsPage', (req, res) => {
    res.render("rewards")
})

router.get('/CustomerService', (req, res) => {
    res.render("customerservice")
})


router.get('/profile', ensureAuthenticated, async (req, res) => {

    res.render("profile")
})

router.post('/flash', (req, res) => {
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

router.get('/editProfile', ensureAuthenticated, (req, res) => {
    res.render("editProfile.handlebars")
})

router.post('/profile', ensureAuthenticated, (req, res) => {
    User.destroy({ where: { id: req.user.id } })
    TempUser.destroy({ where: { email: req.user.email } });
    req.logout();
    flashMessage(res, 'success', 'Account successfully deleted. Bye bye...');
    return res.redirect("/");

})
router.post('/changePassword', ensureAuthenticated, async (req, res) => {
    userr1 = await User.findOne({ where: { id: req.user.id } })
    const validPassword = await bcrypt.compare(req.body.oldpassword, userr1.password);
    if (!validPassword) {
        flashMessage(res, 'error', 'Incorrect password');
        return res.redirect('/changePassword')
    }
    let { oldpassword, newpassword, newpassword2 } = req.body;
    if (newpassword.length < 6) {
        flashMessage(res, 'error', 'Password must be at least 6 characters');
        return res.redirect('/changePassword')
    }
    if (newpassword2 != newpassword) {
        flashMessage(res, 'error', 'New passwords do not match');
        return res.redirect('/changePassword')
    }
    if (oldpassword == newpassword) {
        flashMessage(res, 'error', 'New and old passwords are the same');
        return res.redirect('/changePassword')
    }
    User.update({ password: newpassword }, { where: { id: req.user.id } })
    flashMessage(res, 'success', 'Password updated successfully');
    return res.redirect('/profile')
})

router.post('/editProfile', ensureAuthenticated, async (req, res) => {
    x = 0;
    y = 0
    userr = await User.findOne({ where: { id: req.user.id } })
    if ((await User.findOne({ where: { email: req.body.email } })) && userr.email != req.body.email) {
        x = 1
    }
    if ((await User.findOne({ where: { name: req.body.name } })) && userr.name != req.body.name) {
        y = 1
    }
    if (x == 1 && y != 1) {
        flashMessage(res, 'error', 'This email has already been registered');
        return res.redirect("/editProfile");
    }
    else if (x != 1 && y == 1) {
        flashMessage(res, 'error', 'This name has already been registered');
        return res.redirect("/editProfile");
    }
    else if (x == 1 && y == 1) {
        flashMessage(res, 'error', 'Both name and email has already been registered');
        return res.redirect("/editProfile");
    }

    let name = req.body.name;
    let email = req.body.email;
    let phoneNumber = req.body.phoneNumber;
    let gender = req.body.gender;
    User.update({ name, email, phoneNumber, gender }, { where: { id: req.user.id } })
    TempUser.update({ email }, { where: { email: userr.email } })
    flashMessage(res, 'success', 'Account successfully edited');
    res.redirect("/profile");

})

function checkAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {

        return next()
    }

    res.redirect("/profile")
}

router.get('/logout', ensureAuthenticated, (req, res) => {
    const message = 'You Have Logged out';
    flashMessage(res, 'success', message);
    req.logout();
    res.redirect('/');
});

router.get('/changePassword', ensureAuthenticated, (req, res) => {
    res.render("userEditPassword.handlebars")
})

router.get('/myOrders', ensureAuthenticated, async (req, res) => {
    orders = (await Order.findAll({ where: { orderOwnerID: req.user.id } }))
    // console.log(orders)
    // console.log(orders[0].orderUUID)
    res.render("pastOrder.handlebars", { orders })
})

router.get('/orderdetails/:id', ensureAuthenticated, async (req, res) => {
    var id = req.params.id
    orderitems = (await OrderItems.findAll({ where: { orderId: id } }))
    order = (await Order.findOne({ where: { id: id } }))
    res.render("pastOrderDetails.handlebars", { orderitems, order })
})

router.get('/cart', ensureAuthenticated, async (req, res) => {
    cartproducts = (await Cart.findOne({ where: { id: req.user.id }, include: Product, nested: true }))
    res.render("shoppingCart.handlebars", { cartproducts })
})

router.get('/wishlist', ensureAuthenticated, async (req, res) => {
    wishlistproducts = (await Wishlist.findAll({ where: { OwnerID: req.user.id } }))
    // products = (await Product.findAll({where: {sku:wishlistproducts.sku}}))
    res.render("wishlist.handlebars", { wishlistproducts })
})

router.get('/checkout', ensureAuthenticated, async (req, res) => {
    // cartproducts = (await Cart.findOne({where: {id:req.user.id}, include: Product, nested: true}))
    cart = (await Cart.findOne({ where: { id: req.user.id } }))
    var carttotal = cart.cartTotal
    res.render("multistep-form.handlebars", { carttotal })
})

router.get('/otherSupport', (req, res) => {
    res.render("qnaPages/otherSupport.handlebars")
})

router.get('/gettingStarted', (req, res) => {
    res.render("qnaPages/gettingStarted.handlebars")
})

router.get('/myAccountQNA', (req, res) => {
    res.render("qnaPages/myAccountQNA.handlebars")
})

router.get('/payment&shippingQNA', (req, res) => {
    res.render("qnaPages/payment&shippingQNA.handlebars")
})
router.get('/troubleshootingQNA', (req, res) => {
    res.render("qnaPages/troubleshootingQNA.handlebars")
})

router.get('/rewards&offersQNA', (req, res) => {
    res.render("qnaPages/rewards&offersQNA.handlebars")
})

router.get('/multistep', (req, res) => {
    res.render("multistep-form.handlebars")
})


router.get('/messages', ensureAuthenticated, async function (req, res) {
    message = (await Message.findAll({ where: { ownerID: req.user.id } }))

    res.render("messages.handlebars", { message })
})

router.get('/deletemessages', ensureAuthenticated, async function (req, res) {
    message = (await Message.findAll({ where: { ownerID: req.user.id } }))

    res.render("deleteMessages.handlebars", { message })
})

router.post('/deletemessages', ensureAuthenticated, async function (req, res) {
    let { messageID } = req.body;
    if (messageID != null) {
        deletedMessage = req.body.messageID
        Message.destroy({ where: { id: messageID } })
        flashMessage(res, 'success', "Message Deleted");
        User.update({ MessagesCount: req.user.MessagesCount - 1 }, { where: { id: req.user.id } })
    } else {
        flashMessage(res, 'danger', "Please Select a Message to Delete");
    }

    res.redirect("/deletemessages")

})
router.get('/feedback', ensureAuthenticated, (req, res) => {
    res.render("feedback.handlebars")
})
router.get('/tickets', ensureAuthenticated, (req, res) => {
    res.render("ticket.handlebars")
})

router.post('/tickets', ensureAuthenticated, async function (req, res) {
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

    let { title, urgency, description, posterURL } = req.body;
    try {
        await Ticket.create({
            title: req.body.title,
            urgency: req.body.urgency,
            description: req.body.description,
            pendingStatus: "Pending",
            dateAdded: year + "-" + month + "-" + date + " " + hours + ":" + minutes + ":" + seconds,
            posterURL: req.body.posterURL,
            owner: req.user.name,
            ownerID: req.user.id

        });
        flashMessage(res, "success", 'Ticket Sent Successfully');
        res.redirect("/tickets")
    } catch (e) {
        console.log(e)
        res.redirect("/tickets")
    }
})

router.get('/livechat', async (req, res) => {
    res.render(`support/livechat`)
})

router.get('/livechat/generate', async (req, res) => {
    let chatId = Nanoid.nanoid()
    res.json({chatId})
})

router.get('/CommunityFAQPage', async (req, res) => {
    comments = (await FAQ.findAll()).map((x) => x.dataValues)
    res.render("qnaPages/communityFAQpage.handlebars", { comments })
})
router.get('/CommunityFAQPage/ViewComments', ensureAuthenticated, async (req, res) => {

    comments = (await FAQ.findAll({ where: { ownerID: req.user.id } }))
    res.render("qnaPages/ViewComments.handlebars", { comments })
})

router.post('/addComment', ensureAuthenticated, async function (req, res) {
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
    let { title, description } = req.body;
    try {
        await FAQ.create({
            title: req.body.title,
            description: req.body.description,
            likes: 0,
            dateAdded: year + "-" + month + "-" + date + " " + hours + ":" + minutes + ":" + seconds,
            owner: req.user.name,
            ownerID: req.user.id

        });
        flashMessage(res, "success", 'Comment Created Successfully');
        res.redirect("/CommunityFAQPage")
    } catch (e) {
        console.log(e)
        res.redirect("/CommunityFAQPage")
    }
})

router.post('/deleteComment', async (req, res) => {
    let { commentID } = req.body;

    deletedcomment = req.body.commentID
    FAQ.destroy({ where: { id: commentID } })
    flashMessage(res, 'success', "Comment Deleted Successfully!");
    res.redirect("/CommunityFAQPage/ViewComments")
})
router.post('/editComment', async (req, res) => {
    let { title, description, commentID } = req.body;

    FAQ.update({ title: title, description: description }, { where: { id: commentID } })

    flashMessage(res, 'success', "Comment Edited Successfully!");
    res.redirect("/CommunityFAQPage/ViewComments")
})
router.post('/upload', ensureAuthenticated, (req, res) => {
    // Creates user id directory for upload if not exist
    if (!fs.existsSync('./public/uploads/' + req.user.id)) {
        fs.mkdirSync('./public/uploads/' + req.user.id, { recursive: true });
    }

    upload(req, res, (err) => {
        if (err) {
            // e.g. File too large
            res.json({ file: '/images/defaultImage.png', err: err });
        }
        else if (req.file == undefined) {
            res.json({ file: '/images/defaultImage.png', err: 'No file selected' });

        } else {
            res.json({ file: `/uploads/${req.user.id}/${req.file.filename}` });
        }
    });
});

router.post('/feedback', ensureAuthenticated, async function (req, res) {
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

    let { title, favouriteThing, leastFavouriteThing, description, remarks, rating } = req.body;
    try {
        await Feedback.create({
            title: req.body.title,
            favouriteThing: req.body.favouriteThing,
            leastFavouriteThing: req.body.leastFavouriteThing,
            description: req.body.description,
            remarks: req.body.remarks,
            rating: req.body.rating,
            dateAdded: year + "-" + month + "-" + date + " " + hours + ":" + minutes + ":" + seconds,
            owner: req.user.name,
            ownerID: req.user.id

        });
        flashMessage(res, "success", 'Feedback Sent Successfully');
        res.redirect("/feedback")
    } catch (e) {
        console.log(e)
        res.redirect("/feedback")
    }
})


router.get('/ticketHistory', ensureAuthenticated, async function (req, res) {
    tickets = (await Ticket.findAll({ where: { ownerID: req.user.id } }))
    res.render("TicketHistory", { tickets })
})

router.post('/ticketHistory/deleteTicket', async (req, res) => {
    let { ticketID } = req.body;

    deletedTicket = req.body.ticketID
    Ticket.destroy({ where: { id: ticketID } })
    flashMessage(res, 'success', "Ticket Deleted Successfully! ID: " + ticketID);
    res.redirect("/ticketHistory")
})

router.post('/ticketHistory/editTicket', async (req, res) => {
    let { ticketID, title, description, urgency, posterURL } = req.body;


    Ticket.update({ title: title, description: description, urgency: urgency, posterURL: posterURL }, { where: { id: ticketID } })
    flashMessage(res, 'success', "Ticket Edited Successfully! ID: " + ticketID);
    res.redirect("/ticketHistory")
})

router.get('/discover', async (req, res) => {
    vouchers = (await Reward.findAll()).map((x) => x.dataValues)
    res.render('rewards/discover', { vouchers });
});

router.get('/newsLetter', async (req, res) => {

    res.render("newsLetter.handlebars");
});

router.post('/newsLetter', ensureAuthenticated, async (req, res) => {
    email = req.user.email
    console.log(email)
    link = "http://localhost:5000/newsLetter"

    Mail.send(res, {
        to: email,
        subject: "Threads in Times Subcription to News Letter",
        text: "Thank you for subscribing to our news letter",
        template: `../views/MailTemplates/NewsLetter`,
        context: { link },
        html: `<div class="page">
        <div class="container">
          <div class="email_header">
            
            <img class="logo" src="https://raw.githubusercontent.com/PMerilo/ThreadsInNode/master/public/images/logo.png" alt="Threads In Times" />
            <h1>Email Confirmation</h1>
          </div>
          <div class="email_body">
            <p><b>Hi ,</b></p>
            <p>Thanks for subscribing to the <b>Threads In Times Newsletter!</b></p>
            
            </a>
            <p>Thanks for supporting,<br/>
              <b>The Threads in Times Team</b>
            </p>
          </div>
          <div class="email_footer">© Threads in Times 2020</div>
        </div>
      </div>`,



    });
    console.log("Mail sent")

    flashMessage(res, 'success', "Thank you for subscribing to our newsletter! Check for an email from us soon!");
    User.update({ newsLetter: true }, { where: { id: req.user.id } })
    res.redirect("/newsLetter");
});
router.post('/newsLetterUnSubscribe', ensureAuthenticated, async (req, res) => {
    email = req.user.email
    console.log(email)
    link = "http://localhost:5000/newsLetter"

    Mail.send(res, {
        to: email,
        subject: "Threads in Times Unsubcription to News Letter",
        text: "Thank you for subscribing to our news letter",
        template: `../views/MailTemplates/NewsLetter`,
        context: { link },
        html: `<div class="page">
        <div class="container">
          <div class="email_header">
            
            <img class="logo" src="https://raw.githubusercontent.com/PMerilo/ThreadsInNode/master/public/images/logo.png" alt="Threads In Times" />
            <h1>Email Confirmation</h1>
          </div>
          <div class="email_body">
            <p><b>Hi ,</b></p>
            <p>You have unsubscribed from the <b>Threads In Times Newsletter</b></p>
            
            </a>
            <p>Be sure to check us out again sometime soon to get the latest threads out there, goodbye for now.<br/>
              <b>The Threads in Times Team</b>
            </p>
          </div>
          <div class="email_footer">© Threads in Times 2020</div>
        </div>
      </div>`,



    });
    console.log("Mail sent")

    flashMessage(res, 'success', "You have unsubscribed to our newsletter! Come checkback sometime soon!");
    User.update({ newsLetter: false }, { where: { id: req.user.id } })
    res.redirect("/newsLetter");
});

router.post("/createnotification", async (req, res) => {
    let { title, body, url, sender, recipient } = req.body;
    let notification = await Notification.create({
        title: title,
        body: body,
        url: url,
        senderId: sender
    })
    if (!isNaN(recipient)) {
        let user = await User.findByPk(recipient)
        notification.addUser(user)
    } else if (recipient == "tailors") {
        let users = await User.findAll({include: {model: Tailor, required: true}})
        users.forEach(async user => {
            await notification.addUser(user)
        });
    }

    // return res.json(notification)
})

module.exports = router;

