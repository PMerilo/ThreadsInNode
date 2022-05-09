const Sequelize = require('sequelize'); 
const db = require('../config/DBConfig');

// Create videos table in MySQL Database
const Item = db.define('item',
    {    
        id:{type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true},
        name: { type: Sequelize.STRING }, 
        description: { type: Sequelize.STRING(2000) }, 
        price: { type: Sequelize.FLOAT }, 
        quantity: {type: Sequelize.INTEGER}        
    });

module.exports = Item;