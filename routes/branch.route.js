const { Op } = require('sequelize')
const {
  Branch,
  Center,
  Region,
  Field,
  Subject,
} = require('../models/index.module')
const Branch_validation = require('../validation/branch.validation')
const express = require('express')
const { roleMiddleware } = require('../middleware/role.middleware')
const BranchSubject = require('../models/branchSubject.module')
const BranchField = require('../models/branchField.module')
const sendLog = require('../logger')
const route = express.Router()

/**
 * @swagger
 * tags:
 *   name: Branch 🏢
 *   description: Branch management API
 */

/**
 * @swagger
 * /branch:
 *   get:
 *     summary: Retrieve a list of branches
 *     tags: [Branch 🏢]
 *     description: Fetches branches with optional filtering, sorting, and pagination.
 *     parameters:
 *       - in: query
 *         name: name
 *         schema:
 *           type: string
 *         description: Filter branches by name (partial match)
 *       - in: query
 *         name: location
 *         schema:
 *           type: string
 *         description: Filter branches by location (partial match)
 *       - in: query
 *         name: region_id
 *         schema:
 *           type: string
 *         description: Filter branches by region ID (partial match)
 *       - in: query
 *         name: learningCenter_id
 *         schema:
 *           type: string
 *         description: Filter branches by learning center ID (partial match)
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of results per page (pagination)
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number for pagination
 *       - in: query
 *         name: order
 *         schema:
 *           type: string
 *           enum: [ASC, DESC]
 *           default: ASC
 *         description: Order of sorting (ascending or descending)
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           default: id
 *         description: Field to sort results by
 *     responses:
 *       200:
 *         description: Successfully retrieved a list of branches
 *         content:
 *           application/json:
 *             example:
 *               - id: 1
 *                 name: "Tech Academy"
 *                 location: "Downtown"
 *                 region_id: 5
 *                 learningCenter_id: 2
 *                 subjects:
 *                   - id: 3
 *                     name: "Mathematics"
 *                   - id: 7
 *                     name: "Computer Science"
 *                 fields:
 *                   - id: 1
 *                     name: "Engineering"
 *                 region:
 *                   name: "Tashkent"
 *               - id: 2
 *                 name: "Code Hub"
 *                 location: "City Center"
 *                 region_id: 2
 *                 learningCenter_id: 3
 *                 subjects:
 *                   - id: 4
 *                     name: "Physics"
 *                 fields:
 *                   - id: 2
 *                     name: "Science"
 *                 region:
 *                   name: "Samarkand"
 *       400:
 *         description: Bad request due to validation error or server issue.
 *         content:
 *           application/json:
 *             example:
 *               message: "Invalid request parameters"
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             example:
 *               message: "Unexpected error occurred"
 */

route.get('/', async (req, res) => {
  const {name, location, region_id, learningCenter_id, limit = 10, page = 1, order = "ASC", sortBy = "id"} = req.query
  try {
    const where = {};

    if (name) where.name = { [Op.like]: `%${name}%` };
    if (location) where.location = { [Op.like]: `%${location}%` };
    if (region_id) where.region_id = { [Op.like]: `%${region_id}%` };
    if (learningCenter_id) where.learningCenter_id = { [Op.like]: `%${learningCenter_id}%` };

    const branches = await Branch.findAll({
      where,
      limit: parseInt(limit),
      offset: (parseInt(page) - 1) * parseInt(limit),
      order: [[sortBy, order.toUpperCase()]],
      include: [
          { model: Subject, through: { attributes: [] } },
          { model: Field, through: { attributes: [] } },
          { model: Region, attributes: ["name"] }
      ]
  })
    res.json(branches)
    sendLog('Muvaffaqiyatli branchlar GET qilindi✅')
  } catch (error) {
    console.error('Error in GET /branch:', error)
    sendLog(`❌ Xatolik yuz berdi: ${error.message}
      📌 Foydalanuvchi: (${req.user?.id} - ${req.user?.name})
      📂 Route: ${req.originalUrl}
      📥 Sorov: ${JSON.stringify(req.body)}
      🛠️ Stack: ${error.stack}`);
    res.status(400).send({ message: error.message })
  }
})



route.get('/:id', async (req, res) => {
  try {
    const branch = await Branch.findByPk(req.params.id)
    if (!branch) {
      sendLog('🚨 Branch not found')
      return res.status(404).send({ message: 'Branch not found' })
    }
    sendLog('Muvaffaqiyatli branch GET qilindi✅')
    res.json(branch)
  } catch (error) {
    sendLog(`❌ Xatolik yuz berdi: ${error.message}
      📌 Foydalanuvchi: ${req.user ? `(${req.user.id} - ${req.user.name})` : "Aniqlanmagan foydalanuvchi"}
      📂 Route: ${req.originalUrl}
      📥 Sorov: ${req.body ? JSON.stringify(req.body) : 'Body yoq'}
      🛠️ Stack: ${error.stack}`);
    console.error('Error in GET /branch/:id:', error)
    res.status(400).send({ message: error.message })
    return
  }
})


/**
 * @swagger
 * /branch:
 *   post:
 *     summary: Create a new branch
 *     tags: [Branch 🏢]
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
 *               - phone
 *               - location
 *               - region_id
 *               - learningCenter_id
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
 *               learningCenter_id:
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
route.post('/', roleMiddleware(['ADMIN', "CEO"]), async (req, res) => {
  try {
    const { region_id, learningCenter_id, field_id, subject_id, ...rest } =
      req.body

    const { error } = Branch_validation.validate(req.body)
    if (error) {
      sendLog(`🚨 Foydalanuvchi xato kiritdi: ${error.details[0].message}`)
      return res.status(400).send({ message: error.details[0].message })
    }

    const existingBranches = await Branch.findOne({
      where: { learningCenter_id: learningCenter_id, name: rest.name },
    })
    if (existingBranches) {
      sendLog(
        `🚨 Xatolik: Foydalanuvchi (${req.user?.id} - ${req.user?.name}) "${req.body.name}" nomli filialni qoshmoqchi boldi, lekin bunday nom allaqachon mavjud!`,
      )
      return res.status(400).send({
        message: 'This learning center already has a Branch with such a name!',
      })
    }
    let center = await Center.findByPk(learningCenter_id)
    if (!center) {
      sendLog(
        `🚨 Xatolik: Foydalanuvchi (${req.user?.id} - ${req.user?.name}) learning center (${learningCenter_id}) ni topa olmadi!`,
      )
      return res.status(404).send({ message: 'Center not found' })
    }
    let region = await Region.findByPk(region_id)
    if (!region) {
      sendLog(
        `🚨 Xatolik: Foydalanuvchi (${req.user?.id} - ${req.user?.name}) region (${region_id}) ni topa olmadi!`,
      )
      return res.status(404).send({ message: 'Region not found' })
    }

    const subjects = await Subject.findAll({ where: { id: subject_id } })

    if (subjects.length !== subject_id.length) {
      sendLog(`🚨 Xatolik: Foydalanuvchi (${req.user?.id} - ${
        req.user?.name
      }) quyidagi subject ID larni izladi: ${subject_id}. 
    Topilganlari: ${subjects.map((s) => s.id)}.
    Qolganlari topilmadi!`)
      return res.status(404).send({ message: 'One or more subjects not found' })
    }

    const fields = await Field.findAll({ where: { id: field_id } })

    if (fields.length !== field_id.length) {
      sendLog(`🚨 Xatolik: Foydalanuvchi (${req.user?.id} - ${
        req.user?.name
      }) quyidagi field ID larni izladi: ${field_id}. 
    Topilganlari: ${fields.map((f) => f.id)}.
    Qolganlari topilmadi!`)

      return res.status(404).send({ message: 'One or more fields not found' })
    }

    await center.update({ branch_number: center.branch_number + 1 })

    const newBranch = await Branch.create({
      ...rest,
      region_id: region_id,
      learningCenter_id: learningCenter_id,
    })

    await BranchSubject.bulkCreate(
      subject_id.map((subject_id) => ({
        BranchId: newBranch.id,
        SubjectId: subject_id,
      })),
    )
    console.log('Subjects added to BranchSubject:', subject_id)

    await BranchField.bulkCreate(
      field_id.map((field_id) => ({
        BranchId: newBranch.id,
        FieldId: field_id,
      })),
    )

    res.status(201).send({ newBranch })
    sendLog(`✅ Foydalanuvchi (${req.user?.id} - ${req.user?.name}) yangi branch yaratdi: 
🆔 ID: ${newBranch.id}
📍 Nomi: ${newBranch.name}
🏢 Learning Center ID: ${newBranch.learningCenter_id}`)
  } catch (err) {
    sendLog(`❌ Xatolik yuz berdi: ${error.message}
      📌 Foydalanuvchi: ${req.user ? `(${req.user.id} - ${req.user.name})` : "Aniqlanmagan foydalanuvchi"}
      📂 Route: ${req.originalUrl}
      📥 Sorov: ${req.body ? JSON.stringify(req.body) : 'Body yoq'}
      🛠️ Stack: ${error.stack}`);
    console.error('Error in POST /branch:', err)
    return res.status(400).json({ message: err.message })
  }
})

route.patch('/:id', roleMiddleware(["ADMIN", "SUPER-ADMIN"]),async (req, res) => {
  try {
    let one = await Branch.findByPk(req.params.id)
    if (!one) return res.status(404).send({ message: 'Not found' })

    await one.update(req.body)
    res.send({ message: 'Updated successfully' })
  } catch (err) {
    sendLog(`❌ Xatolik yuz berdi: ${error.message}
      📌 Foydalanuvchi: ${req.user ? `(${req.user.id} - ${req.user.name})` : "Aniqlanmagan foydalanuvchi"}
      📂 Route: ${req.originalUrl}
      📥 Sorov: ${req.body ? JSON.stringify(req.body) : 'Body yoq'}
      🛠️ Stack: ${error.stack}`);
    console.error('Error in PATCH /branch:', err)
    return res.status(400).json({ message: err.message })
  }
})

/**
 * @swagger
 * /branch/{id}:
 *   patch:
 *     summary: Update a branch
 *     tags: [Branch 🏢]
 *     security:
 *       - BearerAuth: []
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
 *                 example: "Updated Branch Name"
 *               phone:
 *                 type: string
 *                 example: "+998901234567"
 *               location:
 *                 type: string
 *                 example: "Updated Location"
 *     responses:
 *       200:
 *         description: Branch updated successfully
 *       400:
 *         description: Bad request
 *       404:
 *         description: Branch not found
 */

route.patch('/:id', async (req, res) => {
  const { id } = req.params
  try {
    if (!id) {
      return res.status(400).send({ message: 'Wrong id' })
    }

    const data = await Branch.findByPk(id)
    if (!data) {
      return res.status(404).send('Branch not found')
    }

    await data.update(req.body)
    res.status(200).send(data)
  } catch (error) {
    sendLog(`❌ Xatolik yuz berdi: ${error.message}
      📌 Foydalanuvchi: ${req.user ? `(${req.user.id} - ${req.user.name})` : "Aniqlanmagan foydalanuvchi"}
      📂 Route: ${req.originalUrl}
      📥 Sorov: ${req.body ? JSON.stringify(req.body) : 'Body yoq'}
      🛠️ Stack: ${error.stack}`);
    console.log(error)
    res.status(400).send({ message: error })
  }
})

/**
 * @swagger
 * /branch/{id}:
 *   delete:
 *     summary: Delete a branch
 *     tags: [Branch 🏢]
 *     security:
 *       - BearerAuth: []
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
    sendLog(`❌ Xatolik yuz berdi: ${error.message}
      📌 Foydalanuvchi: ${req.user ? `(${req.user.id} - ${req.user.name})` : "Aniqlanmagan foydalanuvchi"}
      📂 Route: ${req.originalUrl}
      📥 Sorov: ${req.body ? JSON.stringify(req.body) : 'Body yoq'}
      🛠️ Stack: ${error.stack}`);
    console.error('Error in DELETE /branch:', err)
    return res.status(400).json({
      message: 'Cannot delete this branch, it may be linked to other records',
    })
  }
})

module.exports = route
