const { db } = require('../config/db')
const { DataTypes } = require('sequelize')

const Category = db.define(
    "Categories",
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        name: {
            type: DataTypes.STRING
        },
        image: {
            type: DataTypes.STRING
        }
    },{timestamps: false}
)

module.exports = Category