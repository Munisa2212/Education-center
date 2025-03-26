const { AuthMiddleware } = require('../middleware/auth.middleware')
const { roleMiddleware } = require('../middleware/role.middleware')
const { Field } = require('../models/index.module')
const FieldValidation = require('../validation/field.validation')
const express = require('express')
const route = express.Router()

/**
 * @swagger
 * tags:
 *   name: Field
 *   description: Field management API
 */

/**
 * @swagger
 * /field:
 *   get:
 *     summary: Get all fields
 *     tags: [Field]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: List of all fields
 *       400:
 *         description: Bad request
 */
route.get('/', roleMiddleware(["ADMIN"]), async (req, res) => {
  try {
    const fields = await Field.findAll()
    res.send(fields)
  } catch (err) {
    console.log(err)
    return res.status(400).send({ message: err.message })
  }
})

/**
 * @swagger
 * /field:
 *   post:
 *     summary: Create a new field
 *     tags: [Field]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Engineering"
 *               image:
 *                 type: string
 *                 example: "https://example.com/image.jpg"
 *     responses:
 *       201:
 *         description: Field created successfully
 *       400:
 *         description: Validation error
 */
route.post('/', roleMiddleware(["ADMIN"]),async (req, res) => {
  try {
    const { error } = FieldValidation.validate(req.body)
    if (error) return res.status(400).send({ message: error.details[0].message })

    let field = await Field.findOne({where: {name: req.body.name}})
    if(field){
      return res.status(400).send({message: "Field already exists"})
    }
    let newField = await Field.create(req.body)
    res.status(201).send(newField)
  } catch (err) {
    console.log(err)
    return res.status(400).send({ message: err.message })
  }
})

/**
 * @swagger
 * /field/{id}:
 *   get:
 *     summary: Get a field by ID
 *     tags: [Field]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Field ID
 *     responses:
 *       200:
 *         description: Field details
 *       404:
 *         description: Field not found
 */
route.get('/:id', roleMiddleware(["ADMIN"]), async (req, res) => {
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

/**
 * @swagger
 * /field/{id}:
 *   patch:
 *     summary: Update a field
 *     tags: [Field]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Field ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Medicine"
 *               image:
 *                 type: string
 *                 example: "https://example.com/image.jpg"
 *     responses:
 *       200:
 *         description: Field updated successfully
 *       404:
 *         description: Field not found
 */
route.patch('/:id', roleMiddleware(["ADMIN"]), async (req, res) => {
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

/**
 * @swagger
 * /field/{id}:
 *   delete:
 *     summary: Delete a field
 *     tags: [Field]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Field ID
 *     responses:
 *       200:
 *         description: Field deleted successfully
 *       404:
 *         description: Field not found
 */
route.delete('/:id', roleMiddleware(["ADMIN"]),async (req, res) => {
  try {
    let one = await Field.findByPk(req.params.id)
    if (!one) {
      return res.status(404).send({ message: 'Field not found' })
    }
    await one.destroy()
    res.send({ message: 'Deleted successfully' })
  } catch (err) {
    console.log(err)
    return res.status(400).send({ message: err.message })
  }
})

module.exports = route
