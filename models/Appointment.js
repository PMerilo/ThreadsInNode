const sequelize = require('sequelize'); 
const db = require('../config/DBConfig');

class Appointment extends sequelize.Model{
    
}
Appointment.init({
    id:{type: sequelize.INTEGER, autoIncrement: true, primaryKey: true},
    datetime: {type:sequelize.DATE,allowNull: false},
    description: { type: sequelize.STRING(1000),allowNull: false }
},
    {
        timestamps: true,
        sequelize: db,
        modelName: "appointment",
    }
)    
module.exports = Appointment;