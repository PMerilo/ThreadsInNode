const sequelize = require('sequelize'); 
const db = require('../config/DBConfig');
// Required for file upload 
const fs = require('fs'); 
const upload = require('../views/helpers/imageUpload');
// Create ticket table in MySQL Database
class Survey extends sequelize.Model{
    
}
Survey.init({
    id:{type: sequelize.INTEGER, autoIncrement: true, primaryKey: true},
    age: { type: sequelize.STRING,allowNull: false },
    occupation: { type: sequelize.STRING,allowNull: false },
    Features: {type:sequelize.INTEGER,allowNull: false},
    customerSupport: {type:sequelize.INTEGER,allowNull: false},
    design : {type:sequelize.INTEGER,allowNull: false},
    userCustomisation: {type:sequelize.INTEGER,allowNull: false},
},
    {
        freezeTableName: true,
        timestamps: true,
        sequelize: db,
        modelName: "survey",
    }
)


module.exports = Survey;