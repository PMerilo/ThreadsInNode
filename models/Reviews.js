const sequelize = require('sequelize'); 
const db = require('../config/DBConfig');

// Create Review table in MySQL Database


class Review extends sequelize.Model{

}
Review.init({
        title: { type: sequelize.STRING }, 
        description: { type: sequelize.STRING(2000) }, 
        stars: { type: sequelize.INTEGER},
},
    {
        freezeTableName: true,
        timestamps: true,
        sequelize: db,
        modelName: "review",
    }
)    

module.exports = Review;