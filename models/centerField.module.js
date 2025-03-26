const { DataTypes } = require("sequelize")
const {db} = require("../config/db")

const CenterField = db.define("CenterField", {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    }
},{timestamps: false})

module.exports = CenterField