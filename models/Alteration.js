const { Op, where } = require('sequelize');
const sequelize = require('sequelize');
const db = require('../config/DBConfig');
const Appointment = require('./Appointment');
const moment = require("moment")

class Alteration extends sequelize.Model {

}
Alteration.init({
    title: { type: sequelize.STRING, allowNull: false },
    description: { type: sequelize.STRING(1000) },
    image: {type: sequelize.STRING},
    statusCode: { type: sequelize.ENUM('In Progress', 'Ready for pick up on'), allowNull: false, defaultValue: 'In Progress' },
},
    {
        hooks: {
            // beforeFind: async function (request) {
                
            // }
        },
        timestamps: true,
        sequelize: db,
        modelName: "alteration",
    }
)
module.exports = Alteration;