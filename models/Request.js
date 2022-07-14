const sequelize = require('sequelize'); 
const db = require('../config/DBConfig');

class Request extends sequelize.Model{
    
}
Request.init({
    title:{type: sequelize.STRING,allowNull: false},
    tailorID: {type:sequelize.INTEGER,allowNull: false},
    description:{type: sequelize.STRING(1000)},
    status:{type: sequelize.STRING, allowNull: false, defaultValue: "Pending Appointment Booking"},
    
},
    {
        timestamps: true,
        sequelize: db,
        modelName: "request",
    }
)    
module.exports = Request;