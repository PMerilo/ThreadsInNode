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
      profilepic: {
        type: sequelize.DataTypes.STRING,
        allowNull: true,
      },
      name: {
        type: sequelize.DataTypes.STRING,
        allowNull: false,
        unique: 'name',
        
      },
      email: {
        type: sequelize.DataTypes.STRING,
        allowNull: false,
        unique: 'email',
      },
      gender: {
        type: sequelize.DataTypes.STRING,
        allowNull: true
      },
      phoneNumber: {
        type: sequelize.DataTypes.STRING(8),
        allowNull: true,
      },
      bankName: {
        type: sequelize.DataTypes.STRING,
        allowNull: true,
      },
      bankAccount: {
        type: sequelize.DataTypes.STRING,
        allowNull: true,
      },
      role: {
        type: sequelize.DataTypes.STRING,
        allowNull: true,
        defaultValue: "C"
      },
      password: {
        type: sequelize.DataTypes.STRING,
        set(value) {
          if(value){
            const hash = bcrypt.hashSync(value, 10) + "";
            this.setDataValue("password", hash);
          }
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
      MessagesCount: {
        type: sequelize.DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0
      },
      spools: {
        type: sequelize.DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0
      },
      newsLetter: {
        type: sequelize.DataTypes.INTEGER,
        defaultValue: false
      },
      isban: {
        type: sequelize.DataTypes.STRING,
        allowNull: false,
        defaultValue: "F",
      },
      total_balance: {
        type: sequelize.DataTypes.FLOAT,
        allowNull: false,
        defaultValue: 0,
      },
      withdrawn_amount: {
        type: sequelize.DataTypes.FLOAT,
        allowNull: false,
        defaultValue: 0,
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