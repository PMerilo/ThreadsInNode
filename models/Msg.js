const sequelize = require('sequelize');
const db = require('../config/DBConfig');

class Msg extends sequelize.Model {

}
Msg.init({
    content: { type: sequelize.STRING, allowNull: false },
    seen: { type: sequelize.BOOLEAN, allowNull: false, defaultValue: false }
},
    {
        timestamps: true,
        sequelize: db,
        modelName: "msg",
    }
)


module.exports = Msg;