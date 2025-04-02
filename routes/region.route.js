const { Region } = require('../models/index.module')
const RegionValidation = require('../validation/region.valadation')
const express = require('express')
const sendLog = require("../logger")
const { roleMiddleware } = require('../middleware/role.middleware')
const route = express.Router()

/**
 * @swagger
 * /search/region :
 *   get:
 *     summary: Get regions with filtering, sorting, and pagination
 *     tags:
 *       - Region 📍
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - name: name
 *         in: query
 *         description: Filter by region name
 *         schema:
 *           type: string
 *       - name: limit
 *         in: query
 *         description: Number of results per page
 *         schema:
 *           type: integer
 *           default: 10
 *       - name: page
 *         in: query
 *         description: Page number
 *         schema:
 *           type: integer
 *           default: 1
 *       - name: sortBy
 *         in: query
 *         description: Field to sort by
 *         schema:
 *           type: string
 *           default: id
 *       - name: order
 *         in: query
 *         description: Sorting order (ASC or DESC)
 *         schema:
 *           type: string
 *           enum: [ASC, DESC]
 *           default: ASC
 *     responses:
 *       200:
 *         description: List of regions
 *       404:
 *         description: Region not found
 *       400:
 *         description: Bad request
 */

/**
 * @swagger
 * /region:
 *   get:
 *     summary: Barcha regionlarni olish
 *     tags: [Region 📍]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Regionlar ro‘yxati
 *       400:
 *         description: Xatolik yuz berdi
 */
route.get('/', async (req, res) => {
  try {
    const regions = await Region.findAll();
    sendLog(`✅ Regionlar muvaffaqiyatli topildi | 🌍 Route: ${req.originalUrl} | 📌 Jami: ${regions.length}`);
    res.json(regions);
  } catch (error) {
    sendLog(`❌ Xatolik: ${error.message} | 🌍 Route: ${req.originalUrl} | 🛠️ Stack: ${error.stack}`);
    res.status(400).json({ error: error.message });
  }
});


/**
 * @swagger
 * /region:
 *   post:
 *     summary: Yangi region qo‘shish
 *     tags: [Region 📍]
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
 *                 example: Earth
 *                 description: Region nomi
 *     responses:
 *       201:
 *         description: Yangi region yaratildi
 *       400:
 *         description: Xatolik yoki region allaqachon mavjud
 */
route.post('/',roleMiddleware(["ADMIN"]), async (req, res) => {
  try {
    sendLog(`📥 Sorov qabul qilindi | 🌍 Route: ${req.originalUrl} | 📌 Ma'lumot: ${JSON.stringify(req.body)}`);

    const { error } = RegionValidation.validate(req.body);
    if (error) {
      sendLog(`⚠️ Xatolik: Validatsiya muammosi | 🌍 Route: ${req.originalUrl} | ❗ Xato: ${error.details[0].message}`);
      return res.status(400).json({ error: error.details[0].message });
    }

    let one = await Region.findOne({ where: { name: req.body.name } });
    if (one) {
      sendLog(`⚠️ Xatolik: Region allaqachon mavjud | 🌍 Route: ${req.originalUrl} | 🔄 Region: ${req.body.name}`);
      return res.status(400).json({ error: 'Region already exists' });
    }

    const newRegion = await Region.create(req.body);
    sendLog(`✅ Region muvaffaqiyatli yaratildi | 🌍 Route: ${req.originalUrl} | 🆕 Region: ${JSON.stringify(newRegion)}`);

    res.status(201).json({ newRegion });
  } catch (err) {
    sendLog(`❌ Xatolik: ${err.message} | 🌍 Route: ${req.originalUrl} | 🛠️ Stack: ${err.stack}`);
    res.status(400).json({ error: err.message });
  }
});

/**
 * @swagger
 * /region/{id}:
 *   get:
 *     summary: ID bo‘yicha region olish
 *     tags: [Region 📍]
 *     security:
 *       - BearerAuth: []
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
    sendLog(`📥 Sorov qabul qilindi | 🌍 Route: ${req.originalUrl} | 🆔 Region ID: ${req.params.id}`);

    let one = await Region.findByPk(req.params.id);
    if (!one) {
      sendLog(`⚠️ Xatolik: Region topilmadi | 🌍 Route: ${req.originalUrl} | 🆔 Region ID: ${req.params.id}`);
      return res.status(404).json({ error: 'Region not found' });
    }

    sendLog(`✅ Region topildi | 🌍 Route: ${req.originalUrl} | 📌 Ma'lumot: ${JSON.stringify(one)}`);
    res.send(one);
  } catch (err) {
    sendLog(`❌ Xatolik: ${err.message} | 🌍 Route: ${req.originalUrl} | 🛠️ Stack: ${err.stack}`);
    res.status(400).json({ error: err.message });
  }
});

/**
 * @swagger
 * /region/{id}:
 *   patch:
 *     summary: Region ma’lumotlarini yangilash
 *     tags: [Region 📍]
 *     security:
 *       - BearerAuth: []
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
route.patch('/:id',roleMiddleware(["ADMIN","SUPER-ADMIN"]), async (req, res) => {
  try {
    sendLog(`📥 Sorov qabul qilindi | ✏️ PATCH | 🌍 Route: ${req.originalUrl} | 🆔 Region ID: ${req.params.id} | 📌 Yangilash ma'lumotlari: ${JSON.stringify(req.body)}`);

    let one = await Region.findByPk(req.params.id);
    if (!one) {
      sendLog(`⚠️ Xatolik: Region topilmadi | 🌍 Route: ${req.originalUrl} | 🆔 Region ID: ${req.params.id}`);
      return res.status(404).json({ error: 'Region not found' });
    }

    await Region.update(req.body, { where: { id: req.params.id } });

    let updatedRegion = await Region.findByPk(req.params.id);
    sendLog(`✅ Region muvaffaqiyatli yangilandi | 🌍 Route: ${req.originalUrl} | 📌 Yangilangan ma'lumot: ${JSON.stringify(updatedRegion)}`);

    res.status(200).json(updatedRegion);
  } catch (err) {
    sendLog(`❌ Xatolik: ${err.message} | 🌍 Route: ${req.originalUrl} | 🛠️ Stack: ${err.stack}`);
    res.status(400).json({ error: 'Internal Server Error' });
  }
});


/**
 * @swagger
 * /region/{id}:
 *   delete:
 *     summary: Regionni o‘chirish
 *     tags: [Region 📍]
 *     security:
 *       - BearerAuth: []
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
route.delete('/:id',roleMiddleware(["ADMIN"]), async (req, res) => {
  try {
    sendLog(`📥 Sorov qabul qilindi | 🗑️ DELETE | 🌍 Route: ${req.originalUrl} | 🆔 Region ID: ${req.params.id}`);

    let one = await Region.findByPk(req.params.id);
    if (!one) {
      sendLog(`⚠️ Xatolik: Region topilmadi | 🌍 Route: ${req.originalUrl} | 🆔 Region ID: ${req.params.id}`);
      return res.status(404).json({ error: 'Region not found' });
    }

    await Region.destroy({ where: { id: req.params.id } });

    sendLog(`✅ Region muvaffaqiyatli ochirildi | 🌍 Route: ${req.originalUrl} | 🆔 O‘chirilgan ID: ${req.params.id}`);

    res.status(200).json({ message: 'Region deleted successfully' });
  } catch (err) {
    sendLog(`❌ Xatolik: ${err.message} | 🌍 Route: ${req.originalUrl} | 🛠️ Stack: ${err.stack}`);
    res.status(400).json({ error: 'Internal Server Error' });
  }
});


module.exports = route