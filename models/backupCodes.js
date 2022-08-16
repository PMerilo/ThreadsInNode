const sequelize = require('sequelize'); 
const db = require('../config/DBConfig');



// Create feedback table in MySQL Database
class BackupCode extends sequelize.Model{
    
}
BackupCode.init({
    id:{type: sequelize.INTEGER, autoIncrement: true, primaryKey: true}, 
    code:{type:sequelize.INTEGER},
    owner: {type: sequelize.STRING,allowNull: false},
    ownerID:{type: sequelize.INTEGER, allowNull:false}
},
    {
        freezeTableName: true,
        timestamps: true,
        sequelize: db,
        modelName: "backupcode",
    }
)    
module.exports = BackupCode;