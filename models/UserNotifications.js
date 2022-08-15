const sequelize = require('sequelize');
const db = require('../config/DBConfig');
const User = require('./User');
const Notification = require('./Notification');

class UserNotification extends sequelize.Model {

}
UserNotification.init({
    userId: { type: sequelize.INTEGER, references: { model: User, key: 'id' } },
    notificationId: { type: sequelize.INTEGER, references: { model: Notification, key: 'id' } },
    seen: { type: sequelize.BOOLEAN, defaultValue: false }

},
    {
        freezeTableName: true,
        timestamps: true,
        sequelize: db,
        modelName: "usernotification",
    }
)

module.exports = UserNotification;