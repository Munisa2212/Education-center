const { Region } = require('../models/index.module')
const RegionValidation = require('../validation/region.valadation')
const express = require('express')
const route = express.Router()

route.get('/', async (req, res) => {
  try {
    const regions = await Region.findAll()
    res.json(regions)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

route.post('/', async (req, res) => {
  try {
    const { error } = RegionValidation.validate(req.body)
    if (error) {
      return res.status(400).json({ error: error.details[0].message })
    }
    let one = await Region.findOne({ where: { name: req.body.name } })
    if (one) {
      return res.status(400).json({ error: 'Region already exists' })
    }
    const newRegion = await Region.create(req.body)
    res.status(201).json({ newRegion })
  } catch (err) {
    console.error('Server error:', err.message)
    res.status(400).json({ error: err.message })
  }
})

route.get('/:id', async (req, res) => {
  try {
    let one = await Region.findByPk(req.params.id)
    if (!one) {
      return res.status(404).json({ error: 'Region not found' })
    }
    res.send(one)
  } catch (err) {
    console.error('Server error:', err.message)
    res.status(400).json({ error: err.message })
  }
})

route.patch('/:id', async (req, res) => {
  try {
    let one = await Region.findByPk(req.params.id)
    if (!one) {
      return res.status(404).json({ error: 'Region not found' })
    }
    await Region.update(req.body, { where: { id: req.params.id } })

    let updatedRegion = await Region.findByPk(req.params.id)
    res.status(200).json(updatedRegion)
  } catch (err) {
    console.error('Server error:', err.message)
    res.status(500).json({ error: 'Internal Server Error' })
  }
})

route.delete('/:id', async (req, res) => {
  try {
    let one = await Region.findByPk(req.params.id)
    if (!one) {
      return res.status(404).json({ error: 'Region not found' })
    }
    await Region.destroy({ where: { id: req.params.id } })
    res.status(200).json({ message: 'Region deleted successfully' })
  } catch (err) {
    console.error('Server error:', err.message)
    res.status(500).json({ error: 'Internal Server Error' })
  }
})

module.exports = route
