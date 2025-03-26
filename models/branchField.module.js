const { DataTypes } = require("sequelize")
const {db} = require("../config/db")

const BranchField = db.define("BranchField", {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    }
},{timestamps: false})

module.exports = BranchField