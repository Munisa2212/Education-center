const { Subject, Center } = require('../models/index.module')
const express = require('express')
const SubjectValidation = require('../validation/subject.validation')
const sendLog = require("../logger")
const { roleMiddleware } = require('../middleware/role.middleware')
const route = express.Router()

/**
 * @swagger
 * tags:
 *   name: Subject 📚
 *   description: Subject management API
 */

/**
 * @swagger
 * /search/subject :
 *   get:
 *     summary: Get subjects with filtering, sorting, and pagination
 *     tags:
 *       - Subject 📚
 *     parameters:
 *       - name: name
 *         in: query
 *         description: Filter by subject name
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
 *         description: List of subjects
 *       404:
 *         description: Subject not found
 *       400:
 *         description: Bad request
 */

/**
 * @swagger
 * /subject:
 *   get:
 *     summary: Get all subjects
 *     tags: [Subject 📚]
 *     responses:
 *       200:
 *         description: List of all subjects
 *       400:
 *         description: Bad request
 */
route.get('/', async (req, res) => {
  const user = req.user ? req.user.username : 'Anonim';
  const routePath = '/';

  try {
    sendLog(`📥 Sorov qabul qilindi | 🔍 ${routePath} | 👤 Kim tomonidan: ${user} | 📌 Query Parametrlar: ${JSON.stringify(req.query)}`);

    let subject = await Subject.findAll({include: [{model: Center}]});

    sendLog(`✅ ${subject.length} ta subject topildi | 🔍 ${routePath} | 👤 Kim tomonidan: ${user} | 📌 Natija: ${JSON.stringify(subject)}`);

    if(!subject) return res.status(404).send({message: "Subjects not found"})

    res.send(subject);
  } catch (err) {
    sendLog(`❌ Xatolik: ${err.message} | 🔍 ${routePath} | 👤 Kim tomonidan: ${user} | 🛠 Stack: ${err.stack}`);

    res.status(400).send({ message: err.message });
  }
});


/**
 * @swagger
 * /subject:
 *   post:
 *     summary: Create a new subject
 *     tags: [Subject 📚]
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
route.post('/',roleMiddleware(["ADMIN"]), async (req, res) => {
  const user = req.user ? req.user.username : 'Anonim';
  const routePath = '/';

  try {
    sendLog(`📥 Sorov qabul qilindi | 🔍 ${routePath} | 👤 Kim tomonidan: ${user} | 📌 Body: ${JSON.stringify(req.body)}`);

    const { error } = SubjectValidation.validate(req.body);
    if (error) {
      sendLog(`⚠️ Xato validatsiyada | 🔍 ${routePath} | 👤 Kim tomonidan: ${user} | 📌 Xatolik: ${error.details[0].message}`);
      return res.status(400).send({ message: error.details[0].message });
    }

    let existingSubject = await Subject.findOne({where: {name: req.body.name}})
    if(existingSubject) return res.status(400).send({message: "Subject already exists!"})
      
    let subject = await Subject.create(req.body);
    sendLog(`✅ Yangi subject yaratildi | 🔍 ${routePath} | 👤 Kim tomonidan: ${user} | 📌 Subject: ${JSON.stringify(subject)}`);
    res.status(201).send(subject);
  } catch (err) {
    sendLog(`❌ Xatolik: ${err.message} | 🔍 ${routePath} | 👤 Kim tomonidan: ${user} | 🛠 Stack: ${err.stack}`);
    res.status(400).send(err);
  }
});

/**
 * @swagger
 * /subject/{id}:
 *   get:
 *     summary: Get a subject by ID
 *     tags: [Subject 📚]
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
  const user = req.user ? req.user.username : 'Anonim';
  const routePath = `/${req.params.id}`;

  try {
    sendLog(`📥 Sorov qabul qilindi | 🔍 ${routePath} | 👤 Kim tomonidan: ${user} | 📌 Parametrlar: ${JSON.stringify(req.params)}`);

    let one = await Subject.findByPk(req.params.id);
    
    if (!one) {
      sendLog(`⚠️ Subject topilmadi | 🔍 ${routePath} | 👤 Kim tomonidan: ${user} | 📌 ID: ${req.params.id}`);
      return res.status(404).send({ message: 'Subject not found' });
    }

    sendLog(`✅ Subject topildi | 🔍 ${routePath} | 👤 Kim tomonidan: ${user} | 📌 Subject: ${JSON.stringify(one)}`);
    res.send(one);
  } catch (err) {
    sendLog(`❌ Xatolik: ${err.message} | 🔍 ${routePath} | 👤 Kim tomonidan: ${user} | 🛠 Stack: ${err.stack}`);
    res.status(400).send({ message: err.message });
  }
});


/**
 * @swagger
 * /subject/{id}:
 *   patch:
 *     summary: Update a subject
 *     tags: [Subject 📚]
 *     security:
 *       - BearerAuth: []
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
route.patch('/:id',roleMiddleware(["ADMIN","SUPER-ADMIN"]), async (req, res) => {
  const user = req.user ? req.user.username : 'Anonim';
  const routePath = `/${req.params.id}`;

  try {
    sendLog(`📥 Sorov qabul qilindi | 🔍 ${routePath} | 👤 Kim tomonidan: ${user} | 📌 Parametrlar: ${JSON.stringify(req.params)} | 📋 Yangi ma'lumotlar: ${JSON.stringify(req.body)}`);

    let one = await Subject.findByPk(req.params.id);
    if (!one) {
      sendLog(`⚠️ Subject topilmadi | 🔍 ${routePath} | 👤 Kim tomonidan: ${user} | 📌 ID: ${req.params.id}`);
      return res.status(404).send({ message: 'Subject not found' });
    }

    let updatedSubject = await one.update(req.body, {
      fields: Object.keys(req.body),
    });

    sendLog(`✅ Subject yangilandi | 🔍 ${routePath} | 👤 Kim tomonidan: ${user} | 📌 Yangilangan Subject: ${JSON.stringify(updatedSubject)}`);
    res.send(updatedSubject);
  } catch (err) {
    sendLog(`❌ Xatolik: ${err.message} | 🔍 ${routePath} | 👤 Kim tomonidan: ${user} | 🛠 Stack: ${err.stack}`);
    return res.status(400).send({ message: err.message });
  }
});


/**
 * @swagger
 * /subject/{id}:
 *   delete:
 *     summary: Delete a subject
 *     tags: [Subject 📚]
 *     security:
 *       - BearerAuth: []
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
route.delete('/:id',roleMiddleware(["ADMIN"]), async (req, res) => {
  const user = req.user ? req.user.username : 'Anonim';
  const routePath = `/${req.params.id}`;

  try {
    sendLog(`📥 Sorov qabul qilindi | 🔍 ${routePath} | 👤 Kim tomonidan: ${user} | 📌 Parametrlar: ${JSON.stringify(req.params)}`);

    let one = await Subject.findByPk(req.params.id);
    if (!one) {
      sendLog(`⚠️ Subject topilmadi | 🔍 ${routePath} | 👤 Kim tomonidan: ${user} | 📌 ID: ${req.params.id}`);
      return res.status(404).send({ message: 'Subject not found' });
    }

    await one.destroy();
    sendLog(`✅ Subject ochirilgan | 🔍 ${routePath} | 👤 Kim tomonidan: ${user} | 📌 ID: ${req.params.id}`);

    res.send({ message: 'Deleted successfully' });
  } catch (err) {
    sendLog(`❌ Xatolik: ${err.message} | 🔍 ${routePath} | 👤 Kim tomonidan: ${user} | 🛠 Stack: ${err.stack}`);
    return res.status(400).send({ message: err.message });
  }
});


module.exports = route