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
  learningCentre_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  field_id: {
    type: DataTypes.ARRAY,
    allowNull: false,
  },
  subject_id: {
    type: DataTypes.ARRAY,
    allowNull: false,
  },
})

module.exports = Branch
