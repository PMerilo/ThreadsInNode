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
//Ensures User is autenticated before accessing
//page
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



router.get('/', async (req,res) =>{

    products = (await Product.findAll()).map((x)=> x.dataValues)
    
    res.render("index",{products})
})

router.post('/addtoCart',ensureAuthenticated, async (req,res) =>{
    purchasedProduct = await Product.findOne({where:{sku:req.body.sku}})
    if(purchasedProduct.quantity>0){
        
        let { sku,name,description,price,category,qtyPurchased } = req.body;
        newPurchasedProductQTY = purchasedProduct.quantity - req.body.qtyPurchased
        
        checkProductinCart = await CartProduct.findOne({where:{sku:req.body.sku}})
        
        
        try{
            if(checkProductinCart){
                newCartProductQTY = parseInt(checkProductinCart.qtyPurchased) + parseInt(req.body.qtyPurchased)
                console.log(newCartProductQTY)
                CartProduct.update({qtyPurchased: newCartProductQTY},{where:{sku:req.body.sku}} )
            }else{
                await CartProduct.create({
                    sku: req.body.sku,
                    name: req.body.name,
                    description: req.body.description,
                    price: req.body.price,
                    category: req.body.category,
                    totalCost: req.body.qtyPurchased * req.body.price,
                    qtyPurchased: req.body.qtyPurchased,
                    cartOwner: req.user.name,
                    cartOwnerID: req.user.id
                    
                });
            }
            
            flashMessage(res,"success", req.body.name + ' Purchased Successfully');
            res.redirect("/")
        }catch(e){
            console.log(e)
            
            res.redirect("/")
        }
        Product.update({quantity:newPurchasedProductQTY},{where:{sku:req.body.sku}} )
    }else{
        flashMessage(res,"danger", req.body.name + ' is Out of Stock');
        res.redirect("/")
    }
    
    
})

router.get('/RewardsPage', (req,res) => {
    res.render("rewards")
})

router.get('/CustomerService', (req,res) => {
    res.render("customerservice")
})


router.get('/profile',ensureAuthenticated, (req,res) => {
    
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

router.get('/editProfile',ensureAuthenticated, (req,res) => {
    res.render("editProfile.handlebars")
})

router.get('/changePassword',ensureAuthenticated, (req,res) => {
    res.render("userEditPassword.handlebars")
})

router.get('/myOrders',ensureAuthenticated, (req,res) => {
    res.render("myOrders.handlebars")
})

router.get('/shoppingCart', ensureAuthenticated,async (req,res) => {
    cartproducts = (await CartProduct.findAll({where: {cartOwnerID:req.user.id}}))
    res.render("shoppingCart.handlebars",{cartproducts})
})

router.get('/otherSupport', (req,res) => {
    res.render("qnaPages/otherSupport.handlebars")
})

router.get('/gettingStarted', (req,res) => {
    res.render("qnaPages/gettingStarted.handlebars")
})

router.get('/myAccountQNA', (req,res) => {
    res.render("qnaPages/myAccountQNA.handlebars")
})

router.get('/payment&shippingQNA', (req,res) => {
    res.render("qnaPages/payment&shippingQNA.handlebars")
})
router.get('/troubleshootingQNA', (req,res) => {
    res.render("qnaPages/troubleshootingQNA.handlebars")
})

router.get('/rewards&offersQNA', (req,res) => {
    res.render("qnaPages/rewards&offersQNA.handlebars")
})


router.get('/messages',ensureAuthenticated, async function (req,res){
    message = (await Message.findAll({where: {ownerID:req.user.id}}))

    res.render("messages.handlebars",{message})
})

router.get('/deletemessages',ensureAuthenticated, async function (req,res){
    message = (await Message.findAll({where: {ownerID:req.user.id}}))
    
    res.render("deleteMessages.handlebars",{message})
})

router.post('/deletemessages',ensureAuthenticated, async function (req,res){
    let { messageID } = req.body;
    if (messageID!=null){
        deletedMessage = req.body.messageID
        Message.destroy({where: {id:messageID}})
        flashMessage(res, 'success', "Message Deleted");
        User.update({MessagesCount:req.user.MessagesCount-1}, {where:{id:req.user.id}})
    }else{
        flashMessage(res, 'danger', "Please Select a Message to Delete");
    }
    
    res.redirect("/deletemessages")
    
})
router.get('/feedback',ensureAuthenticated, (req,res) => {
    res.render("feedback.handlebars")
})
router.get('/tickets',ensureAuthenticated, (req,res) => {
    res.render("ticket.handlebars")
})

router.post('/tickets',ensureAuthenticated, async function (req,res) {
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

    let { title, urgency, description, posterURL} = req.body;
    try{
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
          flashMessage(res,"success",'Ticket Sent Successfully');
          res.redirect("/tickets")
    }catch(e){
         console.log(e)
         res.redirect("/tickets")
    }
})

router.post('/upload', ensureAuthenticated, (req, res) => {
    // Creates user id directory for upload if not exist
    if (!fs.existsSync('./public/uploads/' + req.user.id)) {
        fs.mkdirSync('./public/uploads/' + req.user.id, { recursive: true });
    }
  
    upload(req, res, (err) => {
        if (err) {
            // e.g. File too large
            res.json({ file: '/img/no-image.jpg', err: err });
        }
        else {
            res.json({ file: `/uploads/${req.user.id}/${req.file.filename}` });
        }
    });
  });

router.post('/feedback',ensureAuthenticated, async function (req,res) {
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

    let { title, favouriteThing,leastFavouriteThing,description,remarks,rating } = req.body;
    try{
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
          flashMessage(res,"success",'Feedback Sent Successfully');
          res.redirect("/feedback")
    }catch(e){
         console.log(e)
         res.redirect("/feedback")
    }
})

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
router.get('/ticketHistory',ensureAuthenticated, async function (req,res){
    tickets = (await Ticket.findAll({where: {ownerID:req.user.id}}))
    res.render("TicketHistory",{tickets})
})

router.post('/ticketHistory/deleteTicket', async (req,res) => { 
    let{ticketID} = req.body;
    
    deletedTicket = req.body.ticketID
    Ticket.destroy({where: {id:ticketID}})
    flashMessage(res, 'success', "Ticket Deleted Successfully! ID: " + ticketID);
    res.redirect("/ticketHistory")
})

module.exports = router;

