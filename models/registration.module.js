const { DataTypes } = require("sequelize")
const {db} = require("../config/db")

const Registeration = db.define(
    "Registerations",
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
    }
)

module.exports = Registeration