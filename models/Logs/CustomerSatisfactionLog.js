const sequelize = require('sequelize'); 
const db = require('../../config/DBConfig');
// Required for file upload 
const fs = require('fs'); 

// Create Joined Users Log table in MySQL Database
class CustomerSatisfactionLog extends sequelize.Model{
    
}
CustomerSatisfactionLog.init({
    id:{type: sequelize.INTEGER, autoIncrement: true, primaryKey: true},
    date: { type: sequelize.DATE,allowNull: false }, 
    description: { type: sequelize.STRING,allowNull: false }, 
    rating: { type: sequelize.STRING,allowNull: false }, 
    remarks: { type: sequelize.STRING,allowNull: false },

},
    {
        freezeTableName: true,
        timestamps: true,
        sequelize: db,
        modelName: "CustomerSatisfactionLog",
    }
)


module.exports = CustomerSatisfactionLog;