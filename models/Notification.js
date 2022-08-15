const sequelize = require('sequelize'); 
const db = require('../config/DBConfig');

class Notification extends sequelize.Model{
    
}
Notification.init({
    title: { type: sequelize.STRING,allowNull: false }, 
    body: { type: sequelize.STRING(2000),allowNull: false }, 
    url: {type: sequelize.STRING(200)},
    senderId:{type: sequelize.INTEGER}
},
    {
        freezeTableName: true,
        timestamps: true,
        sequelize: db,
        modelName: "notification",
    }
)


module.exports = Notification;