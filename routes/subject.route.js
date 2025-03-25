const Subject = require('../models/subject.module')
const express = require('express')
const SubjectValidation = require('../validation/subject.validation')
const route = express.Router()

route.get('/', async (req, res) => {
  try {
    let subject = await Subject.findAll()
    res.send(subject)
  } catch (err) {
    res.status(500).send({ message: err.message })
    console.log(err)
  }
})

route.post('/', async (req, res) => {
  try {
    const { error } = SubjectValidation.validate(req.body)
    if (error) {
      return res.status(400).send({ message: error.details[0].message })
    }
    let subject = await Subject.create(req.body)
    res.status(201).send(subject)
  } catch (err) {
    console.log(err)
  }
})

route.get('/:id', async (req, res) => {
  try {
    let one = await Subject.findByPk(req.params.id)
    if (!one) {
      return res.status(404).send({ message: 'Subject not found' })
    }
    res.send(one)
  } catch (err) {
    res.status(500).send({ message: err.message })
    console.log(err)
    return
  }
})

route.patch('/:id', async (req, res) => {
  try {
    let one = await Subject.findByPk(req.params.id)
    if (!one) {
      return res.status(404).send({ message: 'Subject not found' })
    }
    let updatedSubject = await one.update(req.body)
    res.send(updatedSubject)
  } catch (err) {
    console.log(err)
    return res.status(400).send({ message: err.message })
  }
})
route.delete('/:id', async (req, res) => {
  try {
    let one = await Subject.findByPk(req.params.id)
    if(!one){
        return res.status(404).send({message: "Subject not found"})
    }
    await one.destroy()
    res.send({ message: 'Deleted successfully' });
  } catch (err) {
    console.log(err)
    return res.status(400).send({ message: err.message })
  }
})

module.exports = route