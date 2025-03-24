const { DataTypes } = require("sequelize")
const {db} = require("../config/db")

const Resource = db.define(
    "Resources",
    {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        name: {
            type: DataTypes.STRING
        },
        user_id: {
            type: DataTypes.INTEGER
        },
        image: {
            type: DataTypes.STRING
        }
    }
)