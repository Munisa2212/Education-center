const { Branch } = require('../models/index.module')
const Branch_valadation = require('../validation/branch.valadation')
const express = require('express')
const route = express()

route.get('/', async (req, res) => {
  try {
    const branches = await Branch.findAll()
    res.json(branches)
  } catch (error) {
    res.status(400).send({ message: error.message })
  }
})

route.post('/', async (req, res) => {
  try {
    const { error } = Branch_valadation.validate(req.body)
    if (error)
      return res.status(400).send({ message: error.details[0].message })
    let NewBranch = await Branch.create(req.body)
    res.status(201).send({ NewBranch })
  } catch (err) {
    console.log(err)
  }
})

route.get('/:id', async (req, res) => {
  try {
    let one = await Branch.findByPk(req.params.id)
    if (!one) return res.status(404).send({ message: 'Not found' })
    res.send(one)
  } catch (err) {
    res.status(400).send({ message: error.message })
    console.log(err)
    return
  }
})
