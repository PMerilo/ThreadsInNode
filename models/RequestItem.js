const { Op, where } = require('sequelize');
const sequelize = require('sequelize');
const db = require('../config/DBConfig');
const Appointment = require('./Appointment');
const moment = require("moment")

class RequestItem extends sequelize.Model {

}
RequestItem.init({
    name: { type: sequelize.STRING, allowNull: false },
    description: { type: sequelize.STRING, allowNull: false },
    type: { type: sequelize.STRING, allowNull: false },
    color: { type: sequelize.STRING},
    qty: { type: sequelize.INTEGER, allowNull: false, defaultValue: 1 },

    head: { type: sequelize.FLOAT },
    neck: { type: sequelize.FLOAT },
    bust: { type: sequelize.FLOAT },
    underBust: { type: sequelize.FLOAT },
    waist: { type: sequelize.FLOAT },
    arm: { type: sequelize.FLOAT },
    hip: { type: sequelize.FLOAT },
    hand: { type: sequelize.FLOAT },
    inseam: { type: sequelize.FLOAT },
    height: { type: sequelize.FLOAT },
},
    {
        timestamps: true,
        sequelize: db,
        modelName: "requestitem",
    }
)
module.exports = RequestItem;