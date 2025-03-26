const { DataTypes } = require("sequelize")
const {db} = require("../config/db")

const Registration = db.define(
    "Registrations",
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        learningCenter_id: {
            type: DataTypes.INTEGER
        },
        branch_id: {
            type: DataTypes.INTEGER
        },
        user_id: {
            type: DataTypes.INTEGER
        },
        date: {
            type: DataTypes.DATE
        }
    },{timestamps: false}
)

module.exports = Registration