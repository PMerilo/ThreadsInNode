const sequelize = require('sequelize'); 
const db = require('../config/DBConfig');
const Cart = require('./Cart');
const Product = require('./Product');

// Create Product table in MySQL Database


class CartProduct extends sequelize.Model{

}
CartProduct.init({
        cartId: { type: sequelize.INTEGER, references: { model: Cart, key: 'id' } },
        productSku: { type: sequelize.INTEGER, references: { model: Product, key: 'sku' } },
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