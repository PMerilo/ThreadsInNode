const sequelize = require('sequelize'); 
const db = require('../config/DBConfig');



// Create feedback table in MySQL Database
class Report extends sequelize.Model{
    
}
Report.init({
    id:{type: sequelize.INTEGER, autoIncrement: true, primaryKey: true},
    reportName: { type: sequelize.STRING,allowNull: false }, 
    reportType: { type: sequelize.STRING,allowNull: false }, 
    url: { type: sequelize.STRING,allowNull: false },
    tags:{ type: sequelize.STRING,allowNull: false },
    date: { type: sequelize.DATE,allowNull: false },
    
},
    {
        freezeTableName: true,
        timestamps: true,
        sequelize: db,
        modelName: "report",
    }
)    
module.exports = Report;