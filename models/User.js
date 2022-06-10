const sequelize = require('sequelize'); 
const db = require('../config/DBConfig.js');
const bcrypt = require("bcrypt");

class User extends sequelize.Model {
    compareHash(val) {
      return bcrypt.compareSync(val, this.getDataValue("password"));
    }
  }
  
  User.init(
    {
      id: {
        type: sequelize.DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
  
      },
      name: {
        type: sequelize.DataTypes.STRING,
        allowNull: false,
        unique: true,
        
      },
      email: {
        type: sequelize.DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
      gender: {
        type: sequelize.DataTypes.STRING,
        allowNull: false,
      },
      phoneNumber: {
        type: sequelize.DataTypes.STRING(8),
        allowNull: true,
      },
      password: {
        type: sequelize.DataTypes.STRING,
        allowNull: false,
        set(value) {
          const hash = bcrypt.hashSync(value, 10) + "";
          this.setDataValue("password", hash);
        },
      },
      updatedAt: {
        type: sequelize.DataTypes.DATE,
        allowNull: false,
      },
      createdAt: {
        type: sequelize.DataTypes.DATE,
        allowNull: false,
      },
    },
    {
      freezeTableName: true,
      timestamps: true,
      sequelize: db,
      modelName: "user",
    }
  );

module.exports = User;