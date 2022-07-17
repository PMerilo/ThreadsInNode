const sequelize = require('sequelize'); 
const db = require('../config/DBConfig');

// Create Product table in MySQL Database


class Order extends sequelize.Model{

}
Order.init({
        id: {type: sequelize.INTEGER, autoIncrement: false, primaryKey: true},
        cartOwner:{type:sequelize.STRING},
        cartOwnerID:{type: sequelize.INTEGER},
        cartTotal:{ type: sequelize.FLOAT },
        discountcodeused:{type: sequelize.STRING},
        
},
    {
        freezeTableName: true,
        timestamps: true,
        sequelize: db,
        modelName: "order",
    }
)    

module.exports = Order;