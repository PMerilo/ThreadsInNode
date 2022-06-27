const sequelize = require('sequelize'); 
const db = require('../config/DBConfig');

class Request extends sequelize.Model{
    
}
Request.init({
    id:{type: sequelize.INTEGER, autoIncrement: true, primaryKey: true},
    title:{type: sequelize.STRING,allowNull: false},
    fName: { type: sequelize.STRING,allowNull: false }, 
    lName: { type: sequelize.STRING,allowNull: false }, 
    email: {type: sequelize.STRING,allowNull: false},
    service: {type:sequelize.STRING,allowNull: false},
    tailorID: {type:sequelize.INTEGER,allowNull: false},
    description:{type: sequelize.STRING(1000)},
    status:{type: sequelize.STRING},
    
},
    {
        freezeTableName: true,
        timestamps: true,
        sequelize: db,
        modelName: "Request",
    }
)    
module.exports = Request;