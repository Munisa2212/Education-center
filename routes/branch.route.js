const { Branch , Center, Region, Field, Subject} = require('../models/index.module')
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
    let region= await Region.findByPk(region_id)
    const { error } = Branch_valadation.validate(req.body)
    if (error) return res.status(400).send({ message: error.details[0].message })

    let {learningCenter_id, region_id, field_id, subject_id} = req.body

    let center= await Center.findByPk(learningCenter_id)
    if (!center) return res.status(404).send({ message: 'Center not found' })
    
    if (!region) return res.status(404).send({ message: 'Region not found' })
    
    for (let i = 0; i < subject_id.length; i++) {
      let subject= await Subject.findByPk(subject_id[i])
      if (!subject) return res.status(404).send({ message: `Subject with ${e} id not found` })
    }
  
    for (let i = 0; i < field_id.length; i++) {
      let field= await Field.findByPk(field_id[i])
      if (!field) return res.status(404).send({ message: `Field with ${e} id not found` })
      }

    center.update({branch_number: center.branch_number + 1})

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
