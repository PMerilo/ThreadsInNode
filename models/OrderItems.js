const sequelize = require('sequelize'); 
const db = require('../config/DBConfig');
const Orders = require('../models/Orders')

class OrderItems extends sequelize.Model{

}
OrderItems.init({
        productSku: { type: sequelize.INTEGER},
        qtyPurchased:{ type: sequelize.INTEGER },
        product_name:{ type: sequelize.STRING},
        product_price:{ type: sequelize.INTEGER},
        seller_name: { type: sequelize.STRING}
},
    {
        freezeTableName: true,
        timestamps: true,
        sequelize: db,
        modelName: "orderitems",
    }
)    

module.exports = OrderItems;