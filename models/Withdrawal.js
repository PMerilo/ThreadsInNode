const sequelize = require('sequelize'); 
const db = require('../config/DBConfig');

// Create Withdrawal table in MySQL Database


class Withdrawal extends sequelize.Model{

}
Withdrawal.init({
        id:{type: sequelize.INTEGER, autoIncrement: true, primaryKey: true},
        sellerID:{type: sequelize.INTEGER},
        withdrawal_amount:{ type: sequelize.FLOAT},
        authorization_by:{type: sequelize.STRING,allowNull: true},
        authorizee_id:{type: sequelize.INTEGER,allowNull: true},
        status:{ type: sequelize.STRING}
},
    {
        freezeTableName: true,
        timestamps: true,
        sequelize: db,
        modelName: "withdrawal",
    }
)    

module.exports = Withdrawal;