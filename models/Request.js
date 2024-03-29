const { Op, where } = require('sequelize');
const sequelize = require('sequelize');
const db = require('../config/DBConfig');
const Appointment = require('./Appointment');
const moment = require("moment")

class Request extends sequelize.Model {

}
Request.init({
    title: { type: sequelize.STRING, allowNull: false },
    status: { type: sequelize.STRING, allowNull: false },
    adminstatus: { type: sequelize.STRING, allowNull: false },
    userColor: { type: sequelize.STRING, allowNull: false },
    adminColor: { type: sequelize.STRING, allowNull: false },
    
},
    {
        hooks: {
            // beforeFind: async function (request) {
                
            // }
        },
        timestamps: true,
        sequelize: db,
        modelName: "request",
    }
)
module.exports = Request;