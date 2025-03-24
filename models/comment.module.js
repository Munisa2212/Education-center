const {db} = require("../config/db")
const { DataTypes } = require("sequelize")

const Comment = db.define('Comment', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    comment: {
        type: DataTypes.STRING,
        allowNull: false
    },
    user_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    star: {
        type: DataTypes.FLOAT,
        allowNull: false
    },
    learningCenter_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    }
})

module.exports = Comment