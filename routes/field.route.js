const sendLog = require('../logger')
const AuthMiddleware = require('../middleware/auth.middleware')
const { roleMiddleware } = require('../middleware/role.middleware')
const { Field } = require('../models/index.module')
const FieldValidation = require('../validation/field.validation')
const express = require('express')
const route = express.Router()

/**
 * @swagger
 * tags:
 *   name: Field 💼
 *   description: Field management API
 */
/**
 * @swagger
 * /search/field :
 *   get:
 *     summary: Get fields with filtering, sorting, and pagination
 *     tags:
 *       - Field 💼
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - name: name
 *         in: query
 *         description: Filter by field name
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
 *         description: List of fields
 *       404:
 *         description: Field not found
 *       400:
 *         description: Bad request
 */
/**
 * @swagger
 * /field:
 *   get:
 *     summary: Get all fields
 *     tags: [Field 💼]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: List of all fields
 *       400:
 *         description: Bad request
 */
/**
 * @swagger
 * /field:
 *   post:
 *     summary: Create a new field
 *     tags: [Field 💼]
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
/**
 * @swagger
 * /field/{id}:
 *   get:
 *     summary: Get a field by ID
 *     tags: [Field 💼]
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

route.get("/", async (req, res) => {
  try {
      const fields = await Field.findAll();
      sendLog("✅ GET sorovi muvaffaqiyatli bajarildi: fieldlar yuborildi.");
      res.send(fields);
  } catch (error) {
      sendLog(`❌ Xatolik yuz berdi: ${error.message}
          📌 Foydalanuvchi: ${req.user ? `(${req.user.id} - ${req.user.name})` : "Aniqlanmagan foydalanuvchi"}
          📂 Route: ${req.originalUrl}
          📥 Sorov: ${JSON.stringify(req.query)}
          🛠️ Stack: ${error.stack}`);
      res.status(400).send({ message: error.message });
  }
});

route.post('/', roleMiddleware(["ADMIN"]), async (req, res) => {
  try {
    const userInfo = req.user ? `ID: ${req.user.id}, Role: ${req.user.role}, Email: ${req.user.email}` : "Noma'lum foydalanuvchi";
    
    sendLog(`📤 [POST] /fields sorovi boshlandi
      📌 Foydalanuvchi: ${userInfo}
      📂 Route: ${req.originalUrl}
      📥 Sorov: ${JSON.stringify(req.body)}`);
      
      const { error } = FieldValidation.validate(req.body);
      if (error) {
        sendLog(`❌ Validatsiya xatosi
          📌 Foydalanuvchi: ${userInfo}
              📂 Route: ${req.originalUrl}
              📥 Sorov: ${JSON.stringify(req.body)}
              ⚠️ Xato: ${error.details[0].message}`);
              return res.status(400).send({ message: error.details[0].message });
            }
            
            let field = await Field.findOne({ where: { name: req.body.name } });
            if (field) {
              sendLog(`⚠️ Field allaqachon mavjud
              📌 Foydalanuvchi: ${userInfo}
              📂 Route: ${req.originalUrl}
              📥 Sorov: ${JSON.stringify(req.body)}
              🏷️ Field: ${req.body.name}`);
      return res.status(400).send({ message: "Field already exists" });
    }

    let newField = await Field.create(req.body);
    sendLog(`✅ Yangi field yaratildi
            📌 Foydalanuvchi: ${userInfo}
            📂 Route: ${req.originalUrl}
            🆕 Field ID: ${newField.id}
            🏷️ Field nomi: ${newField.name}`);

    sendLog(`📨 [POST] Sorov muvaffaqiyatli bajarildi
            📌 Foydalanuvchi: ${userInfo}
            📂 Route: ${req.originalUrl}
            🔍 Natija: ${JSON.stringify(newField)}`);
    res.status(201).send(newField);
  } catch (error) {
    sendLog(`❌ Xatolik yuz berdi: ${error.message}
            📌 Foydalanuvchi: ${userInfo}
            📂 Route: ${req.originalUrl}
            📥 Sorov: ${JSON.stringify(req.body)}
            🛠️ Stack: ${error.stack}`);
    console.log(error);
    return res.status(400).send({ message: error.message });
  }
});


route.get('/:id', async (req, res) => {
  try {
    const userInfo = req.user ? `ID: ${req.user.id}, Role: ${req.user.role}, Email: ${req.user.email}` : "Noma'lum foydalanuvchi";
    const fieldId = req.params.id;

    sendLog(`📤 [GET] /fields/${fieldId} sorovi boshlandi
            📌 Foydalanuvchi: ${userInfo}
            📂 Route: ${req.originalUrl}`);

    let one = await Field.findByPk(fieldId);

    if (!one) {
      sendLog(`⚠️ Field topilmadi
              📌 Foydalanuvchi: ${userInfo}
              📂 Route: ${req.originalUrl}
              🆔 Field ID: ${fieldId}`);
      return res.status(404).send({ message: 'Field not found' });
    }

    sendLog(`✅ Field topildi
            📌 Foydalanuvchi: ${userInfo}
            📂 Route: ${req.originalUrl}
            🆔 Field ID: ${one.id}
            🏷️ Field nomi: ${one.name}`);

    res.send(one);
  } catch (err) {
    sendLog(`❌ Xatolik yuz berdi: ${err.message}
            📌 Foydalanuvchi: ${userInfo}
            📂 Route: ${req.originalUrl}
            🛠️ Stack: ${err.stack}`);

    console.log(err);
    return res.status(400).send({ message: err.message });
  }
});

/**
 * @swagger
 * /field/{id}:
 *   patch:
 *     summary: Update a field
 *     tags: [Field 💼]
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
route.patch('/:id', roleMiddleware(["ADMIN","SUPER-ADMIN"]), async (req, res) => {
  try {
    const userInfo = req.user 
      ? `ID: ${req.user.id}, Role: ${req.user.role}, Email: ${req.user.email}` 
      : "Noma'lum foydalanuvchi";
    const fieldId = req.params.id;

    sendLog(`🛠️ [PATCH] /fields/${fieldId} sorovi boshlandi
            📌 Foydalanuvchi: ${userInfo}
            📂 Route: ${req.originalUrl}
            📥 Sorov malumotlari: ${JSON.stringify(req.body)}`);

    let one = await Field.findByPk(fieldId);

    if (!one) {
      sendLog(`⚠️ Field topilmadi
              📌 Foydalanuvchi: ${userInfo}
              📂 Route: ${req.originalUrl}
              🆔 Field ID: ${fieldId}`);
      return res.status(404).json({ message: 'Field not found' });
    }

    let updatedField = await one.update(req.body, {
      fields: Object.keys(req.body),
    });

    sendLog(`✅ Field muvaffaqiyatli yangilandi
            📌 Foydalanuvchi: ${userInfo}
            📂 Route: ${req.originalUrl}
            🆔 Field ID: ${updatedField.id}
            🏷️ Yangilangan malumotlar: ${JSON.stringify(updatedField)}`);

    res.status(200).json(updatedField);
  } catch (err) {
    sendLog(`❌ Xatolik yuz berdi: ${err.message}
            📌 Foydalanuvchi: ${userInfo}
            📂 Route: ${req.originalUrl}
            📥 Sorov malumotlari: ${JSON.stringify(req.body)}
            🛠️ Stack: ${err.stack}`);

    console.error(err);
    res.status(400).json({ message: err.message });
  }
});


/**
 * @swagger
 * /field/{id}:
 *   delete:
 *     summary: Delete a field
 *     tags: [Field 💼]
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
route.delete('/:id', roleMiddleware(["ADMIN"]), async (req, res) => {
  try {
    const userInfo = req.user 
      ? `ID: ${req.user.id}, Role: ${req.user.role}, Email: ${req.user.email}` 
      : "Noma'lum foydalanuvchi";
    const fieldId = req.params.id;

    sendLog(`🗑️ [DELETE] /fields/${fieldId} sorovi boshlandi
            📌 Foydalanuvchi: ${userInfo}
            📂 Route: ${req.originalUrl}`);

    let one = await Field.findByPk(fieldId);

    if (!one) {
      sendLog(`⚠️ Field topilmadi
              📌 Foydalanuvchi: ${userInfo}
              📂 Route: ${req.originalUrl}
              🆔 Field ID: ${fieldId}`);
      return res.status(404).send({ message: 'Field not found' });
    }

    await one.destroy();

    sendLog(`✅ Field muvaffaqiyatli ochirildi
            📌 Foydalanuvchi: ${userInfo}
            📂 Route: ${req.originalUrl}
            🆔 Field ID: ${fieldId}`);

    res.send({ message: 'Deleted successfully' });
  } catch (err) {
    sendLog(`❌ Xatolik yuz berdi: ${err.message}
            📌 Foydalanuvchi: ${userInfo}
            📂 Route: ${req.originalUrl}
            🛠️ Stack: ${err.stack}`);

    console.error(err);
    res.status(400).send({ message: err.message });
  }
});


module.exports = route
