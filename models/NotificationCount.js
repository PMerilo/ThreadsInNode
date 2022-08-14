const sequelize = require('sequelize');
const db = require('../config/DBConfig');
const User = require('./User');
const Notification = require('./Notification');

class NotificationCount extends sequelize.Model {

}
NotificationCount.init({
    msgCount: { type: sequelize.INTEGER, defaultValue: 0},
    notificationCount: { type: sequelize.INTEGER, defaultValue: 0},
},
    {
        freezeTableName: true,
        timestamps: true,
        sequelize: db,
        modelName: "notificationcount",
    }
)

module.exports = NotificationCount;