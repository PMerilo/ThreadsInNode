const sequelize = require('sequelize'); 
const db = require('../config/DBConfig');
// Required for file upload 
const fs = require('fs'); 
const upload = require('../views/helpers/imageUpload');
// Create ticket table in MySQL Database
class Ticket extends sequelize.Model{
    
}
Ticket.init({
    id:{type: sequelize.INTEGER, autoIncrement: true, primaryKey: true},
    title: { type: sequelize.STRING,allowNull: false }, 
    description: { type: sequelize.STRING(2000),allowNull: false }, 
    pendingStatus: {type: sequelize.STRING,allowNull: false},
    urgency: {type:sequelize.STRING,allowNull: false},
    dateAdded: { type: sequelize.DATE,allowNull: false },
    posterURL: { type: sequelize.STRING }, 
    owner: {type: sequelize.STRING,allowNull: false},
    ownerID:{type: sequelize.INTEGER, allowNull:false}
},
    {
        freezeTableName: true,
        timestamps: true,
        sequelize: db,
        modelName: "ticket",
    }
)


module.exports = Ticket;