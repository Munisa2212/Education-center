const { DataTypes } = require("sequelize")
const {db} = require("../config/db")

const CenterSubject = db.define("CenterSubject", {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    }
},{timestamps: false})

module.exports = CenterSubject