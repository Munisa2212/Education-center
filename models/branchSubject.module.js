const { DataTypes } = require("sequelize")
const {db} = require("../config/db")

const BranchSubject = db.define("BranchSubject",{
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    }
},{timestamps: false})

module.exports = BranchSubject