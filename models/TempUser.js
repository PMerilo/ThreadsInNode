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
      },
      backupcode1: {
        type: sequelize.DataTypes.STRING,
        allowNull: false,
      },
      backupcode2: {
        type: sequelize.DataTypes.STRING,
        allowNull: false,
      },
      backupcode1check: {
        type: sequelize.DataTypes.STRING,
        allowNull: false,
      },
      backupcode2check: {
        type: sequelize.DataTypes.STRING,
        allowNull: false,
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