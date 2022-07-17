const sequelize = require('sequelize');
const db = require('../config/DBConfig');

class Tailor extends sequelize.Model {

}
Tailor.init({
    rating: { type: sequelize.DECIMAL, allowNull: false, defaultValue: 0 },

},
    {
        timestamps: true,
        sequelize: db,
        modelName: "tailor",
        indexes: [
            {
                unique: true,
                fields: ["userId"],

            },
        ],
    }
)
module.exports = Tailor;