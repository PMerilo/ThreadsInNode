const sequelize = require('sequelize'); 
const db = require('../config/DBConfig');

// Create Product table in MySQL Database


class Wishlist extends sequelize.Model{

}
Wishlist.init({
        id:{type: sequelize.BIGINT, autoIncrement: false, primaryKey: true},
        Owner:{type:sequelize.STRING},
        OwnerID:{type: sequelize.INTEGER}
},
    {
        freezeTableName: true,
        timestamps: true,
        sequelize: db,
        modelName: "wishlist",
    }
)    

module.exports = Wishlist;