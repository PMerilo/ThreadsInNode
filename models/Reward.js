const sequelize = require('sequelize'); 
const db = require('../config/DBConfig');

// Create Product table in MySQL Database


class Reward extends sequelize.Model{

}
Reward.init({
        id:{type: sequelize.BIGINT, autoIncrement: true, primaryKey: true},
        name: { type: sequelize.STRING }, 
        voucher_code: { type: sequelize.STRING }, 
        description: { type: sequelize.STRING(2000) }, 
        spools_needed: { type: sequelize.INTEGER }, 
        discount_amount: { type: sequelize.INTEGER }, 
        quantity: {type: sequelize.INTEGER},
        expiry_date:{type:sequelize.DATEONLY}
},
    {
        freezeTableName: true,
        timestamps: true,
        sequelize: db,
        modelName: "reward",
    }
)    

module.exports = Reward;