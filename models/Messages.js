const sequelize = require('sequelize'); 
const db = require('../config/DBConfig');

// Create ticket table in MySQL Database
class Message extends sequelize.Model{
    
}
Message.init({
    id:{type: sequelize.INTEGER, autoIncrement: true, primaryKey: true},
    title: { type: sequelize.STRING,allowNull: false }, 
    description: { type: sequelize.STRING(2000),allowNull: false }, 
    dateAdded: { type: sequelize.DATE,allowNull: false },
    owner: {type: sequelize.STRING,allowNull: false},
    ownerID:{type: sequelize.INTEGER, allowNull:false},
    sender: {type: sequelize.STRING,allowNull: false},
    senderID:{type: sequelize.INTEGER, allowNull:false}
},
    {
        freezeTableName: true,
        timestamps: true,
        sequelize: db,
        modelName: "message",
    }
)


module.exports = Message;