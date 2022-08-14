const sequelize = require('sequelize');
const db = require('../config/DBConfig');

class Chat extends sequelize.Model {

}
Chat.init({
    open: { type: sequelize.BOOLEAN, allowNull: false, defaultValue: true },
    livechat: { type: sequelize.BOOLEAN, allowNull: false, defaultValue: false },
    liveId: { type: sequelize.STRING, allowNull: true }
},
    {
        timestamps: true,
        sequelize: db,
        modelName: "chat",
    }
)


module.exports = Chat;