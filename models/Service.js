const sequelize = require('sequelize'); 
const db = require('../config/DBConfig');

class Service extends sequelize.Model{
    
}
Service.init({
    name:{type: sequelize.STRING,allowNull: false},
    
},
    {
        timestamps: false,
        sequelize: db,
        modelName: "service",
    }
)    
module.exports = Service;