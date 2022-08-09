const mySQLDB = require('./DBConfig');
const Appointment = require('../models/Appointment')
const CartProduct = require('../models/CartProduct')
const FAQ = require('../models/FAQ')
const Feedback = require('../models/FAQ')
const Message = require('../models/Messages')
const Product = require('../models/Product')
const ProductReview = require("../models/ProductReview")
const Request = require('../models/Request')
const Reward = require('../models/Reward')
const Wishlist = require('../models/Wishlist')
const Ticket = require('../models/Ticket')
const User = require('../models/User')
const Service = require('../models/Service')
const backupCodes = require("../models/backupCodes")
const NewsLetterLog = require("../models/Logs/NewsLetterLogs")



const JoinedUsersLogs = require('../models/Logs/JoinedUsersLogs');
const Tailor = require('../models/Tailor');

// If drop is true, all existing tables are dropped and recreated
const setUpDB = (drop) => {
    mySQLDB.authenticate()
        .then(() => {
            console.log('Database connected');
            /*
            Defines the relationship where a user has many videos.
            The primary key from user will be a foreign key in video.
            */

            User.hasMany(Request)
            User.hasMany(Appointment)
            User.hasOne(Tailor, {foreignKey: {allowNull: false}})

            Request.belongsTo(User)
            Request.hasMany(Appointment)
            Request.belongsTo(Tailor)
            Request.belongsTo(Service, { as: 'service' });

            Appointment.belongsTo(Request)
            Appointment.belongsTo(User)


            Service.hasMany(Request, { as: 'requests'})

            Tailor.belongsTo(User)
            Tailor.hasMany(Request)

            mySQLDB.sync({
                alter: true,
                force: drop
            })
                .then(console.log("Successfully altered and sync"))
                .catch(err => console.log(err));
        })
        .catch(err => console.log(err));
};


// mySQLDB
// .authenticate()
// .then((result) => console.log(result))
// .catch((err) => console.log(err));

// User.sync({ alter: true })
// .then((v) => {
//     console.log(v);
//     console.log("Successfully altered and sync");
// })
// .catch((e) =>
//     User.sync({ force: true }).then(() => {
//     console.log(e);
//     console.log("Created User table");
//     })
// );
// Ticket.sync({ alter: true })
// .then((v) => {
//     console.log(v);
//     console.log("Successfully altered and sync");
// })
// .catch((e) =>
//     User.sync({ force: true }).then(() => {
//     console.log(e);
//     console.log("Created Ticket table");
//     })
// );
// Feedback.sync({ alter: true })
// .then((v) => {
//     console.log(v);
//     console.log("Successfully altered and sync");
// })
// .catch((e) =>
//     User.sync({ force: true }).then(() => {
//     console.log(e);
//     console.log("Created Feedback table");
//     })
// );
// FAQ.sync({ alter: true })
// .then((v) => {
//     console.log(v);
//     console.log("Successfully altered and sync");
// })
// .catch((e) =>
//     User.sync({ force: true }).then(() => {
//     console.log(e);
//     console.log("Created FAQ table");
//     })
// );
// Product.sync({ alter: true })
// .then((v) => {
//     console.log(v);
//     console.log("Successfully altered and sync");
// })
// .catch((e) =>
//     User.sync({ force: true }).then(() => {
//     console.log(e);
//     console.log("Created Product table");
//     })
// );

// CartProduct.sync({ alter: true })
// .then((v) => {
//     console.log(v);
//     console.log("Successfully altered and sync");
// })
// .catch((e) =>
//     User.sync({ force: true }).then(() => {
//     console.log(e);
//     console.log("Created Product Cart table");
//     })
// );

// Message.sync({ alter: true })
// .then((v) => {
//     console.log(v);
//     console.log("Successfully altered and sync");
// })
// .catch((e) =>
//     User.sync({ force: true }).then(() => {
//     console.log(e);
//     console.log("Created Message table");
//     })
// );

// Reward.sync({ alter: true })
// .then((v) => {
//     console.log(v);
//     console.log("Successfully altered and sync");
// })
// .catch((e) =>
//     User.sync({ force: true }).then(() => {
//     console.log(e);
//     console.log("Created Reward table");
//     })
// );
// JoinedUsersLog.sync({ alter: true })
// .then((v) => {
//     console.log(v);
//     console.log("Successfully altered and sync");
// })
// .catch((e) =>
//     User.sync({ force: true }).then(() => {
//     console.log(e);
//     console.log("Created NoOfUsersJoined table");
//     })
// );





module.exports = { setUpDB };