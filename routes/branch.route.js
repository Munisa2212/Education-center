const { Branch, Center, Region, Field, Subject } = require('../models/index.module')
const Branch_validation = require('../validation/branch.valadation')
const express = require('express')
const route = express.Router()

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
    console.error("Error in GET /branch:", error)
    res.status(400).send({ message: error.message })
  }
})

route.get("/search", async (req, res) => {
  try {
    let { name, phone, location, region_id, learningCentre_id, field_id, subject_id } = req.query;
    const where = {}

    if (name) where.name = { [Op.like]: `%${name}%` }
    if (phone) where.phone = { [Op.like]: `%${phone}%` }
    if (location) where.location = { [Op.like]: `%${location}%` }
    if (region_id) where.region_id = region_id
    if (learningCentre_id) where.learningCentre_id = learningCentre_id
    if (field_id) where.field_id = field_id
    if (subject_id) where.subject_id = subject_id

    let branches = await Branch.findAll({ where });
    res.send(branches);
  } catch (error) {
    res.status(400).send(error)
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
    const { name, phone, image, location, region_id, learningCentre_id, field_id, subject_id } = req.body
    
    if (!learningCentre_id) return res.status(400).send({ message: 'learningCentre_id is required' });
    if (!Array.isArray(subject_id) || subject_id.length === 0) return res.status(400).send({ message: 'subject_id must be a non-empty array' });
    if (!Array.isArray(field_id) || field_id.length === 0) return res.status(400).send({ message: 'field_id must be a non-empty array' });

    const { error } = Branch_validation.validate(req.body)
    if (error) return res.status(400).send({ message: error.details[0].message })

    let center = await Center.findByPk(learningCentre_id)
    if (!center) return res.status(404).send({ message: 'Center not found' })

    let region = await Region.findByPk(region_id)
    if (!region) return res.status(404).send({ message: 'Region not found' })

    for (let id of subject_id) {
      let subject = await Subject.findByPk(id)
      if (!subject) return res.status(404).send({ message: `Subject with id ${id} not found` })
    }

    for (let id of field_id) {
      let field = await Field.findByPk(id)
      if (!field) return res.status(404).send({ message: `Field with id ${id} not found` })
    }

    await center.update({ branch_number: (center.branch_number || 0) + 1 });
    let newBranch = await Branch.create(req.body)
    res.status(201).send({ newBranch })
  } catch (err) {
    console.error("Error in POST /branch:", err);
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
    console.error("Error in DELETE /branch:", err)
    return res.status(400).json({ message: 'Cannot delete this branch, it may be linked to other records' })
  }
})

module.exports = route