const sequelize = require('sequelize');
const db = require('../config/DBConfig');

class Chat extends sequelize.Model {

}
Chat.init({
    open: { type: sequelize.BOOLEAN, allowNull: false, defaultValue: true },
},
    {
        timestamps: true,
        sequelize: db,
        modelName: "chat",        
    }
)


module.exports = Chat;