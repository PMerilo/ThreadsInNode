const mySQLDB = require('./DBConfig');
const Appointment = require('../models/Appointment')
const CartProduct = require('../models/CartProduct')
const FAQ = require('../models/FAQ')
const Feedback = require('../models/FAQ')
const Messages = require('../models/Messages')
const Product = require('../models/Product')
const Request = require('../models/Request')
const Reward = require('../models/Reward')
const Wishlist = require('../models/Wishlist')
const Ticket = require('../models/Ticket')
const User = require('../models/User')

const JoinedUsersLogs = require('../models/Logs/JoinedUsersLogs')

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
       Request.belongsTo(User)
       Request.hasMany(Appointment)
       Appointment.belongsTo(Request)
       
        mySQLDB.sync({
            alter: true,
            force: drop
        })
        .then(console.log("Successfully altered and sync"))
        .catch(err => console.log(err));
    })
    .catch(err => console.log(err));
};
//     mySQLDB
//     .authenticate()
//     .then((result) => console.log(result))
//     .catch((err) => console.log(err));

//     User.sync({ alter: true })
//     .then((v) => {
//         console.log(v);
//         console.log("Successfully altered and sync");
//     })
//     .catch((e) =>
//         User.sync({ force: true }).then(() => {
//         console.log(e);
//         console.log("Created User table");
//         })
//     );
//     Ticket.sync({ alter: true })
//     .then((v) => {
//         console.log(v);
//         console.log("Successfully altered and sync");
//     })
//     .catch((e) =>
//         User.sync({ force: true }).then(() => {
//         console.log(e);
//         console.log("Created Ticket table");
//         })
//     );
//     Feedback.sync({ alter: true })
//     .then((v) => {
//         console.log(v);
//         console.log("Successfully altered and sync");
//     })
//     .catch((e) =>
//         User.sync({ force: true }).then(() => {
//         console.log(e);
//         console.log("Created Feedback table");
//         })
//     );
//     FAQ.sync({ alter: true })
//     .then((v) => {
//         console.log(v);
//         console.log("Successfully altered and sync");
//     })
//     .catch((e) =>
//         User.sync({ force: true }).then(() => {
//         console.log(e);
//         console.log("Created FAQ table");
//         })
//     );
//     Product.sync({ alter: true })
//     .then((v) => {
//         console.log(v);
//         console.log("Successfully altered and sync");
//     })
//     .catch((e) =>
//         User.sync({ force: true }).then(() => {
//         console.log(e);
//         console.log("Created Product table");
//         })
//     );

//     CartProduct.sync({ alter: true })
//     .then((v) => {
//         console.log(v);
//         console.log("Successfully altered and sync");
//     })
//     .catch((e) =>
//         User.sync({ force: true }).then(() => {
//         console.log(e);
//         console.log("Created Product Cart table");
//         })
//     );

//     Message.sync({ alter: true })
//     .then((v) => {
//         console.log(v);
//         console.log("Successfully altered and sync");
//     })
//     .catch((e) =>
//         User.sync({ force: true }).then(() => {
//         console.log(e);
//         console.log("Created Message table");
//         })
//     );

//     Reward.sync({ alter: true })
//     .then((v) => {
//         console.log(v);
//         console.log("Successfully altered and sync");
//     })
//     .catch((e) =>
//         User.sync({ force: true }).then(() => {
//         console.log(e);
//         console.log("Created Reward table");
//         })
//     );
//     JoinedUsersLog.sync({ alter: true })
//     .then((v) => {
//         console.log(v);
//         console.log("Successfully altered and sync");
//     })
//     .catch((e) =>
//         User.sync({ force: true }).then(() => {
//         console.log(e);
//         console.log("Created NoOfUsersJoined table");
//         })
//     );

// };



module.exports = { setUpDB };