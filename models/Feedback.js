const sequelize = require('sequelize'); 
const db = require('../config/DBConfig');



// Create feedback table in MySQL Database
class Feedback extends sequelize.Model{
    
}
Feedback.init({
    id:{type: sequelize.INTEGER, autoIncrement: true, primaryKey: true},
    title: { type: sequelize.STRING,allowNull: false }, 
    description: { type: sequelize.STRING(2000),allowNull: false }, 
    rating: {type: sequelize.FLOAT,allowNull: false},
    remarks: {type:sequelize.STRING,allowNull: false},
    favouriteThing: {type:sequelize.STRING,allowNull: false},
    leastFavouriteThing: {type:sequelize.STRING,allowNull: false},
    dateAdded: { type: sequelize.DATE,allowNull: false },
    owner: {type: sequelize.STRING,allowNull: false},
    ownerID:{type: sequelize.INTEGER, allowNull:false}
},
    {
        freezeTableName: true,
        timestamps: true,
        sequelize: db,
        modelName: "feedback",
    }
)    
module.exports = Feedback;