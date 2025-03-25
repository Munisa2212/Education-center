const { Branch } = require('../models/index.module')
const Branch_valadation = require('../validation/branch.valadation')
const express = require('express')
const route = express()

route.get('/', async (req, res) => {
  try {
    const branches = await Branch.findAll()
    res.json(branches)
  } catch (error) {
    console.log(error)
    res.status(400).send({ message: error.message })
  }
})

route.post('/', async (req, res) => {
  try {
    const { error } = Branch_valadation.validate(req.body)
    if (error)
      return res.status(400).send({ message: error.message })
    let NewBranch = await Branch.create(req.body)
    res.status(201).send({ NewBranch })
  } catch (err) {
    console.log(err)
    return res.status(400).json({ message: err.message })
  }
})

route.get('/:id', async (req, res) => {
  try {
    let one = await Branch.findByPk(req.params.id)
    if (!one) return res.status(404).send({ message: 'Not found' })
    res.send(one)
  } catch (err) {
    console.log(err)
    return res.status(400).json({ message: err.message })
  }
})

route.patch('/:id', async (req, res) => {
  try {
    let one = await Branch.findByPk(req.params.id)
    if (!one) {
      return res.status(404).json({ message: 'Not found' })
    }

    let updatedBranch = await one.update(req.body, {
      fields: Object.keys(req.body),
    })
    res.send(updatedBranch)
  } catch (err) {
    console.error(err)
    return res.status(400).json({ message: err.message })
  }
})

route.delete('/:id', async (req, res) => {
  try {
    let one = await Branch.findByPk(req.params.id)
    if (!one) return res.status(404).send({ message: 'Not found' })
    await one.destroy()
    res.send({ message: 'Deleted successfully' })
  } catch (err) {
    console.log(err)
    return res.status(400).json({ message: err.message })
  }
})

module.exports = route
