const mySQLDB = require('./DBConfig');
const Appointment = require('../models/Appointment')
const Cart = require('../models/Cart');
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
const Survey = require('../models/Survey')


const Report = require('../models/Reports')

const JoinedUsersLogs = require('../models/Logs/JoinedUsersLogs');
const CustomerSatisfactionLog = require('../models/Logs/CustomerSatisfactionLog');
const NewsLetterLog = require("../models/Logs/NewsLetterLogs")

const Tailor = require('../models/Tailor');
const Order = require('../models/Orders');
const OrderItems = require('../models/OrderItems');
const Review = require('../models/Reviews');
const Notification = require('../models/Notification');
const UserNotification = require('../models/UserNotifications');
const Chat = require('../models/Chat');
const Msg = require('../models/Msg');
const ChatUser = require('../models/ChatUser');
const NotificationCount = require('../models/NotificationCount');
const RequestItem = require('../models/RequestItem');
const Withdrawal = require('../models/Withdrawal');

// If drop is true, all existing tables are dropped and recreated
const setUpDB = (drop) => {
    mySQLDB.authenticate()
        .then(() => {
            console.log('Database connected');
            /*
            Defines the relationship where a user has many videos.
            The primary key from user will be a foreign key in video.
            */

            User.hasMany(Request, {onDelete: 'CASCADE'})
            User.hasMany(Appointment, {onDelete: 'CASCADE'})
            User.hasOne(Tailor, {foreignKey: {allowNull: false}, onDelete: 'CASCADE'})

            User.hasOne(NotificationCount)
            NotificationCount.belongsTo(User)

            User.belongsToMany(Notification, {through: UserNotification})
            Notification.belongsToMany(User, {through: UserNotification})

            Request.hasMany(Appointment, {onDelete: 'CASCADE'})
            Request.belongsTo(User, {as: 'user', foreignKey: 'userId'})
            Request.belongsTo(User, {as: 'tailor', foreignKey: 'tailorId'})
            Request.belongsTo(User, {as: 'tailorChange', foreignKey: 'tailorChangeId'})

            Request.hasMany(RequestItem)
            RequestItem.belongsTo(Request)

            Appointment.belongsTo(Request)
            Appointment.belongsTo(User, {as: 'user', foreignKey: 'userId'})
            Appointment.belongsTo(User, {as: 'tailor', foreignKey: 'tailorId'})

            Tailor.hasMany(Appointment)
            Tailor.belongsTo(User)
            Tailor.hasMany(Request)

            Product.belongsToMany(Cart, { through: CartProduct })
            Cart.belongsToMany(Product, { through: CartProduct })

            User.hasOne(Cart)
            Cart.belongsTo(User)

            Order.hasMany(OrderItems)
            OrderItems.belongsTo(Order)

            Order.belongsTo(User)
            User.hasMany(Order)

            Wishlist.belongsTo(Product)
            Product.hasMany(Wishlist)

            Review.belongsTo(User)
            User.hasMany(Review)

            Review.belongsTo(Product)
            Product.hasMany(Review)

            Chat.hasMany(Request, {onDelete: "CASCADE"})
            Request.belongsTo(Chat, {onDelete: "CASCADE"})

            Chat.belongsToMany(User, {through: ChatUser})
            User.belongsToMany(Chat, {through: ChatUser})

            Chat.hasMany(ChatUser)
            ChatUser.belongsTo(Chat)
            User.hasMany(ChatUser)
            ChatUser.belongsTo(User)

            Chat.hasMany(Msg, {onDelete: "CASCADE"})
            Msg.belongsTo(Chat, {onDelete: "CASCADE"})
            Msg.belongsTo(User, {onDelete: "CASCADE"})

            User.hasMany(Withdrawal)
            Withdrawal.belongsTo(User)
            
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