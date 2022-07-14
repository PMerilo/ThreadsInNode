const sequelize = require('sequelize'); 
const db = require('../config/DBConfig');

class Appointment extends sequelize.Model{
    
}
Appointment.init({
    date: {type:sequelize.DATEONLY,allowNull: false},
    time: {type:sequelize.TIME,allowNull: false},
    description: { type: sequelize.STRING(1000),allowNull: false }
},
    {
        timestamps: true,
        sequelize: db,
        modelName: "appointment",
    }
)    
module.exports = Appointment;