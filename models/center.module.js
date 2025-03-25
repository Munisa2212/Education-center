const { DataTypes } = require("sequelize")
const {db} = require("../config/db")

const Center = db.define(
    "Centers",
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        image: {
            type: DataTypes.STRING
        },
        name: {
            type: DataTypes.STRING
        },
        phone: {
            type: DataTypes.STRING
        },
        location: {
            type: DataTypes.STRING
        },
        region_id: {
            type: DataTypes.INTEGER
        },
        branch_number: {
            type: DataTypes.INTEGER,
            defaultValue: 0
        },
        ceo_id: {
            type: DataTypes.INTEGER
        },
        description: {
            type: DataTypes.STRING
        },
        subject_id: {
            type: DataTypes.STRING,
            allowNull: false
        },
        field_id: {
            type: DataTypes.STRING,
            allowNull: false
        }
    }
)

module.exports = Center