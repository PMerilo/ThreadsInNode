const express = require('express');
const moment = require('moment');
const router = express.Router();
const flashMessage = require('../views/helpers/messenger');
const sequelizeUser = require("../config/DBConfig");
const { serializeUser } = require('passport');
const { Op, where } = require('sequelize');
const XLSX = require("xlsx");
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
const {jsPDF} = require('jspdf');
const UsersJoinedLog = require("../models/Logs/JoinedUsersLogs")
const NewsLetterLog = require("../models/Logs/NewsLetterLogs")
// const blobStream  = require('blob-stream');
// const PDFDocument = require("pdfkit-table");
const fs = require('fs');
const path = require('path');
const { NONE } = require('sequelize');
const QRCode = require('qrcode');

const dfd = require("danfojs-node");
const ChartJsImage = require('chartjs-to-image');  

// For mail
const nodemailer = require("nodemailer");
// const { where } = require('sequelize/types');
const Mail = require("../config/MailConfig");
const mail = require("../config/NewMailConfig");
const { cwd } = require('process');
const Service = require('../models/Service');
const Appointment = require('../models/Appointment');
const serviceController = require("../controllers/serviceController")
const TempUser = require("../models/TempUser");
const Notification = require("../models/Notification");
const Order = require('../models/Orders');
const OrderItems = require('../models/OrderItems');
const Chat = require('../models/Chat');
const ChatUser = require('../models/ChatUser');
const Msg = require('../models/Msg');
const Withdrawal = require('../models/Withdrawal');

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

router.get('/requests', async (req, res) => {
    let x = await req.user.getTailor()
    if (!x) {
        res.redirect('tailor/register')
    } else {

        let now = moment(`${res.locals.today} ${res.locals.time}`, 'YYYY-MM-DD HH:mm:ss')
        let requests = await Request.findAll({
            include: [
                { model: User, as: 'user' },
                {
                    model: Appointment,
                    order: [['createdAt', 'DESC']],
                    limit: 1
                },
                {
                    model: User,
                    as: 'tailor',
                },
                {
                    model: User,
                    as: 'tailorChange',
                },
            ],
            where: {
                [Op.or]: [
                    { userId: req.user.id },
                    { "$tailor.id$": req.user.id }
                ],
            },
            order: [
                ['createdAt', 'DESC'],
            ]
        })
        // console.log(requests[0].toJSON())
        res.render('admin/requests', { requests })
    }
});

router.post('/request/status', serviceController.requestStatus, (req, res) => {
    return res.json({})
});

router.post('/request/tailorChange', async (req, res) => {
    await Request.findByPk(req.body.id)
        .then(async (request) => {
            await Appointment.destroy({ where: { requestId: req.body.id, tailorId: request.tailorId, datetime: { [Op.gte]: moment() } } })
            await Request.update({ tailorChangeId: null, tailorId: request.tailorChangeId, statusCode: 1 }, {
                where: {
                    id: req.body.id
                },
            });
        })
    return res.json({});
});

router.post('/appointment/status', async (req, res) => {
    let x = await Request.findOne({ include: { model: Appointment, where: { id: req.body.id } } })
    x.appointments[0].confirmed = req.body.status
    x.appointments[0].save()
    if (req.body.status === 'Confirmed') {
        x.status = "Appointment Confirmed"
        x.adminstatus = "Appointment Confirmed"
        x.adminColor = "green"
        x.userColor = "green"
    } else {
        x.status = "Appointment Confirmed"
        x.adminstatus = "Appointment Rejected! Please book again."
        x.adminColor = "green"
        x.userColor = "green"
    }
    x.save()
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

router.get('/requests/chat', async (req, res) => {
    let chatids = await ChatUser.findAll({
        where: { userId: req.user.id },
        include: {
            model: Chat,
            include: {
                model: User,
                where: {
                    id: { [Op.ne]: req.user.id }
                }
            }
        }
    })
    let chats = new Array()

    chatids.forEach(chatid => {
        chats.push(chatid.chat)
    });
    // console.log(JSON.stringify(chats))

    res.render('services/chat', { chats })
});

router.get('/requests/chat/:id', async (req, res) => {
    let chatids = await ChatUser.findAll({
        where: { userId: req.user.id },
        include: {
            model: Chat,
            include: [
                {
                    model: User,
                    where: {
                        id: { [Op.ne]: req.user.id }
                    }
                },
                {
                    model: Msg,
                    required: false

                }
            ]
        },
        order: [
            [Chat, Msg, 'createdAt', 'DESC']
        ]
    })
    let chats = new Array()

    chatids.forEach(chatid => {
        chats.push(chatid.chat)
    });
    // let currentchat = await Chat.findByPk(req.params.id, { include: [{ model: Msg, required: false }, { model: User, where: { id: { [Op.ne]: req.user.id } } }] })
    // console.log(currentchat.users)
    res.render('services/chat', { chats })
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
        // console.log(e)
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
        // console.log(e)
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

router.post('/deleteUser/:id', async function
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

router.get("/NewsLetterSendMail", ensureAdminAuthenticated, async (req, res) => {
    
    res.render("admin/NewsLetterSendMail")
})

router.post("/NewsLetterSendMail", ensureAdminAuthenticated, async (req, res) => {
    let { subject, message} = req.body;
    let users = await User.findAll({where: {newsLetter: true}});
    
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
            
        
        
        
       
        // let Path = path.join("../public",posterURL)
        // console.log(posterURL)
        // console.log(Path)
        // console.log("end of test")
        // console.log(posterURL.slice(posterURL.lastIndexOf("/") + 1))
        //  });
        mail.Send({
            email_recipient: email,
            subject: subject,
            template_path: "../views/MailTemplates/NewsLetterMail.html",
            context: {name: element.name, message: message,subject: subject},
            
            
        });
         
         
         console.log("Mail sent")
    });
    
    flashMessage(res, 'success', "News Letter Sent Successfully!");

    res.redirect("/admin/NewsLetterSendMail")
})

router.get('/ChatRoom', ensureAdminAuthenticated, async (req, res) => {

    res.render("admin/ChatRoom")

})



router.get("/ReportsManagement", ensureAdminAuthenticated, async (req, res) => {
    totalUsers = await User.count()
    totalSubs = await User.count( {where:{newsLetter:true}} )
    traffic = await trafficLogs.findAll()
    newsLetterTraffic = await newsLetterTrafficLogs.findAll()
    res.render("admin/ReportManagement", { totalUsers,totalSubs,traffic,newsLetterTraffic })
})

router.post("/DownloadPDFReports", ensureAdminAuthenticated, async (req, res) => {

    let { reportName,reportDescription,additionalTags,userTraffic,subscriptionTraffic,TrafficLogs,userRoles,userGenders,startDate,endDate,customerSatisfaction} = req.body;
    const doc = new jsPDF();
    let WavePath = path.join(__dirname, '../public/images/Letterhead.png')
    let date = moment().format('L')
    if(userTraffic!=undefined){
        PathUsersJoinedChart = path.join(__dirname, '../public/images/ChartImages/UsersJoinedChart.png')
    }
    if(subscriptionTraffic!=undefined){
        PathUsersSubscribedChart = path.join(__dirname, '../public/images/ChartImages/UsersSubscriptionChart.png')
    }
    doc.addImage(
        'data:image/png;base64,' +
            require('fs').readFileSync(`${WavePath}`, 'base64'),
        'png',
        0,
        0,
        210,
        297
        );

    doc
    .text("Threads In Times", 10, 10)
    .setFont("BoldItalic")
    .setFontSize(35);

    doc.setFont("bold")
    .setFontSize(20);
    doc.text(`Title: ${reportName}`, 10, 40);

    console.log(doc.getFontList())

    // additional tags
    doc.setFont("normal")
    .setFontSize(10);
    doc.text(`Additional Tags: ${additionalTags}`, 10, 60);

    doc.setFont("Courier-Bold")
    .setFontSize(10);
    doc.text(`Date ${date}`, 10, 80);


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
        // console.log(df2)
        df2.forEach((element) => {
            
            var strToStartDate = new Date(startDate).toISOString();
            var strToEndDate = new Date(endDate).toISOString();
            // console.log(strToStartDate)
            // console.log(strToEndDate)
            // console.log(element["Dates"])
            if(element["Dates"].toISOString()>=strToStartDate && element["Dates"].toISOString()<=strToEndDate){
            NoOfUsers_day.push(element["NoOfUsersJoined_sum"]);
            dates_day.push(element["Dates"].toString().slice(0,10));
           
            }
        });
        const myChart = new ChartJsImage();
        myChart.setConfig({
        type: 'line',
        data: { labels: dates_day, datasets: [{ label: 'Numbers of Users Joined', data: NoOfUsers_day }] },
        
        });

        myChart.toFile(path.join(__dirname, '../public/images/ChartImages/UsersJoinedChart.png'));
    }


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

    if(customerSatisfaction!=undefined){
        CustomerSatisfactionPieChartPath = path.join(__dirname, '../public/images/ChartImages/CustomerSatisfactionBarChart.png')
    }

    
    doc.save(`${reportName}.pdf`);
    
    res.download(`${reportName}.pdf`)



})

router.post("/DownloadReports", ensureAdminAuthenticated, async (req, res) => {
    
    let { reportName,reportDescription,additionalTags,userTraffic,subscriptionTraffic,TrafficLogs,userRoles,userGenders,startDate,endDate,customerSatisfaction} = req.body;
    if((await Report.findOne({where:{reportName:reportName}})) != undefined){
        flashMessage(res, 'error', "Report Already Exists! Please Use a different name or delete the existing report");
        
        res.redirect("/admin/ReportsManagement")
        
    }else{

    
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
        // console.log(df2)
        df2.forEach((element) => {
            
            var strToStartDate = new Date(startDate).toISOString();
            var strToEndDate = new Date(endDate).toISOString();
            // console.log(strToStartDate)
            // console.log(strToEndDate)
            // console.log(element["Dates"])
            if(element["Dates"].toISOString()>=strToStartDate && element["Dates"].toISOString()<=strToEndDate){
            NoOfUsers_day.push(element["NoOfUsersJoined_sum"]);
            dates_day.push(element["Dates"].toString().slice(0,10));
           
            }
        });
        const myChart = new ChartJsImage();
        myChart.setConfig({
        type: 'line',
        data: { labels: dates_day, datasets: [{ label: 'Numbers of Users Joined', data: NoOfUsers_day }] },
        
        });

        await myChart.toFile(path.join(__dirname, '../public/images/ChartImages/UsersJoinedChart.png'));

        let cols2 = ["Dates","NoOfNewsLetterSubscriptions"];
        let data2 = [];
        const usersSubscribed = await NewsLetterLog.findAll();
        usersSubscribed.forEach(element => {
            let rawData = [element.date, element.noOfUsersJoined];
            data2.push(rawData)
        
          }
        );
        // Set Day Data
        dfDay2 = new dfd.DataFrame(data2,{columns:cols2})
        group_dfDay2 = dfDay2.groupby(["Dates"]).sum()
        const df3 = dfd.toJSON(group_dfDay2,{format:"json"})

        var NoOfUsers_day2 = [];
        var dates_day2 = [];
        // console.log(df2)
        console.log(df3)
        console.log(data2)
        df3.forEach((element) => {

            var strToStartDate = new Date(startDate).toISOString();
            var strToEndDate = new Date(endDate).toISOString();
            
            if(element["Dates"].toISOString()>=strToStartDate && element["Dates"].toISOString()<=strToEndDate){
            
            dates_day2.push(element["Dates"].toString().slice(0,10));
            NoOfUsers_day2.push(element["NoOfNewsLetterSubscriptions_sum"]);
           
            }
        }
        );
        const myChart2 = new ChartJsImage();
        myChart2.setConfig({
        type: 'line',
        data: { labels: dates_day2, datasets: [{ label: 'Numbers of Users Subscribed', data: NoOfUsers_day2 }] },
        
        });

        await myChart2.toFile(path.join(__dirname, '../public/images/ChartImages/UsersSubscriptionChart.png'))


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
    // const stream = res.writeHead(200, {
    //     'Content-Type': 'application/pdf',
    //     'Content-Disposition': `attachment;filename=${reportName}.pdf`,
    //   });
    // pdfDoc.on('data', (chunk) => stream.write(chunk));
    
    // pdfDoc.on('end', () => stream.end());
    
    let stream = fs.createWriteStream(`./public/pdfs/${reportName}.pdf`);
    pdfDoc.pipe(stream);
    pdfDoc.pipe(res.setHeader('Content-disposition', `attachment; filename=${reportName}.pdf`));
    
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

    // Report Name
    pdfDoc
    .moveDown()
    .fontSize(25)
    .text(reportName, { align: 'center' })
    .moveDown()

    // Date
    pdfDoc
    .font('Courier-Bold')
    .fontSize(10)
    .text(`Date ${date}`, { align: 'right' })
    
    // Report Description
    pdfDoc
    .moveDown()
    .fontSize(15)
    .text(`${reportDescription}`);

    
    // Additional Tags
    pdfDoc
        .fillColor('red')
        .fontSize(13)
        .text(`Additional Tags: ${additionalTags}`)
        .text(`Time Span from ${startDate} to ${endDate}`);

    
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

    if(customerSatisfaction!=undefined){
        CustomerSatisfactionPieChartPath = path.join(__dirname, '../public/images/ChartImages/CustomerSatisfactionBarChart.png')
    }


    if(userGenders!=undefined || userRoles!=undefined){
        
        //Pie Charts
        pdfDoc.addPage()
        
        pdfDoc.image(WavePath, 0, 0, { align: 'center', valign: 'center', width:600})
        // Create the table - https://www.andronio.me/2017/09/02/pdfkit-tables/
        pdfDoc
        .fontSize(10)
        .font('Courier-Bold')
        .text('User Statistics', { align: 'left' })
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
        if(customerSatisfaction!=undefined){
        pdfDoc
        .moveDown()
        .fontSize(10)
        .text('Customer Satisfaction', { align: 'center' , width: 300, height: 200})
        .image(CustomerSatisfactionPieChartPath, { align: 'center', width: 300, height: 200})
        .moveDown()
        }
    }

    // if(customerSatisfaction!=undefined){
    //     pdfDoc.addPage()
    //     pdfDoc.image(WavePath, 0, 0, { align: 'center', valign: 'center', width:600})
        
    //     pdfDoc
    //     .moveDown()
    //     .fontSize(10)
    //     .text('Customer Satisfaction', { align: 'center' , width: 300, height: 200})
    //     .image(CustomerSatisfactionPieChartPath, { align: 'center', width: 300, height: 200})
    //     .moveDown()
            
    // }


    
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
    console.log("PDF Created")
    

    await Report.create({
        reportName: reportName,
        description: reportDescription,
        url: '/pdfs/'+reportName+'.pdf',
        tags: additionalTags,
        startDate: startDate,
        endDate: endDate,
        date: moment().format('L'),
        
    });
}
    
    
    // flashMessage(res, 'success', "Reports Downloaded Successfully!");
    // res.redirect("/admin/ReportsManagement")
})

router.get("/Reports", ensureAdminAuthenticated, async (req, res) => {
    let reports = await Report.findAll()
    res.render("admin/Reports",{reports})
})

router.post("/DeleteReports", ensureAdminAuthenticated, async (req, res) => {
    let {reportId} = req.body
   
    Report.destroy({where:{id:reportId}})
    
    flashMessage(res, 'success', "Report Deleted Successfully!");
    res.redirect("/admin/Reports")
    
})

router.get("/Dashboard", ensureAdminAuthenticated, async (req, res) => {
    totalUsers = await User.count()
    totalSubs = await User.count( {where:{newsLetter:true}} )
    trafficlog = await trafficLogs.findAll()
    let traffic = []

    SubscribersLog = await newsLetterTrafficLogs.findAll()
    SubscribersCount = await newsLetterTrafficLogs.count()
    let Subscribers = []
    
    totalReports = await Report.count()
    reportLogs = await Report.findAll()
    let reports = []
    
    for(let i = 0; i < await trafficLogs.count(); i++){
        if(trafficlog[i].ip != ""){
            traffic.push(trafficlog[i])
            
        }
        if(i + 1 >= 5){
            break
        }
    }
    for(let i = 0; i < SubscribersCount; i++){
        if(SubscribersLog[i].ip != ""){
            Subscribers.push(SubscribersLog[i])

        }
        if(i + 1 >= 5){
            break
        }
    }

    for(let i = 0; i < totalReports ; i++){
        
        reports.push(reportLogs[i])
        if(i + 1 >= 5){
            break
        }
    }

    let totalTickets = await Ticket.count({where:{pendingStatus:"Pending"}})
    let totalTicketsOpen = await Ticket.findAll({where:{pendingStatus:"Pending"}})
    
    res.render("admin/AdminDashboard", { totalUsers,totalSubs,traffic,Subscribers,reports,totalReports,totalTickets,totalTicketsOpen })
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
        res.redirect("/admin/manageVouchers")
    } catch (e) {
        console.log(e)
        res.redirect("/admin/manageVouchers")
    }
})

router.get('/editVoucher/:id', ensureAuthenticated, async (req, res) => {

    voucher = await Reward.findOne({ where: { id: req.params.id } })
    res.render("rewards/editVouchers", { voucher })
})

router.get('/revenue', ensureAuthenticated, async (req, res) => {
    const orders = (await OrderItems.findAll({
        include: Order, order: [
            ['createdAt', 'DESC'],
            ['product_name', 'ASC'],
        ]
    }))
    const sales = (await Order.sum('orderTotal')).toFixed(2)

    var sellerRevenue = 0
    orders.forEach(element => {
        let data = ((element.product_price * element.qtyPurchased) + element.shipping_rate)
        sellerRevenue += data
    });
    const revenue = (sales - ((sellerRevenue / 100) * 83)).toFixed(2)
    res.render('admin/revenue.handlebars', { orders, revenue });
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
    res.redirect("/admin/manageVouchers")

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
    await Tailor.findOrCreate({ where: { id: req.user.id }, defaults: { id: req.user.id, userId: req.user.id } })
        .then(([tailor, created]) => {
            if (created) {
                flashMessage(res, "success", 'Registered as Tailor Successfully');
            } else {
                flashMessage(res, "error", 'Already registered as tailor');
            }
        })
    res.redirect("/admin/requests")

});

router.get('/livechat/:id', async (req, res) => {
    res.render("admin/livechat")
});

router.get('/withdrawal', async (req, res) => {
    var withdrawals = await Withdrawal.findAll({
        include: User, order: [
            ['createdAt', 'DESC'],
            ['withdrawal_amount', 'DESC'],
        ]
    })
    res.render("admin/withdrawals", { withdrawals })
});

router.post('/withdrawal', async (req, res) => {
    var withdrawal = await Withdrawal.findOne({ where: { id: req.body.id } })
    var user = await User.findByPk(withdrawal.sellerID)
    if (withdrawal.status == "Payout Received" && req.body.status != "Payout Received" || withdrawal.status == "Processing" && req.body.status == "Awaiting Authorization") {
        res.send({ message: "Cannot change status of payout is being processed/after its been received", status: "error" })
    } else if (req.body.status == "Processing") {
        await Withdrawal.update({ status: req.body.status, authorization_by: req.user.name, authorizee_id: req.user.id }, {
            where: {
                id: req.body.id
            }
        })
        await User.update({total_balance: user.total_balance - parseInt(withdrawal.withdrawal_amount), withdrawn_amount: user.withdrawn_amount + parseInt(withdrawal.withdrawal_amount)},{where : {id: withdrawal.sellerID}})
    } else if (req.body.status == "Payout Received") {
        if (req.user.id == withdrawal.authorizee_id) {
            await Withdrawal.update({ status: req.body.status, authorization_by: req.user.name, authorizee_id: req.user.id }, {
                where: {
                    id: req.body.id
                }
            })
        } else {
            res.send({ message: "Only the Admin that authorized the payout can complete it", status: "error" })
        }
    }
});

module.exports = router;

