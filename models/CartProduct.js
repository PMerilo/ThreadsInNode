const sequelize = require('sequelize'); 
const db = require('../config/DBConfig');

// Create Product table in MySQL Database


class CartProduct extends sequelize.Model{

}
CartProduct.init({
        id: {type: sequelize.INTEGER, autoIncrement: false, primaryKey: true},
        sku:{type: sequelize.INTEGER},
        name: { type: sequelize.STRING }, 
        description: { type: sequelize.STRING(2000) }, 
        price: { type: sequelize.FLOAT }, 
        category:{type:sequelize.STRING},
        cartOwner:{type:sequelize.STRING},
        cartOwnerID:{type: sequelize.INTEGER},
        totalCost:{ type: sequelize.FLOAT },
        qtyPurchased:{ type: sequelize.INTEGER }
        
},
    {
        freezeTableName: true,
        timestamps: true,
        sequelize: db,
        modelName: "cartproduct",
    }
)    

module.exports = CartProduct;