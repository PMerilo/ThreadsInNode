const { Op, where } = require('sequelize');
const sequelize = require('sequelize');
const db = require('../config/DBConfig');
const Appointment = require('./Appointment');
const moment = require("moment")

class RequestStatus extends sequelize.Model {

}
RequestStatus.init({
    status: { type: sequelize.STRING, allowNull: false },
    adminstatus: { type: sequelize.STRING, allowNull: false },
    userColor: { type: sequelize.STRING, allowNull: false },
    adminColor: { type: sequelize.STRING, allowNull: false },
},
    {
        timestamps: true,
        sequelize: db,
        modelName: "requestStatus",
    }
)
module.exports = RequestStatus;