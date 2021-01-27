const sequelize = require('sequelize');

const db = new sequelize("users_resource", "root", "", {
    dialect: "mysql"
});

db.sync({});

module.exports = db;