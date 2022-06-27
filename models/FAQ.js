const sequelize = require('sequelize'); 
const db = require('../config/DBConfig');



// Create feedback table in MySQL Database
class FAQ extends sequelize.Model{
    
}
FAQ.init({
    id:{type: sequelize.INTEGER, autoIncrement: true, primaryKey: true},
    title: { type: sequelize.STRING,allowNull: false }, 
    description: { type: sequelize.STRING(2000),allowNull: false }, 
    likes:{type:sequelize.INTEGER,allowNull:false,defaultValue:0},
    dateAdded: { type: sequelize.DATE,allowNull: false },
    owner: {type: sequelize.STRING,allowNull: false},
    ownerID:{type: sequelize.INTEGER, allowNull:false}
},
    {
        freezeTableName: true,
        timestamps: true,
        sequelize: db,
        modelName: "faq",
    }
)    
module.exports = FAQ;