const sequelize = require('sequelize'); 
const db = require('../config/DBConfig');

// Create Product table in MySQL Database


class Order extends sequelize.Model{

}
Order.init({
        id: {type: sequelize.INTEGER, autoIncrement: true, primaryKey: true},
        orderUUID: {type: sequelize.STRING,},
        orderOwnerID:{type: sequelize.INTEGER},
        orderOwnerName:{type: sequelize.STRING},
        orderTotal:{ type: sequelize.FLOAT },
        discountcodeused:{type: sequelize.STRING},
        orderStatus:{type: sequelize.STRING},
        address:{type: sequelize.STRING},
        unit_number:{type: sequelize.STRING},
        postal_code:{type: sequelize.INTEGER},
        phone_number:{type: sequelize.INTEGER},
        email:{type: sequelize.STRING}
},
    {
        freezeTableName: true,
        timestamps: true,
        sequelize: db,
        modelName: "order",
    }
)    

module.exports = Order;