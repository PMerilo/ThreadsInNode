const sequelize = require('sequelize'); 
const db = require('../../config/DBConfig');
// Required for file upload 
const fs = require('fs'); 

// Create Joined Users Log table in MySQL Database
class NewsLetterLog extends sequelize.Model{
    
}
NewsLetterLog.init({
    id:{type: sequelize.INTEGER, autoIncrement: true, primaryKey: true},
    date: { type: sequelize.DATE,allowNull: false }, 
    description: { type: sequelize.STRING,allowNull: false }, 
    noOfUsersJoined: { type: sequelize.INTEGER,allowNull: false }, 
    
},
    {
        freezeTableName: true,
        timestamps: true,
        sequelize: db,
        modelName: "NewsLetterLog",
    }
)


module.exports = NewsLetterLog;