const { db } = require('../config/db')
const { DataTypes } = require('sequelize')

const Branch = db.define('Branch', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  phone: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  image: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  location: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  region_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  learningCenter_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
},{timestamps: false})

module.exports = Branch
