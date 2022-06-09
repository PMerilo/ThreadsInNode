const { Sequelize } = require('sequelize/types');
const db = require('../config/DBConfig');

// Create videos table in MySQL Database
const Item = db.define('feedback',
    {    
        id:{type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true},
        title: { type: Sequelize.STRING }, 
        description: { type: Sequelize.STRING(2000) }, 
        rating: { type: Sequelize.INTEGER }, 
        remarks: {type: Sequelize.STRING},
        timeAdded: {type: Sequelize.DATE}        
    });

module.exports = Item;