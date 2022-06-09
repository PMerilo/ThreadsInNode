const { Sequelize } = require('sequelize/types');
const db = require('../config/DBConfig');

// Create videos table in MySQL Database
const Item = db.define('ticket',
    {    
        id:{type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true},
        title: { type: Sequelize.STRING }, 
        description: { type: Sequelize.STRING(2000) }, 
        pendingStatus: {type: Sequelize.STRING},
        urgency: {type:Sequelize.STRING},
        dateAdded: { type: Sequelize.DATE }
             
    });

module.exports = Item;