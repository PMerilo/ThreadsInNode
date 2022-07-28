const { Op, where } = require('sequelize');
const sequelize = require('sequelize');
const db = require('../config/DBConfig');
const Appointment = require('./Appointment');
const moment = require("moment")

class Request extends sequelize.Model {

}
Request.init({
    title: { type: sequelize.STRING, allowNull: false },
    description: { type: sequelize.STRING(1000) },
    statusCode: { type: sequelize.INTEGER, allowNull: false, defaultValue: 1 },
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