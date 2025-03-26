const { Subject } = require('../models/index.module')
const express = require('express')
const SubjectValidation = require('../validation/subject.validation')
const route = express.Router()

/**
 * @swagger
 * tags:
 *   name: Subject
 *   description: Subject management API
 */

/**
 * @swagger
 * /subject:
 *   get:
 *     summary: Get all subjects
 *     tags: [Subject]
 *     responses:
 *       200:
 *         description: List of all subjects
 *       400:
 *         description: Bad request
 */
route.get('/', async (req, res) => {
  try {
    let subject = await Subject.findAll()
    res.send(subject)
  } catch (err) {
    res.status(400).send({ message: err.message })
    console.log(err)
  }
})

/**
 * @swagger
 * /subject:
 *   post:
 *     summary: Create a new subject
 *     tags: [Subject]
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
 *                 example: "Mathematics"
 *               image:
 *                 type: string
 *                 example: "https://example.com/image.jpg"
 *     responses:
 *       201:
 *         description: Subject created successfully
 *       400:
 *         description: Validation error
 */
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
    res.status(400).send(err)
  }
})

/**
 * @swagger
 * /subject/{id}:
 *   get:
 *     summary: Get a subject by ID
 *     tags: [Subject]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Subject ID
 *     responses:
 *       200:
 *         description: Subject details
 *       404:
 *         description: Subject not found
 */
route.get('/:id', async (req, res) => {
  try {
    let one = await Subject.findByPk(req.params.id)
    if (!one) {
      return res.status(404).send({ message: 'Subject not found' })
    }
    res.send(one)
  } catch (err) {
    res.status(400).send({ message: err.message })
    console.log(err)
  }
})

/**
 * @swagger
 * /subject/{id}:
 *   patch:
 *     summary: Update a subject
 *     tags: [Subject]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Subject ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Physics"
 *               image:
 *                 type: string
 *                 example: "https://example.com/image.jpg"
 *     responses:
 *       200:
 *         description: Subject updated successfully
 *       404:
 *         description: Subject not found
 */
route.patch('/:id', async (req, res) => {
  try {
    let one = await Subject.findByPk(req.params.id)
    if (!one) {
      return res.status(404).send({ message: 'Subject not found' })
    }
    let updatedSubject = await one.update(req.body, {
      fields: Object.keys(req.body),
    })
    res.send(updatedSubject)
  } catch (err) {
    console.log(err)
    return res.status(400).send({ message: err.message })
  }
})

/**
 * @swagger
 * /subject/{id}:
 *   delete:
 *     summary: Delete a subject
 *     tags: [Subject]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Subject ID
 *     responses:
 *       200:
 *         description: Subject deleted successfully
 *       404:
 *         description: Subject not found
 */
route.delete('/:id', async (req, res) => {
  try {
    let one = await Subject.findByPk(req.params.id)
    if (!one) {
      return res.status(404).send({ message: 'Subject not found' })
    }
    await one.destroy()
    res.send({ message: 'Deleted successfully' })
  } catch (err) {
    console.log(err)
    return res.status(400).send({ message: err.message })
  }
})

module.exports = route