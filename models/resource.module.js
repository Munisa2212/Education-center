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
        },
        description: {
            type: DataTypes.STRING
        },
        category_id: {
            type: DataTypes.INTEGER
        },
        file: {
            type: DataTypes.STRING
        },
        link: {
            type: DataTypes.STRING
        }
    },{timestamps: false}
)

module.exports = Resource