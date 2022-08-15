const sequelize = require('sequelize'); 
const db = require('../config/DBConfig');

// Create Product table in MySQL Database


class Cart extends sequelize.Model{

}
Cart.init({
        id: {type: sequelize.INTEGER, autoIncrement: false, primaryKey: true},
        // cartOwner:{type:sequelize.STRING},
        // cartOwnerID:{type: sequelize.INTEGER},
        cartTotal:{ type: sequelize.FLOAT },
        discountcodeused:{type: sequelize.STRING, allowNull: true},
        
},
    {
        freezeTableName: true,
        timestamps: true,
        sequelize: db,
        modelName: "cart",
    }
)    

module.exports = Cart;