"use strict";
const sequelize = require("sequelize");
const bcrypt = require("bcrypt");




const sequelizeDB = new sequelize.Sequelize(
  "threadsintimes",
  "admin69",
  "password",
  {
    host: "localhost",
    dialect: "mysql",
    port: 3306
  }
);

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
      get() {
        return this.getDataValue("name").toUpperCase();
      },
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
    role: {
      type: sequelize.DataTypes.STRING,
      allowNull: true,
      defaultValue: "C"
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
    MessagesCount: {
      type: sequelize.DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    },
    isban: {
      type: sequelize.DataTypes.STRING,
      allowNull: false,
      defaultValue: "F",
    },
  },
  {
    freezeTableName: true,
    timestamps: true,
    sequelize: sequelizeDB,
    modelName: "user",
  }
);
class Ticket extends sequelize.Model {

}
Ticket.init({
  id: { type: sequelize.INTEGER, autoIncrement: true, primaryKey: true },
  title: { type: sequelize.STRING, allowNull: false },
  description: { type: sequelize.STRING(2000), allowNull: false },
  pendingStatus: { type: sequelize.STRING, allowNull: false },
  urgency: { type: sequelize.STRING, allowNull: false },
  dateAdded: { type: sequelize.DATE, allowNull: false },
  owner: { type: sequelize.STRING, allowNull: false },
  ownerID: { type: sequelize.INTEGER, allowNull: false }

},
  {
    freezeTableName: true,
    timestamps: true,
    sequelize: sequelizeDB,
    modelName: "ticket",
  }
)

class Feedback extends sequelize.Model {

}
Feedback.init({
  id: { type: sequelize.INTEGER, autoIncrement: true, primaryKey: true },
  title: { type: sequelize.STRING, allowNull: false },
  description: { type: sequelize.STRING(2000), allowNull: false },
  rating: { type: sequelize.FLOAT, allowNull: false },
  remarks: { type: sequelize.STRING, allowNull: false },
  favouriteThing: { type: sequelize.STRING, allowNull: false },
  leastFavouriteThing: { type: sequelize.STRING, allowNull: false },
  dateAdded: { type: sequelize.DATE, allowNull: false },
  owner: { type: sequelize.STRING, allowNull: false },
  ownerID: { type: sequelize.INTEGER, allowNull: false }
},
  {
    freezeTableName: true,
    timestamps: true,
    sequelize: sequelizeDB,
    modelName: "feedback",
  }
)

class Product extends sequelize.Model {

}
Product.init({
  sku: { type: sequelize.INTEGER, autoIncrement: false, primaryKey: true },
  name: { type: sequelize.STRING },
  description: { type: sequelize.STRING(2000) },
  price: { type: sequelize.FLOAT },
  quantity: { type: sequelize.INTEGER },
  category: { type: sequelize.STRING }

},
  {
    freezeTableName: true,
    timestamps: true,
    sequelize: sequelizeDB,
    modelName: "product",
  }
)

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
    sequelize: sequelizeDB,
    modelName: "Tempuser",
  }
);

sequelizeDB
  .authenticate()
  .then((result) => console.log(result))
  .catch((err) => console.log(err));
User.sync({ alter: true })
  .then((v) => {
    console.log(v);
    console.log("Successfully altered and sync");
  })
  .catch((e) =>
    User.sync({ force: true }).then(() => {
      console.log(e);
      console.log("Created User table");
    })
  );
Ticket.sync({ alter: true })
  .then((v) => {
    console.log(v);
    console.log("Successfully altered and sync");
  })
  .catch((e) =>
    User.sync({ force: true }).then(() => {
      console.log(e);
      console.log("Created Ticket table");
    })
  );
Feedback.sync({ alter: true })
  .then((v) => {
    console.log(v);
    console.log("Successfully altered and sync");
  })
  .catch((e) =>
    User.sync({ force: true }).then(() => {
      console.log(e);
      console.log("Created Feedback table");
    })
  );
Product.sync({ alter: true })
  .then((v) => {
    console.log(v);
    console.log("Successfully altered and sync");
  })
  .catch((e) =>
    User.sync({ force: true }).then(() => {
      console.log(e);
      console.log("Created Product table");
    })
  );
TempUser.sync({ alter: true })
  .then((v) => {
    console.log(v);
    console.log("Successfully altered and sync");
  })
  .catch((e) =>
    User.sync({ force: true }).then(() => {
      console.log(e);
      console.log("Created Product table");
    })
  );
module.exports = sequelizeDB;
