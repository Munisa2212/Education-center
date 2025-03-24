const { db } = require('../config/db')
const { DataTypes } = require('sequelize')

const Region = db.define('Region', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
})

module.exports = Region
