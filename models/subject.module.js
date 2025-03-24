const { DataTypes } = require("sequelize")
const {db} = require("../config/db")

const Subject = db.define(
    "Subjects",
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

module.exports = Subject