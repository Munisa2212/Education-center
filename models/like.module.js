const { DataTypes } = require("sequelize")
const {db} = require("../config/db")

const Like = db.define(
    "Likes",
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        user_id: {
            type: DataTypes.INTEGER
        },
        learningCenter_id: {
            type: DataTypes.INTEGER
        }
    },{timestamps: false}
)

module.exports = Like