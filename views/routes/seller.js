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

router.get('/sellerProfile', (req, res) => {
    res.render('seller/sellerProfile');
});

router.get('/manageProducts', async (req, res) => {
    
    products = await Product.findAll({where:{ownerID:req.user.id}})
    res.render('seller/viewProducts',{products});
});



router.get('/addProduct',ensureAuthenticated, (req,res) => {
    res.render("seller/addProduct")
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
            category: req.body.category,
            Owner:req.user.name,
            OwnerID:req.user.id
            
  
          });
          flashMessage(res,"success",name+'Product Added Successfully');
          res.redirect("/seller/addProduct")
    }catch(e){
         console.log(e)
         res.redirect("/seller/addProduct")
    }
})



router.get('/editProduct/:sku',ensureAuthenticated, async (req,res) => {
    
    product = await Product.findOne({where:{sku:req.params.sku}})
    res.render("seller/editProduct",{product})
})


router.post('/editProduct/:sku',ensureAuthenticated, async (req,res) => {
    let{name,category,price,quantity,description} = req.body;
    
    Product.update({
        name:name,
        description:description,
        price:price,
        quantity:quantity,
        category:category
    },{where: {sku:req.params.sku}})
    
    flashMessage(res, 'success', name+ " Edited Successfully!");
    res.redirect("/seller/manageProducts")
    
})

router.post('/deleteProduct',ensureAuthenticated, (req,res) => {
    let {sku, name} = req.body;
    Product.destroy({where:{sku:sku}})
    flashMessage(res, 'success', name+ " Deleted successfully");
    // CartProduct.destroy({where:{sku:sku}})
    res.redirect("/seller/manageProducts")
})

module.exports = router;