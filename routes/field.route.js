const { Field } = require('../models/index.module')
const FieldValidation = require('../validation/field.validation')
const express = require('express')
const route = express.Router()

route.get('/', async (req, res) => {
  try {
    const fields = await Field.findAll()
    res.send(fields)
  } catch (err) {
    console.log(err)
    return res.status(400).send({ message: err.message })
  }
})

route.post('/', async (req, res) => {
  try {
    const { error } = FieldValidation.validate(req.body)
    if (error)
      return res.status(400).send({ message: error.details[0].message })
    let newField = await Field.create(req.body)
    res.status(201).send(newField)
  } catch (err) {
    console.log(err)
    return res.status(400).send({ message: err.message })
  }
})

route.get('/:id', async (req, res) => {
  try {
    let one = await Field.findByPk(req.params.id)
    if (!one) {
      return res.status(404).send({ message: 'Field not found' })
    }
    res.send(one)
  } catch (err) {
    console.log(err)
    return res.status(400).send({ message: err.message })
  }
})

route.patch('/:id', async (req, res) => {
  try {
    let one = await Field.findByPk(req.params.id)
    if (!one) {
      return res.status(404).json({ message: 'Field not found' })
    }

    let updatedField = await one.update(req.body, {
      fields: Object.keys(req.body),
    })

    res.status(200).json(updatedField)
  } catch (err) {
    console.error(err)
    res.status(400).json({ message: 'Internal Server Error' })
  }
})

route.delete('/:id', async (req, res) => {
  try {
    let one = await Field.findByPk(req.params.id)
    if (!one) {
      return res.status(404).send({ message: 'Field not found' })
    }
    await one.destroy()
  } catch (err) {
    console.log(err)
    return res.status(400).send({ message: err.message })
  }
})

module.exports = route
