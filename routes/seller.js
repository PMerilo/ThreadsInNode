const express = require('express');
const router = express.Router();
const flashMessage = require('../views/helpers/messenger');
const sequelizeUser = require("../config/DBConfig");
const { serializeUser } = require('passport');
const uuid = require('uuid')
//Our Models
const User = require("../models/User")
const Ticket = require("../models/Ticket")
const Feedback = require("../models/Feedback")
const Product = require("../models/Product")
const Message = require("../models/Messages")
const CartProduct = require("../models/CartProduct")
const FAQ = require("../models/FAQ")
const ensureAuthenticated = require("../views/helpers/auth");
const ensureSellerAuthenticated = require("../views/helpers/sellerAuth");
const moment = require("moment");
const Order = require('../models/Orders');
const OrderItems = require('../models/OrderItems');
// Required for file upload const 
fs = require('fs');
const upload = require('../views/helpers/imageUpload');
const Review = require('../models/Reviews');

router.all('/*', ensureSellerAuthenticated, function (req, res, next) {
    req.app.locals.layout = 'seller'; // set your layout here
    next(); // pass control to the next handler
});

router.use((req, res, next) => {
    res.locals.path = req.baseUrl;
    console.log(req.baseUrl);
    //Checks url for normal users and admin
    next();
});

router.get('/', (req, res) => {
    res.render('seller/dashboard');
});

router.get('/reports', (req, res) => {
    res.render('seller/reports');
});

router.get('/dashboard', (req, res) => {
    res.render('seller/dashboard.handlebars');
});

router.get('/sellerProfile', (req, res) => {
    res.render('seller/sellerProfile');
});

router.get('/manageProducts', async (req, res) => {

    products = await Product.findAll({ where: { ownerID: req.user.id } })
    res.render('seller/viewProducts', { products });
});



router.get('/addProduct', (req, res) => {
    res.render("seller/addProduct")
})

router.get('/orders', ensureAuthenticated, async (req, res) => {
    orders = (await OrderItems.findAll({
        where: { seller_name: req.user.name }, include: Order, order: [
            ['createdAt', 'DESC'],
            ['product_name', 'ASC'],
        ],
    }))
    res.render("seller/orders", { orders })
})

router.post("/changeOrderStatus", ensureAuthenticated, async (req, res) => {
    var OrderItem = await OrderItems.findOne({ where: { id: req.body.id } })
    console.log(req.body.status)
    console.log(req.body.id)
    if (OrderItem.orderStatus == "Delivered" && req.body.status != "Delivered" || OrderItem.orderStatus == "Delivery Confirmed") {
        res.send({ message: "Cannot change status of delivered product", status: "error" })
    } else {
        await OrderItems.update({ orderStatus: req.body.status }, {
            where: {
                id: req.body.id
            }
        })
    }
})




router.post('/addProduct', async function (req, res) {
    let { name, description, price, quantity, category, posterURL } = req.body;
    let Uuid = (Math.floor(Date.now() + Math.random())).toString()
    Uuid = parseInt(Uuid.slice(1, 10))
    // let random = Math.floor(Math.random() * 9)
    // let nums = ['0','1','2','3','4','5','6','7','8','9']
    // for (let i= 0; i++; i<length(nums)){
    //     Uuid += nums[random]
    // }
    // console.log(Uuid)
    // Uuid = parseInt(Uuid)
    try {
        await Product.create({
            sku: Uuid,
            name: req.body.name,
            description: req.body.description,
            price: req.body.price,
            quantity: req.body.quantity,
            category: req.body.category,
            wishlistcount: 0,
            sold: 0,
            sales: 0,
            Owner: req.user.name,
            OwnerID: req.user.id,
            posterURL: posterURL,
            reviews_given:0,
            stars_given:0,
        });
        flashMessage(res, "success", name + 'Product Added Successfully');
        res.redirect("/seller/addProduct")
    } catch (e) {
        console.log(e)
        res.redirect("/seller/addProduct")
    }
})



router.get('/editProduct/:sku', async (req, res) => {

    product = await Product.findOne({ where: { sku: req.params.sku } })
    res.render("seller/editProduct", { product })
})

router.get('/reviews', async (req, res) => {
    var reviews = await Review.findAll({ where: { sellerId: req.user.id}, include: {model:User}})

    res.render("seller/reviews", { reviews })
})


router.post('/editProduct/:sku', ensureAuthenticated, async (req, res) => {
    let { name, category, price, quantity, description } = req.body;

    Product.update({
        name: name,
        description: description,
        price: price,
        quantity: quantity,
        category: category
    }, { where: { sku: req.params.sku } })

    flashMessage(res, 'success', name + " Edited Successfully!");
    res.redirect("/seller/manageProducts")

})

router.post('/deleteProduct', ensureAuthenticated, (req, res) => {
    let { sku, name } = req.body;
    Product.destroy({ where: { sku: sku } })
    flashMessage(res, 'success', name + " Deleted successfully");
    // CartProduct.destroy({where:{sku:sku}})
    res.redirect("/seller/manageProducts")
})

module.exports = router;