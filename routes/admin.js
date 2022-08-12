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
const trafficLogs = require("../models/Logs/JoinedUsersLogs")
const Report = require("../models/Reports")
const newsLetterTrafficLogs = require("../models/Logs/NewsLetterLogs")
const ensureAuthenticated = require("../views/helpers/auth");
const ensureAdminAuthenticated = require("../views/helpers/adminAuth");
const Request = require('../models/Request');
const Tailor = require('../models/Tailor');
const PDFDocument = require('pdfkit');
const UsersJoinedLog = require("../models/Logs/JoinedUsersLogs")
// const blobStream  = require('blob-stream');
// const PDFDocument = require("pdfkit-table");
const fs = require('fs');
const path = require('path');
const moment = require('moment');
const { NONE } = require('sequelize');

const dfd = require("danfojs-node");
const ChartJsImage = require('chartjs-to-image');  

// For mail
const nodemailer = require("nodemailer");
// const { where } = require('sequelize/types');
const Mail = require("../config/MailConfig");
const mail = require("../config/NewMailConfig");

router.all('/*', ensureAdminAuthenticated, function (req, res, next) {
    req.app.locals.layout = 'admin'; // set your layout here
    // check for 404 error


    next(); // pass control to the next handler

});

// router.get('*', (req, res) => {
//     // check for 404 error
//     if
//     res.sendFile(__dirname + '../views/404errorpage.handlebars');
// });


router.get('/', (req, res) => {
    res.render("admin/adminBase")
})

router.get('/profile', (req, res) => {
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
    let { ticketID, ticketTitle, owner, ownerID} = req.body;

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
    ticket = await Ticket.findOne({ where: { id: req.body.ticketID } })
    if(ticket.pendingStatus == "Pending"){
        
    
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
    }else{
        Ticket.destroy({ where: { id: ticketID } })
    }
    



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
    Ticket.update({ pendingStatus:urgency }, { where: { id: ticketID } })
    
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

router.get("/NewsLetterSendMail", ensureAdminAuthenticated, async (req, res) => {
    
    res.render("admin/NewsLetterSendMail")
})

router.post("/NewsLetterSendMail", ensureAdminAuthenticated, async (req, res) => {
    let { subject, message,posterURL } = req.body;
    let users = await User.findAll({where: {newsLetter: true}});
    console.log(message)
    console.log(posterURL)
    // let Path = path.join(__dirname,  posterURL)
    
    users.forEach(element => {
        let email = element.email;
        console.log(email)
        
        // Mail.send(res, {
        //     to: email,
        //     subject: subject,
            
            
        //     html:`
            
            
        //     <div class="page">
        //     <div class="container">
        //       <div class="email_header">
                
        //         <img class="logo" src="https://raw.githubusercontent.com/PMerilo/ThreadsInNode/master/public/images/logo.png" alt="Threads In Times" />
                
        //       </div>

              
        //       <div class="email_body">
        //         <p><b>Hi , ${element.name}</b></p>
        //         ${message}
                
        //         </a>
        //         <p>Thanks for supporting,<br/>
        //           <b>The Threads in Times Team</b>
        //         </p>
        //       </div>
        //       <div class="email_footer">© Threads in Times 2020</div>
        //       <b>You Received this email because you subscribed to the threads in times newsletter</b>
        //     </div>
        //   </div>`,
            
        console.log("Test")
        
        
        let Path = path.join(process.cwd() ,"/public",posterURL)
        // let Path = path.join("../public",posterURL)
        console.log(posterURL)
        console.log(Path)
        console.log("end of test")
        console.log(posterURL.slice(posterURL.lastIndexOf("/") + 1))
        //  });
        mail.Send({
            email_recipient: email,
            subject: subject,
            template_path: "../views/MailTemplates/NewsLetterMail.html",
            context: {name: element.name, message: message,subject: subject},
            filename: posterURL.slice(posterURL.lastIndexOf("/") + 1),
            path: Path
            
        });
         
         
         console.log("Mail sent")
    });
    
    flashMessage(res, 'success', "News Letter Sent Successfully!");

    res.redirect("/admin/NewsLetterSendMail")
})


router.get("/ReportsManagement", ensureAdminAuthenticated, async (req, res) => {
    totalUsers = await User.count()
    totalSubs = await User.count( {where:{newsLetter:true}} )
    traffic = await trafficLogs.findAll()
    newsLetterTraffic = await newsLetterTrafficLogs.findAll()
    res.render("admin/ReportManagement", { totalUsers,totalSubs,traffic,newsLetterTraffic })
})



router.post("/DownloadReports", ensureAdminAuthenticated, async (req, res) => {
    
    let { reportName,reportDescription,additionalTags,userTraffic,subscriptionTraffic,TrafficLogs,userRoles,userGenders,startDate,endDate} = req.body;
    var pdfDoc = new PDFDocument ({ bufferPages: true, font: 'Courier' });
    let Path = path.join(__dirname, '../public/images/logo.png')
    let WavePath = path.join(__dirname, '../public/images/Letterhead.png')
    let PathUsersJoinedChart;
    let PathUsersSubscribedChart;
    let UserRolesPieChartPath;
    let UserGendersPieChartPath;
    // let Canvas;
    // function canvasURL(id) {
    //     let canvas = document.getElementById(id);
    //     return canvas.toDataURL(1.0);
    // }
    if(startDate!=undefined && endDate!=undefined){
        let cols = ["Dates","NoOfUsersJoined"];
        let data = [];
        const usersJoined = await UsersJoinedLog.findAll({where: {role:"C"}});
        usersJoined.forEach(element => {
            let rawData = [element.date, element.noOfUsersJoined];
            data.push(rawData)
        
          });

        // Set Day Data
        dfDay = new dfd.DataFrame(data,{columns:cols})
        group_dfDay = dfDay.groupby(["Dates"]).sum()
        const df2 = dfd.toJSON(group_dfDay,{format:"json"})

        var NoOfUsers_day = [];
        var dates_day = [];
        console.log(df2)
        df2.forEach((element) => {
            
            var strToStartDate = new Date(startDate).toISOString();
            var strToEndDate = new Date(endDate).toISOString();
            console.log(strToStartDate)
            console.log(strToEndDate)
            console.log(element["Dates"])
            if(element["Dates"].toISOString()>=strToStartDate && element["Dates"].toISOString()<=strToEndDate){
            NoOfUsers_day.push(element["NoOfUsersJoined_sum"]);
            dates_day.push(element["Dates"].toString().slice(0,10));
            console.log("success")
            }
        });
        const myChart = new ChartJsImage();
        myChart.setConfig({
        type: 'line',
        data: { labels: dates_day, datasets: [{ label: 'Numbers of Users Joined', data: NoOfUsers_day }] },
        
        });

        myChart.toFile(path.join(__dirname, '../public/images/ChartImages/UsersJoinedChart.png'));
    }

    if(userTraffic!=undefined){
        PathUsersJoinedChart = path.join(__dirname, '../public/images/ChartImages/UsersJoinedChart.png')
    }
    if(subscriptionTraffic!=undefined){
        PathUsersSubscribedChart = path.join(__dirname, '../public/images/ChartImages/UsersSubscriptionChart.png')
    }

    

  

   if(additionalTags == ""){
    additionalTags = "None"
   }
    let date = moment().format('L'); 
    const stream = res.writeHead(200, {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment;filename=${reportName}.pdf`,
      });
    pdfDoc.on('data', (chunk) => stream.write(chunk));
    
    pdfDoc.on('end', () => stream.end());
    
    // Fit the image in the dimensions, and center it both horizontally and vertically
    
    // Logo
    pdfDoc.image(WavePath, 0, 0, { align: 'center', valign: 'center', width:600})
    // pdfDoc.image(Path, 430, 15, {fit: [70, 70], align: 'right'})
    
    // Title
    pdfDoc
    .fillColor('#444444')
    .font('Courier-Bold')
    .fontSize(35)
    .text('Threads In Times', { align: 'left' })

    
    // Report Description
    pdfDoc
    .fontSize(15)
    .text(`${reportDescription}`, 150, 150);

    // Date
    pdfDoc
    .font('Courier-Bold')
    .fontSize(10)
    .text(`Date ${date}`, { align: 'right' })
    // Additional Tags
    pdfDoc
        .fillColor('red')
        .fontSize(13)
        .text(`Additional Tags: ${additionalTags}`, 150, 200)
        .text(`Time Span from ${startDate} to ${endDate}`, 150, 220);

    
    // Chart Image
    if(userTraffic!=undefined){
        
        pdfDoc
        .moveDown()
        .image(PathUsersJoinedChart, { align: 'center', width: 300, height: 200})

    }
    if(subscriptionTraffic!=undefined){
        
        pdfDoc
        .moveDown()
        .image(PathUsersSubscribedChart, { align: 'center', width: 300, height: 200})

    }
    console.log(userTraffic)
    
    if(userRoles!=undefined){
        UserRolesPieChartPath = path.join(__dirname, '../public/images/ChartImages/UsersRolesPieChart.png')
    }
    
    if(userGenders!=undefined){
        UserGendersPieChartPath = path.join(__dirname, '../public/images/ChartImages/UsersGendersPieChart.png')
    }

    if(userGenders!=undefined || userRoles!=undefined){
        
        //Pie Charts
        pdfDoc.addPage()
        
        pdfDoc.image(WavePath, 0, 0, { align: 'center', valign: 'center', width:600})
        // Create the table - https://www.andronio.me/2017/09/02/pdfkit-tables/
        pdfDoc
        .fontSize(20)
        .font('Courier-Bold')
        .text('User Statistics',150,150, { align: 'left' })
        .moveDown()

        if(userRoles!=undefined){
        
        
        

        pdfDoc
        .moveDown()
        .fontSize(10)
        .text('Users Roles', { align: 'center' , width: 300, height: 200})
        .image(UserRolesPieChartPath, { align: 'center', width: 300, height: 200})
        .moveDown()
        }
        if(userGenders!=undefined){
       

        pdfDoc
        .moveDown()
        .fontSize(10)
        .text('Users Genders', { align: 'center' , width: 300, height: 200})
        .image(UserGendersPieChartPath, { align: 'center', width: 300, height: 200})
        .moveDown()
        }
    }

    
    // Traffic Logs New Page
    // if(TrafficLogs!=undefined){
    
   
    // trafficlog = await trafficLogs.findAll()
    // let traffic = []

    // SubscribersLog = await newsLetterTrafficLogs.findAll()
    // let Subscribers = []
    
    // for(let i = 0; i < await trafficLogs.count(); i++){
        
        
    //     traffic.push(trafficlog[i])
            
        
    // }
    // for(let i = 0; i < await newsLetterTrafficLogs.count(); i++){
        
    //     Subscribers.push(SubscribersLog[i])

        
    // }
    // pdfDoc.addPage()
    
    // pdfDoc.image(WavePath, 0, 0, { align: 'center', valign: 'center', width:600})
    
    // pdfDoc
    // .fontSize(10)
    // .text('Traffic Logs',150,150, { align: 'left' })
    // .moveDown()
    // .text("#        Description                         Joined At")

    // for(let i = 0; i < traffic.length; i++){
        
    //     if(i+1>=10){
    //             pdfDoc
    //         .fontSize(10)
    //         .text(`${i+1}       ${traffic[i].description}                  `.slice(0,45)+`${traffic[i].createdAt.toString().slice(0,10)}`, { align: 'left' })
    //     }else{
    //         pdfDoc
    //         .fontSize(10)
    //         .text(`${i+1}        ${traffic[i].description}                  `.slice(0,45)+`${traffic[i].createdAt.toString().slice(0,10)}`, { align: 'left' })
    //     }
    // }

    // pdfDoc
    // .moveDown()
    // .fontSize(10)
    // .text('News Letter Subscription Logs', { align: 'left' })
    // .moveDown()
    // .text("#        Description")

    // for(let i = 0; i < Subscribers.length; i++){
        
    //     if(i+1>=10){
    //         pdfDoc
    //         .fontSize(10)
    //         .text(`${i+1}       ${Subscribers[i].description}                           on`+`${Subscribers[i].createdAt.toString().slice(0,10)}`, { align: 'left' })
    //     }else{
    //         pdfDoc
    //         .fontSize(10)
    //         .text(`${i+1}        ${Subscribers[i].description}                             on `+`${Subscribers[i].createdAt.toString().slice(0,10)}`, { align: 'left' })
    //     }
    // }

    
// }

    pdfDoc.end();
    

    await Report.create({
        reportName: reportName,
        description: reportDescription,
        url: "None",
        tags: additionalTags,
        startDate: startDate,
        endDate: endDate,
        date: moment().format('L'),
        
    });
    
    
    // flashMessage(res, 'success', "Reports Downloaded Successfully!");
    // res.redirect("/admin/ReportsManagement")
})

router.get("/Reports", ensureAdminAuthenticated, async (req, res) => {
    let reports = await Report.findAll()
    res.render("admin/Reports",{reports})
})

router.get("/Dashboard", ensureAdminAuthenticated, async (req, res) => {
    totalUsers = await User.count()
    totalSubs = await User.count( {where:{newsLetter:true}} )
    trafficlog = await trafficLogs.findAll()
    let traffic = []

    SubscribersLog = await newsLetterTrafficLogs.findAll()
    let Subscribers = []
    
    totalReports = await Report.count()
    reportLogs = await Report.findAll()
    let reports = []
    
    for(let i = 0; i < 5; i++){
        if(trafficlog[i].ip != ""){
            traffic.push(trafficlog[i])
            
        }
    }
    for(let i = 0; i < 5; i++){
        if(SubscribersLog[i].ip != ""){
            Subscribers.push(SubscribersLog[i])

        }
    }

    for(let i = 0; i < 5; i++){
        
        reports.push(reportLogs[i])
        
    }
    
    res.render("admin/AdminDashboard", { totalUsers,totalSubs,traffic,Subscribers,reports,totalReports })
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

