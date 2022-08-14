const sequelize = require('sequelize');
const db = require('../config/DBConfig');
const User = require('./User');
const Chat = require('./Chat');

class ChatUser extends sequelize.Model {

}
ChatUser.init({
    userId: { type: sequelize.INTEGER, references: { model: User, key: 'id' } },
    chatId: { type: sequelize.INTEGER, references: { model: Chat, key: 'id' } },
    type: { type: sequelize.ENUM('Request', 'Seller'), allowNull: false },
},
    {
        freezeTableName: true,
        sequelize: db,
        modelName: "chatuser",
        indexes: [
            {
                name: 'type',
                unique: true,
                fields: ['type', 'chatId', 'userId']
            },
        ]
    }
)

module.exports = ChatUser;