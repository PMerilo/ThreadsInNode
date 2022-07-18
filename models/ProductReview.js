const sequelize = require('sequelize'); 
const db = require('../config/DBConfig');



// Create feedback table in MySQL Database
class ProductReview extends sequelize.Model{
    
}
ProductReview.init({
    id:{type: sequelize.INTEGER, autoIncrement: true, primaryKey: true},
    title: { type: sequelize.STRING,allowNull: false }, 
    description: { type: sequelize.STRING(2000),allowNull: false }, 
    dateAdded: { type: sequelize.DATE,allowNull: false },
    owner: {type: sequelize.STRING,allowNull: false},
    ownerID:{type: sequelize.INTEGER, allowNull:false},
    seller: {type: sequelize.STRING,allowNull: false},
    sellerID:{type: sequelize.INTEGER, allowNull:false},
    sku:{ type: sequelize.INTEGER,allowNull: false }
},
    {
        freezeTableName: true,
        timestamps: true,
        sequelize: db,
        modelName: "productreview",
    }
)    
module.exports = ProductReview;