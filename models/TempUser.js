const sequelize = require('sequelize'); 
const db = require('../config/DBConfig.js');
const bcrypt = require("bcrypt");

class TempUser extends sequelize.Model {
  }
  
  TempUser.init(
    {
      email: {
        type: sequelize.DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
    },
    {
      freezeTableName: true,
      timestamps: true,
      sequelize: db,
      modelName: "Tempuser",
    }
  );

module.exports = TempUser;