const { Region } = require('../models/index.module')
const RegionValidation = require('../validation/region.valadation')
const express = require('express')
const route = express.Router()

/**
 * @swagger
 * /region:
 *   get:
 *     summary: Barcha regionlarni olish
 *     tags: [Region]
 *     responses:
 *       200:
 *         description: Regionlar ro‘yxati
 *       400:
 *         description: Xatolik yuz berdi
 */
route.get('/', async (req, res) => {
  try {
    const regions = await Region.findAll()
    res.json(regions)
  } catch (error) {
    res.status(400).json({ error: error.message })
  }
})

/**
 * @swagger
 * /region:
 *   post:
 *     summary: Yangi region qo‘shish
 *     tags: [Region]
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
 *                 example: Earth
 *                 description: Region nomi
 *     responses:
 *       201:
 *         description: Yangi region yaratildi
 *       400:
 *         description: Xatolik yoki region allaqachon mavjud
 */
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

/**
 * @swagger
 * /region/{id}:
 *   get:
 *     summary: ID bo‘yicha region olish
 *     tags: [Region]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Region ID
 *     responses:
 *       200:
 *         description: Region ma’lumotlari
 *       404:
 *         description: Region topilmadi
 */
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

/**
 * @swagger
 * /region/{id}:
 *   patch:
 *     summary: Region ma’lumotlarini yangilash
 *     tags: [Region]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Region ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: Yangilangan region nomi
 *     responses:
 *       200:
 *         description: Region muvaffaqiyatli yangilandi
 *       404:
 *         description: Region topilmadi
 *       400:
 *         description: Xatolik yuz berdi
 */
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
    res.status(400).json({ error: 'Internal Server Error' })
  }
})

/**
 * @swagger
 * /region/{id}:
 *   delete:
 *     summary: Regionni o‘chirish
 *     tags: [Region]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Region ID
 *     responses:
 *       200:
 *         description: Region muvaffaqiyatli o‘chirildi
 *       404:
 *         description: Region topilmadi
 *       400:
 *         description: Xatolik yuz berdi
 */
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
    res.status(400).json({ error: 'Internal Server Error' })
  }
})

module.exports = route