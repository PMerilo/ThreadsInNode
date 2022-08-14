const sequelize = require('sequelize');
const db = require('../config/DBConfig');
const moment = require('moment');
const { Op } = require('sequelize');

class Appointment extends sequelize.Model {

}
Appointment.init({
    datetime: {
        type: sequelize.DATE,
        get() {
            return moment(this.getDataValue('datetime'))
        },
    },
    date: {
        type: sequelize.VIRTUAL,
        get() {
            return this.datetime.format('YYYY-MM-DD');
        },
        set(value) {
            throw new Error('Do not try to set the `date` value!');
        }
    },
    time: {
        type: sequelize.VIRTUAL,
        get() {
            return this.datetime.format('HH:mm:ss');
        },
        set(value) {
            throw new Error('Do not try to set the `time` value!');
        }
    },
    datetimeHuman: {
        type: sequelize.VIRTUAL,
        get() {
            let datetime = moment(`${this.date} ${this.time}`, "YYYY-MM-DD HH:mm:ss")
            return datetime.format("Do MMMM YYYY, h:mm a");
        },
        set(value) {
            throw new Error('Do not try to set the `datetime` value!');
        }
    },
    description: { type: sequelize.STRING(1000), allowNull: false },
    confirmed: { type: sequelize.BOOLEAN, defaultValue: null},

},
    {
        // defaultScope: {
        //     where: {
        //         datetime: {
        //             [Op.gte]: moment()
        //         }
        //     }
        // },
        indexes: [
            {
                name: 'apptKey',
                unique: true,
                fields: ['datetime', 'tailorId', 'confirmed']
            }
        ],
        timestamps: true,
        sequelize: db,
        modelName: "appointment",
    }
)
module.exports = Appointment;