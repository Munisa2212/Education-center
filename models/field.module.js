const { DataTypes } = require("sequelize")
const {db} = require("../config/db")

const Field = db.define(
    "Fields",
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
    }
)

module.exports = Field