const express = require('express');
const router = express.Router();
const flashMessage = require('../views/helpers/messenger');
const sequelizeUser = require("../config/DBConfig");
const { serializeUser } = require('passport');
const bcrypt = require('bcryptjs');
const sequelize = require('sequelize');
const Nanoid = require('nanoid');
const { Op } = require('sequelize')
//Our Models
const User = require("../models/User")
const Ticket = require("../models/Ticket")
const Feedback = require("../models/Feedback")
const Product = require("../models/Product")
const ProductReview = require("../models/ProductReview")
const Reward = require('../models/Reward')
const Wishlist = require('../models/Wishlist')
const Message = require("../models/Messages")
const CartProduct = require("../models/CartProduct")
const Review = require("../models/Reviews")
const Appointment = require("../models/Appointment")
const FAQ = require("../models/FAQ")
const { v4: uuidv4 } = require('uuid');
const TempUser = require("../models/TempUser");
const Survey = require("../models/Survey")

const NewsLetterLog = require("../models/Logs/NewsLetterLogs")
const JoinedUsersLogs = require("../models/Logs/JoinedUsersLogs")
const CustomerSatisfactionLog = require("../models/Logs/CustomerSatisfactionLog")
//Ensures User is autenticated before accessing
//page
const ensureAuthenticated = require("../views/helpers/auth");
const bodyParser = require('body-parser');
const moment = require("moment");
// Required for file upload const 
fs = require('fs');
const upload = require('../views/helpers/imageUpload');
const console = require('console');
const stripeSecretKey = process.env.STRIPE_SECRET_KEY
const stripePublicKey = process.env.STRIPE_PUBLIC_KEY
const endpointSecret = process.env.WEBHOOK_SECRET;
const SERVER_URL = process.env.SERVER_URL
const stripe = require("stripe")(stripeSecretKey)
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
const Chat = require('../models/Chat');
const mail = require('../config/NewMailConfig')

// for forgetpassword
otp = 'placeholder'
otp2 = 'disallowpwchange'
emailvariable = 'placeholder'

// router.use((req, res, next) => {
//     res.locals.path = req.baseUrl;
//     // console.log(req.baseUrl);
//Checks url for normal users and admin
//     next();
// });

router.get('/', async (req, res) => {
    let noProduct;
    var products = await Product.findAll({ where: { quantity: { [Op.gte]: 1 } } })
    if (await Product.count() == 0) {
        noProduct = true;
    }

    var top10Products = await Product.findAll({ limit: 10, order: [['sold', 'DESC'], ['sales', 'DESC']], where: { quantity: { [Op.gte]: 1 } } })
    const io = req.app.get('io')
    io.emit('test', 'from main')
    res.render("index", { products, top10Products, noProduct })
})

router.get('/searchedItem=:string', async (req, res) => {
    let noProduct;
    let sort = req.params.sort;
    Allproducts = (await Product.findAll())
    products = []
    for (let i = 0; i < Allproducts.length; i++) {
        if (Allproducts[i].dataValues.name.includes(req.params.string)) {
            products.push(Allproducts[i].dataValues)
        }
    }



    res.render("index", { products })
})

router.get('/category=:string', async (req, res) => {
    let products = (await Product.findAll({ where: { category: req.params.string } })).map((x) => x.dataValues)


    res.render("index", { products })
})

router.get('/sort=:sort', async (req, res) => {
    let sort = req.params.sort;
    if (sort == "allTypes") {
        products = (await Product.findAll()).map((x) => x.dataValues)
    } else if (sort == "Alphabetically") {
        products = (await Product.findAll({ order: [['name', 'ASC']] })).map((x) => x.dataValues)
    } else if (sort == "Price") {
        products = (await Product.findAll({ order: [['price', 'ASC']] })).map((x) => x.dataValues)
    } else if (sort == "MostPopular") {
        products = (await Product.findAll({ order: [['wishlistcount', 'DESC']] })).map((x) => x.dataValues)
    }

    res.render("index", { products })
})



router.post('/search', async (req, res) => {


    let search = req.body.search;

    res.redirect("/searchedItem=" + search)
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
    }
    if (parseInt(product.quantity) == 0) {
        await CartProduct.destroy({ where: { cartId: req.user.id, productSku: sku } })
        flashMessage(res, 'error', product.name + 'is out of stock!')
    } else {
        CartProduct.update({ qtyPurchased: quantity }, { where: { cartId: req.user.id, productSku: sku } })
    }
})

router.post('/deleteitem/:sku', ensureAuthenticated, async (req, res) => {
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
    if (discountcodeused != "") {
        var discountcodeinDB = await Reward.findOne({ where: { voucher_code: discountcodeused } })
    }
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
    checkProductinWishlist = await Wishlist.findOne({ where: { id: req.user.id + sku } })
    product = await Product.findOne({ where: { sku: sku } })

    if (status == "check") {
        if (checkProductinWishlist) {
            res.send({ response: "add", status: "check" })
            console.log(sku, status, "add")
        } else {
            res.send({ response: "remove", status: "check" })
            console.log(sku, status, "remove")
        }
    } else if (status == "add/remove") {

        try {
            if (checkProductinWishlist) {
                await Wishlist.destroy({ where: { id: req.user.id + sku } })
                var newwishlistcount = product.wishlistcount - 1
                console.log(newwishlistcount)
                console.log(product.wishlistcount)
                await Product.update({ wishlistcount: newwishlistcount }, { where: { sku: sku } })
                console.log('Item removed')
                res.send({ response: "remove", status: "add/remove" })
            } else {

                await Wishlist.create({
                    id: req.user.id + sku,
                    Owner: req.user.name,
                    OwnerID: req.user.id,
                    productSku: sku
                });
                var newwishlistcount = product.wishlistcount + 1
                console.log(newwishlistcount)
                console.log(product.wishlistcount)
                await Product.update({ wishlistcount: newwishlistcount }, { where: { sku: sku } })
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
const fulfillOrder = async (session) => {
    // let io = req.app.get("io")
    var id = session.metadata.userId
    var shipping_rate = parseInt(session.total_details.amount_shipping)
    console.log(shipping_rate)
    var shipping_type = "Free Shipping";

    var cartproducts = await Cart.findOne({ where: { id: id }, include: { model: Product } })

    var order = await Order.create({
        orderUUID: ("#" + uuidv4().slice(-12)).toUpperCase(),
        orderOwnerID: id,
        orderOwnerName: session.metadata.orderOwnerName,
        orderTotal: session.amount_subtotal / 100,
        discountcodeused: session.metadata.discountcodeused,
        address: session.metadata.address,
        unit_number: session.metadata.unit_number,
        postal_code: session.metadata.postal_code,
        email: session.metadata.email,
        phone_number: session.metadata.phone_number,
        userId: id
    })

    // console.log(JSON.stringify(cartproducts))
    cartproducts.products.forEach(async element => {

        if (shipping_rate != 0) {
            shipping_type = "Express Shipping"
            shipping_rate = 1.99
        } else {
            shipping_rate = 0
        }
        var seller = await User.findByPk(parseInt(element.OwnerID))
        var total_bal = seller.total_balance
        var total_balance = ((((element.cartproduct.qtyPurchased * element.price)) * 0.83) + (shipping_rate)).toFixed(2)
        console.log(total_bal)
        console.log(total_balance)
        console.log(shipping_rate)
        await OrderItems.create({
            orderId: order.id,
            productSku: element.sku,
            qtyPurchased: element.cartproduct.qtyPurchased,
            product_name: element.name,
            product_price: element.price,
            shipping_rate: shipping_rate,
            shipping_type: shipping_type,
            seller_cut: ((((element.cartproduct.qtyPurchased * element.price)) * 0.83) + (shipping_rate)).toFixed(2),
            tit_cut: ((element.cartproduct.qtyPurchased * element.price) * 0.17).toFixed(2),
            seller_name: element.Owner,
            seller_id: element.OwnerID,
            orderStatus: "Processing",
            posterURL: element.posterURL,
            review: 0
        })
        // shipping_rate = 0
        // var payload = {title : "New Order Placed",body: "body",url: "",senderId: "",recipient: `${element.OwnerID}`}
        // let user = await User.findByPk(element.OwnerID)
        // let notification = await Notification.create({
        //     title: payload.title,
        //     body: payload.body,
        //     url: payload.url,
        //     senderId: payload.sender
        // })
        // await notification.addUser(user)
        // io.to(`User ${element.OwnerID}`).emit("default", notification)
        // var sold = element.sold + element.cartproduct.qtyPurchased
        // var sales = element.sales + (element.cartproduct.qtyPurchased*element.price)
        // var qty = element.quantity - element.cartproduct.qtyPurchased
        await User.increment({ total_balance: total_balance }, { where: { id: element.OwnerID } })
        await Product.update({ quantity: element.quantity - element.cartproduct.qtyPurchased, sold: element.sold + element.cartproduct.qtyPurchased, sales: element.sales + (element.cartproduct.qtyPurchased * element.price) }, { where: { sku: element.sku } })
    });
    var discountcode = await Reward.findOne({ where: { voucher_code: cartproducts.discountcodeused } })
    var user = await User.findByPk(id)
    User.update({ spools: user.spools + order.orderTotal }, { where: { id: id } })
    if (discountcode) {
        await User.update({ spools: user.spools - discountcode.spools_needed }, { where: { id: id } })
        await Reward.update({ quantity: discountcode.quantity - 1 }, { where: { voucher_code: cartproducts.discountcodeused } })
    }
    await Cart.destroy({ where: { id: id } })
    console.log("Order created")
    // console.log("Fulfilling order", session);
};


router.post('/webhook', bodyParser.raw({ type: 'application/json' }), async (req, res) => {
    const payload = req.body;
    const sig = req.headers['stripe-signature'];
    let event;
    try {
        event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
    } catch (err) {
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    if (event.type === 'checkout.session.completed') {
        const session = event.data.object;
        if (session.metadata.request_type == "Checkout_Payment") {
            fulfillOrder(session)
        }
    }
    res.status(200);
});


router.post('/checkout', ensureAuthenticated, async (req, res) => {
    var cartproducts = await Cart.findOne({ where: { id: req.user.id }, include: { model: Product } })
    var couponused = await Reward.findOne({ where: { voucher_code: cartproducts.discountcodeused } })
    var shipping = cartproducts.products.length * 199
    var delimiter = 100
    if (couponused) {
        delimiter = 100 - couponused.discount_amount
    }
    var cart = await Cart.findOne({ where: { id: req.user.id } })
    try {
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ["card"],
            mode: "payment",
            shipping_options: [
                {
                    shipping_rate_data: {
                        type: 'fixed_amount',
                        fixed_amount: {
                            amount: 0,
                            currency: 'sgd',
                        },
                        display_name: 'Free shipping',
                        delivery_estimate: {
                            minimum: {
                                unit: 'business_day',
                                value: 7,
                            },
                            maximum: {
                                unit: 'business_day',
                                value: 9,
                            },
                        }
                    }
                },
                {
                    shipping_rate_data: {
                        type: 'fixed_amount',
                        fixed_amount: {
                            amount: shipping,
                            currency: 'sgd',
                        },
                        display_name: 'Express Shipping',
                        delivery_estimate: {
                            minimum: {
                                unit: 'business_day',
                                value: 2,
                            },
                            maximum: {
                                unit: 'business_day',
                                value: 3,
                            },
                        }
                    }
                },
            ],
            line_items: cartproducts.products.map(item => {
                return {
                    price_data: {
                        currency: "sgd",
                        product_data: {
                            name: item.name,
                        },
                        unit_amount: item.price * delimiter,
                    },
                    quantity: item.cartproduct.qtyPurchased,
                }
            }),
            metadata: {
                userId: `${req.user.id}`,
                orderOwnerName: `${req.body.fname}`,
                discountcodeused: `${cart.discountcodeused}`,
                address: `${req.body.address}`,
                unit_number: `${req.body.unit_number}`,
                postal_code: `${req.body.postal_code}`,
                email: `${req.body.email}`,
                phone_number: `${req.body.phone}`,
                ship : "199",
                request_type: "Checkout_Payment"
            },
            success_url: `http://localhost:5000/checkout/success`,
            cancel_url: `http://localhost:5000/checkout`,
        })
        res.json({ url: session.url })
    } catch (e) {
        console.log(e.message)
        res.status(500).json({ error: e.message })
    }
})

router.post('/tailorCheckout', ensureAuthenticated, async (req, res) => {
    let { reqId } = req.body
    var request = await Request.findByPk(reqId, { include: [RequestItems, "user"] })
    // try {
    //     const session = await stripe.checkout.sessions.create({
    //         payment_method_types: ["card"],
    //         mode: "payment",
    //         shipping_address_collection: {
    //             allowed_countries: ['SG'],
    //         },
    //         shipping_options: [
    //             {
    //                 shipping_rate_data: {
    //                     type: 'fixed_amount',
    //                     fixed_amount: {
    //                         amount: 0,
    //                         currency: 'sgd',
    //                     },
    //                     display_name: 'Free shipping',
    //                     delivery_estimate: {
    //                         minimum: {
    //                             unit: 'business_day',
    //                             value: 7,
    //                         },
    //                         maximum: {
    //                             unit: 'business_day',
    //                             value: 9,
    //                         },
    //                     }
    //                 }
    //             },
    //             {
    //                 shipping_rate_data: {
    //                     type: 'fixed_amount',
    //                     fixed_amount: {
    //                         amount: 1000,
    //                         currency: 'sgd',
    //                     },
    //                     display_name: 'Express Shipping',
    //                     delivery_estimate: {
    //                         minimum: {
    //                             unit: 'business_day',
    //                             value: 2,
    //                         },
    //                         maximum: {
    //                             unit: 'business_day',
    //                             value: 3,
    //                         },
    //                     }
    //                 }
    //             },
    //         ],
    //         line_items: cartproducts.products.map(item => {
    //             return {
    //                 price_data: {
    //                     currency: "sgd",
    //                     product_data: {
    //                         name: item.name,
    //                     },
    //                     unit_amount: item.price * delimiter,
    //                 },
    //                 quantity: item.cartproduct.qtyPurchased,
    //             }
    //         }),
    //         metadata: {
    //             userId: `${req.user.id}`,
    //             orderOwnerName: `${req.body.fname}`,
    //             email: `${req.body.email}`,
    //             phone_number: `${req.body.phone}`,
    //             request_type: "Tailoring_Payment"
    //         },
    //         success_url: `http://localhost:5000/checkout/success`,
    //         cancel_url: `http://localhost:5000/checkout`,
    //     })
    //     res.json({ url: session.url })
    // } catch (e) {
    //     console.log(e.message)
    //     res.status(500).json({ error: e.message })
    // }
})

router.post('/checkoutsave', ensureAuthenticated, async (req, res) => {
    var subtotal = req.body.subtotal
    var discountcode = req.body.discount_code
    await Cart.update({ cartTotal: subtotal, discountcodeused: discountcode }, { where: { id: req.user.id } })
})

router.post("/confirmDelivery", ensureAuthenticated, async (req, res) => {
    console.log(req.body.id)
    await OrderItems.update({ orderStatus: "Delivery Confirmed" }, {
        where: {
            id: req.body.id
        }
    })
    var order = await OrderItems.findOne({ where: { id: req.body.id } })
    console.log(order.orderId)
    res.redirect(`/orderdetails/${order.orderId}`)
})

router.post("/submitProductReview", ensureAuthenticated, async (req, res) => {
    product = await Product.findByPk(req.body.sku)

    await Review.create({
        title: req.body.title,
        description: req.body.review,
        stars: req.body.star,
        userId: req.user.id,
        productSku: req.body.sku,
        sellerId: product.OwnerID,
    })

    await Product.update({ stars_given: product.stars_given + parseInt(req.body.star), reviews_given: product.reviews_given + 1 }, { where: { sku: req.body.sku } })

    await OrderItems.update({ review: 1 }, { where: { id: req.body.id } })

    res.redirect(`/`)
})

router.post("/reviewUpdate", ensureAuthenticated, async (req, res) => {
    var sku = req.body.sku
    var product = await Product.findByPk(sku)
    var starsAvg = product.stars_given / product.reviews_given
    var roundedAvg = Math.round(starsAvg / 0.5) * 0.5
    var fivecount = await Review.count({ where: { stars: 5, productSku: sku } })
    var fourcount = await Review.count({ where: { stars: 4, productSku: sku } })
    var threecount = await Review.count({ where: { stars: 3, productSku: sku } })
    var twocount = await Review.count({ where: { stars: 2, productSku: sku } })
    var onecount = await Review.count({ where: { stars: 1, productSku: sku } })
    if (req.body.status == "details") {
        res.send({ starAvg: starsAvg, roundedAvg: roundedAvg, one: onecount, two: twocount, three: threecount, four: fourcount, five: fivecount })
    } else if (req.body.status == "modal") {
        res.send({ starAvg: starsAvg, roundedAvg: roundedAvg })
    }
})


router.get('/reviews/:sku', ensureAuthenticated, async (req, res) => {
    var sku = req.params.sku
    var reviews = await Review.findAll({ where: { productSku: sku }, include: { model: User } })
    var product = await Product.findByPk(sku)
    var starsAvg = product.stars_given / product.reviews_given
    starsAvg = starsAvg.toFixed(2)
    var roundedAvg = Math.round(starsAvg / 0.5) * 0.5
    res.render("reviews.handlebars", { reviews, product, starsAvg, roundedAvg })
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
router.get('/checkout/success', ensureAuthenticated, (req, res) => {
    res.render("success.handlebars")
});

router.get('/changePassword', ensureAuthenticated, (req, res) => {
    res.render("userEditPassword.handlebars")
})

router.get('/myOrders', ensureAuthenticated, async (req, res) => {
    orders = (await Order.findAll({
        where: { orderOwnerID: req.user.id }, order: [
            ['createdAt', 'DESC'],
            ['id', 'ASC']
        ]
    }))
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
    wishlistproducts = (await Wishlist.findAll({
        where: { OwnerID: req.user.id }, include: Product, order: [
            ['createdAt', 'DESC'],
            ['id', 'ASC']
        ]
    }))
    res.render("wishlist.handlebars", { wishlistproducts })
})

router.get('/checkout', ensureAuthenticated, async (req, res) => {
    cart = await Cart.findOne({ where: { id: req.user.id } })
    res.render("checkout.handlebars", { cart })
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
    currentMessageCount = await Message.count({ where: { ownerID: req.user.id } })
    User.update({ MessagesCount: currentMessageCount }, { where: { id: req.user.id } })
    console.log(currentMessageCount)
    res.render("messages.handlebars", { message })
})

router.get('/deletemessages', ensureAuthenticated, async function (req, res) {
    message = (await Message.findAll({ where: { ownerID: req.user.id } }))
    currentMessageCount = await Message.count({ where: { ownerID: req.user.id } })
    User.update({ MessagesCount: currentMessageCount }, { where: { id: req.user.id } })
    console.log(currentMessageCount)
    res.render("deleteMessages.handlebars", { message })
})

router.post('/deletemessages', ensureAuthenticated, async function (req, res) {
    let { messageID } = req.body;
    if (messageID != null) {
        deletedMessage = req.body.messageID
        Message.destroy({ where: { id: messageID } })
        flashMessage(res, 'success', "Message Deleted");
        currentMessageCount = await Message.count({ where: { ownerID: req.user.id } })
        console.log(currentMessageCount)
        console.log("Check deleted count here")
        User.update({ MessagesCount: currentMessageCount - 1 }, { where: { id: req.user.id } })
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
    let chatId;
    while (true) {
        chatId = Nanoid.nanoid()
        let chat = await Chat.findOne({ where: { liveId: chatId, livechat: true } })
        if (chat === null) {
            break
        }
    }
    res.json({ chatId })
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

router.get('/Survey', ensureAuthenticated, async (req, res) => {

    res.render("Survey")
})

router.post('/Survey', ensureAuthenticated, async (req, res) => {
    let { age, occupation, recommend, features, design, customerSupport, userCustomisation } = req.body;
    if (features == undefined) {
        features = 0
    }
    if (design == undefined) {
        design = 0
    }
    if (customerSupport == undefined) {
        customerSupport = 0
    }
    if (userCustomisation == undefined) {
        userCustomisation = 0
    }


    await Survey.create({
        age: age,
        occupation: occupation,
        recommend: recommend,
        Features: features,
        design: design,
        customerSupport: customerSupport,
        userCustomisation: userCustomisation,
    })
    flashMessage(res, "success", 'Survey Submitted Successfully. Thanks for your feedback.');


    res.redirect("/Survey")
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
            img = "/uploads/" + req.user.id + "/" + req.file.filename
            User.update({ profilepic: img }, { where: { id: req.user.id } })
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

        await CustomerSatisfactionLog.create({
            date: moment().format('L'),
            rating: req.body.rating,
            description: req.body.description,
            remarks: req.body.remarks,
        })
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
    vouchers = await Reward.findAll({ where: { expiry_date: { [Op.gte]: moment(new Date()).format("YYYY-MM-DD") } } })
    res.render('rewards/discover', { vouchers });
});

router.get('/newsLetter', async (req, res) => {

    res.render("newsLetter.handlebars");
});

router.post('/newsLetter', ensureAuthenticated, async (req, res) => {
    email = req.user.email
    console.log(email)
    link = "http://localhost:5000/newsLetter"

    // Mail.send(res, {
    //     to: email,
    //     subject: "Threads in Times Subcription to News Letter",
    //     text: "Thank you for subscribing to our news letter",
    //     template: `../views/MailTemplates/NewsLetter`,
    //     context: { link },
    //     html:`<div class="page">
    //     <div class="container">
    //       <div class="email_header">

    //         <img class="logo" src="https://raw.githubusercontent.com/PMerilo/ThreadsInNode/master/public/images/logo.png" alt="Threads In Times" />
    //         <h1>Email Confirmation</h1>
    //       </div>
    //       <div class="email_body">
    //         <p><b>Hi ,</b></p>
    //         <p>Thanks for subscribing to the <b>Threads In Times Newsletter!</b></p>

    //         </a>
    //         <p>Thanks for supporting,<br/>
    //           <b>The Threads in Times Team</b>
    //         </p>
    //       </div>
    //       <div class="email_footer">© Threads in Times 2020</div>
    //     </div>
    //   </div>`,



    //  });
    mail.Send({
        email_recipient: email,
        subject: "Threads in Times Subcription to News Letter",
        template_path: "../views/MailTemplates/NewsLetter.html",
        context: { name: req.user.name },
    });
    console.log("Mail sent")
    await NewsLetterLog.create({
        date: moment().format('L'),
        description: email + " subscribed to the newsletter",
        noOfUsersJoined: 1
    })

    flashMessage(res, 'success', "Thank you for subscribing to our newsletter! Check for an email from us soon!");
    User.update({ newsLetter: true }, { where: { id: req.user.id } })
    res.redirect("/newsLetter");
});
router.post('/newsLetterUnSubscribe', ensureAuthenticated, async (req, res) => {
    email = req.user.email
    console.log(email)
    link = "http://localhost:5000/newsLetter"

    // Mail.send(res, {
    //     to: email,
    //     subject: "Threads in Times Unsubcription to News Letter",
    //     text: "Thank you for subscribing to our news letter",
    //     template: `../views/MailTemplates/NewsLetter`,
    //     context: { link },
    //     html:`<div class="page">
    //     <div class="container">
    //       <div class="email_header">

    //         <img class="logo" src="https://raw.githubusercontent.com/PMerilo/ThreadsInNode/master/public/images/logo.png" alt="Threads In Times" />
    //         <h1>Email Confirmation</h1>
    //       </div>
    //       <div class="email_body">
    //         <p><b>Hi ,</b></p>
    //         <p>You have unsubscribed from the <b>Threads In Times Newsletter</b></p>

    //         </a>
    //         <p>Be sure to check us out again sometime soon to get the latest threads out there, goodbye for now.<br/>
    //           <b>The Threads in Times Team</b>
    //         </p>
    //       </div>
    //       <div class="email_footer">© Threads in Times 2020</div>
    //     </div>
    //   </div>`,



    //  });
    mail.Send({
        email_recipient: email,
        subject: "Threads in Times UnSubcription to News Letter",
        template_path: "../views/MailTemplates/NewsLetterUnSub.html",
        context: { name: req.user.name },
    });


    console.log("Mail sent")

    flashMessage(res, 'success', "You have unsubscribed to our newsletter! Come checkback sometime soon!");
    await NewsLetterLog.create({
        date: moment().format('L'),
        description: email + " unsubscribed to the newsletter",
        noOfUsersJoined: -1
    })
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
        let users = await User.findAll({ include: { model: Tailor, required: true } })
        users.forEach(async user => {
            await notification.addUser(user)
        });
    }

    // return res.json(notification)
})


module.exports = router;

