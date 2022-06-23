const express = require('express');
const router = express.Router();
const flashMessage = require('../helpers/messenger');
const sequelizeUser = require("../../config/DBConfig");
const { serializeUser } = require('passport');
//Our Models
const User = require("../../models/User")
const Ticket = require("../../models/Ticket")
const Feedback = require("../../models/Feedback")
const Product = require("../../models/Product")
const Message = require("../../models/Messages")
const CartProduct = require("../../models/CartProduct")
const FAQ = require("../../models/FAQ")
const ensureAuthenticated = require("../helpers/auth");
const moment = require("moment");
// Required for file upload const 
fs = require('fs'); 
const upload = require('../helpers/imageUpload');

router.use((req, res, next) => {
    res.locals.path = req.baseUrl;
    console.log(req.baseUrl);
    //Checks url for normal users and admin
    next();
  });

router.get('/', (req, res) => {
    res.render('seller/sellerHomePage');
});



router.get('/addProduct',ensureAuthenticated, (req,res) => {
    res.render("addProduct.handlebars")
})

router.post('/addProduct',ensureAuthenticated, async function (req,res) {
    let { sku,name,description,price,quantity,category } = req.body;
    try{
        await Product.create({
            sku: req.body.sku,
            name: req.body.name,
            description: req.body.description,
            price: req.body.price,
            quantity: req.body.quantity,
            category: req.body.category
            
  
          });
          flashMessage(res,"success",'Product Added Successfully');
          res.redirect("/addProduct")
    }catch(e){
         console.log(e)
         res.redirect("/addProduct")
    }
})


module.exports = router;