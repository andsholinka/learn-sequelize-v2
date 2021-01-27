const {
    Sequelize
} = require('sequelize');
// const sequelize = require('sequelize');
const db = require("../config/db");

const User = db.define(
    "User", {
        user_id: {
            allowNull: false,
            autoIncrement: true,
            primaryKey: true,
            type: Sequelize.INTEGER
        },
        username: {
            unique: true,
            type: Sequelize.STRING
        },
        email: {
            unique: true,
            type: Sequelize.STRING
        },
        name: {
            type: Sequelize.STRING
        },
        hashed_password: {
            type: Sequelize.STRING
        },
    }, {}
);

User.removeAttribute('id');
User.associate = function (models) {
    // associations can be defined here
    User.belongsTo(models.Token, {
        foreignKey: 'user_id',
        as: 'token'
    })
};

module.exports = User;