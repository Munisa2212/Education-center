const { Branch, Center } = require('../models/index.module')
const Branch_valadation = require('../validation/branch.valadation')
const express = require('express')
const route = express()

/**
 * @swagger
 * tags:
 *   name: Branch
 *   description: Branch management API
 */

/**
 * @swagger
 * /branch:
 *   get:
 *     summary: Get all branches
 *     tags: [Branch]
 *     responses:
 *       200:
 *         description: List of all branches
 *       400:
 *         description: Bad request
 */
route.get('/', async (req, res) => {
  try {
    const branches = await Branch.findAll()
    res.json(branches)
  } catch (error) {
    console.log(error)
    res.status(400).send({ message: error.message })
  }
})

/**
 * @swagger
 * /branch:
 *   post:
 *     summary: Create a new branch
 *     tags: [Branch]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - phone
 *               - location
 *               - region_id
 *               - learningCentre_id
 *               - field_id
 *               - subject_id
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Central Branch"
 *               phone:
 *                 type: string
 *                 example: "+998901234567"
 *               image:
 *                 type: string
 *                 example: "https://example.com/image.jpg"
 *               location:
 *                 type: string
 *                 example: "Tashkent, Uzbekistan"
 *               region_id:
 *                 type: integer
 *                 example: 2
 *               learningCentre_id:
 *                 type: integer
 *                 example: 1
 *               field_id:
 *                 type: array
 *                 items:
 *                   type: integer
 *                 example: [1, 2, 3]
 *               subject_id:
 *                 type: array
 *                 items:
 *                   type: integer
 *                 example: [4, 5]
 *     responses:
 *       201:
 *         description: Branch created successfully
 *       400:
 *         description: Bad request
 */
route.post('/', async (req, res) => {
  try {
    const { error } = Branch_valadation.validate(req.body)
    if (error)
      return res.status(400).send({ message: error.details[0].message })

    let { learningCentre_id, region_id } = req.body

    let center = await Center.findByPk(learningCentre_id)
    if (!center) return res.status(404).send({ message: 'Center not found' })

    let region = await Region.findByPk(region_id)
    if (!region) return res.status(404).send({ message: 'Region not found' })

    let NewBranch = await Branch.create(req.body)

    res.status(201).send({ NewBranch })
  } catch (err) {
    console.log(err)
    return res.status(400).json({ message: err.message })
  }
})

/**
 * @swagger
 * /branch/{id}:
 *   get:
 *     summary: Get a branch by ID
 *     tags: [Branch]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Branch ID
 *     responses:
 *       200:
 *         description: Branch details
 *       404:
 *         description: Branch not found
 */
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

/**
 * @swagger
 * /branch/{id}:
 *   patch:
 *     summary: Update a branch
 *     tags: [Branch]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Branch ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Updated Branch"
 *               phone:
 *                 type: string
 *                 example: "+998901234567"
 *               location:
 *                 type: string
 *                 example: "Samarkand, Uzbekistan"
 *     responses:
 *       200:
 *         description: Branch updated successfully
 *       404:
 *         description: Branch not found
 */
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

/**
 * @swagger
 * /branch/{id}:
 *   delete:
 *     summary: Delete a branch
 *     tags: [Branch]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Branch ID
 *     responses:
 *       200:
 *         description: Branch deleted successfully
 *       404:
 *         description: Branch not found
 */
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
