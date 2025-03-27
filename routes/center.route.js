const { Op } = require("sequelize");
const {Center, Region, User, Branch, Comment, Registration, Subject, Field} = require("../models/index.module");
const CenterValidation = require("../validation/center.validation");
const { roleMiddleware } = require("../middleware/role.middleware");
const AuthMiddleware = require("../middleware/auth.middleware");
const BranchField = require("../models/branchField.module");
const CenterField = require("../models/centerField.module");
const CenterSubject = require("../models/centerSubject.module");
const app = require("express").Router()
const sendLog = require('../logger')


/**
 * @swagger
 * /center:
 *   post:
 *     summary: Create a new center
 *     security:
 *       - BearerAuth: []
 *     tags:
 *       - LearningCenters 🎓
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Center'
 *     responses:
 *       200:
 *         description: Center created successfully
 *       400:
 *         description: Validation error
 * 
 *   get:
 *     summary: Get all centers with filtering, sorting, and pagination
 *     security:
 *       - BearerAuth: []
 *     tags:
 *       - LearningCenters 🎓
 *     parameters:
 *       - name: name
 *         in: query
 *         description: Filter by center name
 *         schema:
 *           type: string
 *       - name: region_id
 *         in: query
 *         description: Filter by region ID
 *         schema:
 *           type: integer
 *       - name: ceo_id
 *         in: query
 *         description: Filter by CEO ID
 *         schema:
 *           type: integer
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
 *       - name: order
 *         in: query
 *         description: Sorting order (ASC or DESC)
 *         schema:
 *           type: string
 *           enum: [ASC, DESC]
 *           default: ASC
 *       - name: sortBy
 *         in: query
 *         description: Field to sort by
 *         schema:
 *           type: string
 *           default: id
 *     responses:
 *       200:
 *         description: List of centers
 *       203:
 *         description: No centers found
 *       400:
 *         description: Invalid request
 * 
 * /center/{id}:
 *   get:
 *     summary: Get a center by ID
 *     security:
 *       - BearerAuth: []
 *     tags:
 *       - LearningCenters 🎓
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: Center ID
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Center details
 *       404:
 *         description: Center not found
 * 
 *   patch:
 *     summary: Update a center by ID
 *     security:
 *       - BearerAuth: []
 *     tags:
 *       - LearningCenters 🎓
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: Center ID
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Center'
 *     responses:
 *       200:
 *         description: Center updated successfully
 *       404:
 *         description: Center not found
 * 
 *   delete:
 *     summary: Delete a center by ID
 *     security:
 *       - BearerAuth: []
 *     tags:
 *       - LearningCenters 🎓
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: Center ID
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Center deleted successfully
 *       404:
 *         description: Center not found
 * 
 * /center/students:
 *   get:
 *     summary: Get students registered in a center
 *     tags:
 *       - LearningCenters 🎓
 *     parameters:
 *       - name: learningCenter_id
 *         in: query
 *         required: true
 *         description: Learning center ID
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: List of students
 *       400:
 *         description: learningCenter_id is required
 * 
 * /center/average-star:
 *   get:
 *     summary: Get average rating of a center
 *     security:
 *       - BearerAuth: []
 *     tags:
 *       - LearningCenters 🎓
 *     parameters:
 *       - name: learningCenter_id
 *         in: query
 *         required: true
 *         description: Learning center ID
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Average star rating
 *       400:
 *         description: learningCenter_id is required
 */
/**
 * @swagger
 * components:
 *   schemas:
 *     Center:
 *       type: object
 *       required:
 *         - name
 *         - phone
 *       properties:
 *         name:
 *           type: string
 *           example: TEST
 *           description: Name of the learning center
 *         phone:
 *           type: string
 *           example: +998882452212
 *           description: Contact phone number of the center
 *         image:
 *           type: string
 *           example: photo
 *           description: Image URL of the center
 *         location:
 *           type: string
 *           example: Earth
 *           description: Physical location of the center
 *         region_id:
 *           type: integer
 *           example: 1
 *           description: ID of the region where the center is located
 *         branch_number:
 *           type: integer
 *           example: 3
 *           description: Number of branches for this center
 *         description:
 *           type: string
 *           example: Good
 *           description: Short description of the center
 *         subject_id:
 *           type: array
 *           items:
 *             type: integer
 *           example: [1, 2]
 *           description: List of subject IDs taught in the center
 *         field_id:
 *           type: array
 *           items:
 *             type: integer
 *           example: [1, 2]
 *           description: List of field IDs related to the center
 */



app.post("/", roleMiddleware(["CEO"]), async (req, res) => {
    try {
        let { error } = CenterValidation.validate(req.body);
        if (error) {
            sendLog(`⚠️ Xato: ${error.details[0].message}
                📌 Foydalanuvchi: (${req.user?.id} - ${req.user?.name})
                📂 Route: ${req.originalUrl}
                📥 Sorov: ${JSON.stringify(req.body)}
            `);
            return res.status(400).send({ message: error.details[0].message });
        }

        const ceo_id = req.user.id;
        if (!ceo_id) {
            sendLog(`⚠️ CEO topilmadi
                📌 Foydalanuvchi: (${req.user?.id} - ${req.user?.name})
                📂 Route: ${req.originalUrl}
            `);
            return res.status(404).send("CEO not found");
        }

        let { subject_id, field_id, region_id, ...rest } = req.body;

        let existingCenter = await Center.findOne({ where: { name: rest.name } });
        if (existingCenter) {
            sendLog(`⚠️ Ushbu nomdagi markaz allaqachon mavjud: ${rest.name}
                📌 Foydalanuvchi: (${req.user?.id} - ${req.user?.name})
                📂 Route: ${req.originalUrl}
            `);
            return res.status(400).send({ message: "The learning center with such a name already exists!" });
        }

        const region = await Region.findByPk(region_id);
        if (!region) {
            sendLog(`⚠️ Region topilmadi: ID ${region_id}
                📌 Foydalanuvchi: (${req.user?.id} - ${req.user?.name})
                📂 Route: ${req.originalUrl}
            `);
            return res.status(404).send({ message: "Region not found" });
        }

        const fields = await Field.findAll({ where: { id: field_id } });
        if (fields.length !== field_id.length) {
            sendLog(`⚠️ Bazi field_id topilmadi
                📌 Foydalanuvchi: (${req.user?.id} - ${req.user?.name})
                📂 Route: ${req.originalUrl}
                🔍 Kiritilgan field_id: ${JSON.stringify(field_id)}
            `);
            return res.status(404).send({ message: "Some fields_id not found" });
        }

        const subjects = await Subject.findAll({ where: { id: subject_id } });
        if (subjects.length !== subject_id.length) {
            sendLog(`⚠️ Bazi subject_id topilmadi
                📌 Foydalanuvchi: (${req.user?.id} - ${req.user?.name})
                📂 Route: ${req.originalUrl}
                🔍 Kiritilgan subject_id: ${JSON.stringify(subject_id)}
            `);
            return res.status(404).send({ message: "Some subjects_id not found" });
        }

        const newCenter = await Center.create({
            ...rest,
            region_id,
            ceo_id,
        });

        await CenterSubject.bulkCreate(
            subject_id.map((subject_id) => ({
                CenterId: newCenter.id,
                SubjectId: subject_id,
            }))
        );
        sendLog(`✅ Subjects boglandi: ${JSON.stringify(subject_id)}
            📌 Foydalanuvchi: (${req.user?.id} - ${req.user?.name})
            🏢 Markaz: ${newCenter.id} - ${newCenter.name}
        `);

        await CenterField.bulkCreate(
            field_id.map((field_id) => ({
                CenterId: newCenter.id,
                FieldId: field_id,
            }))
        );
        sendLog(`✅ Fields boglandi: ${JSON.stringify(field_id)}
            📌 Foydalanuvchi: (${req.user?.id} - ${req.user?.name})
            🏢 Markaz: ${newCenter.id} - ${newCenter.name}
        `);

        req.body.ceo_id = ceo_id;

        sendLog(`🏢 Yangi oquv markazi yaratildi: ${newCenter.name}
            📌 Foydalanuvchi: (${req.user?.id} - ${req.user?.name})
            🔍 Region ID: ${region_id}
            🔍 Subjects: ${JSON.stringify(subject_id)}
            🔍 Fields: ${JSON.stringify(field_id)}
        `);

        res.send(req.body);
    } catch (error) {
        sendLog(`❌ Xatolik yuz berdi: ${error.message}
            📌 Foydalanuvchi: (${req.user?.id} - ${req.user?.name})
            📂 Route: ${req.originalUrl}
            📥 Sorov: ${JSON.stringify(req.body)}
            🛠️ Stack: ${error.stack}
        `);
        console.log(error);
        res.status(400).send({ message: error.message });
    }
});


app.get("/", async (req, res) => {
    const { name, region_id, ceo_id, limit = 10, page = 1, order = "ASC", sortBy = "id" } = req.query;
    try {
        const where = {};

        if (name) where.name = { [Op.like]: `%${name}%` };
        if (region_id) where.region_id = { [Op.like]: `%${region_id}%` };
        if (ceo_id) where.ceo_id = { [Op.like]: `%${ceo_id}%` };

        const centers = await Center.findAll({
            where,
            limit: parseInt(limit),
            offset: (parseInt(page) - 1) * parseInt(limit),
            order: [[sortBy, order.toUpperCase()]],
            include: [
                { model: Subject, through: { attributes: [] } },
                { model: Field, through: { attributes: [] } },
                { model: Region, attributes: ["name"] },
                { model: User, attributes: ["email", "name"] },
                { model: Branch, attributes: ["name", "location"] },
                { model: Comment, attributes: ["star", "comment"] }
            ]
        });

        if (!centers.length) {
            sendLog(`⚠️ Markaz topilmadi
                📌 Foydalanuvchi: (${req.user?.id} - ${req.user?.name})
                📂 Route: ${req.originalUrl}
                🔍 Sorov: ${JSON.stringify(req.query)}
            `);
            return res.status(204).send({ message: "Nothing found" });
        }

        sendLog(`✅ Markazlar topildi
            📌 Foydalanuvchi: (${req.user?.id} - ${req.user?.name})
            📂 Route: ${req.originalUrl}
            🔍 Natija: ${centers.length} ta markaz
        `);

        res.send(centers);
    } catch (error) {
        sendLog(`❌ Xatolik yuz berdi: ${error.message}
            📌 Foydalanuvchi: (${req.user?.id} - ${req.user?.name})
            📂 Route: ${req.originalUrl}
            📥 Sorov: ${JSON.stringify(req.query)}
            🛠️ Stack: ${error.stack}
        `);
        res.status(400).send({ message: error.message });
    }
});


app.get("/students",roleMiddleware(["ADMIN","CEO"]), async (req, res) => {
    try {
        if (!req.query.learningCenter_id) {
            sendLog(`⚠️ Xato sorov: learningCenter_id kiritilmagan
                📌 Foydalanuvchi: (${req.user?.id} - ${req.user?.name})
                📂 Route: ${req.originalUrl}
                📥 Sorov: ${JSON.stringify(req.query)}
            `);
            return res.status(400).send({ message: "learningCenter_id is required" });
        }
        
        let students = await Registration.findAll({ where: { learningCenter_id: req.query.learningCenter_id } });

        if (!students) {
            sendLog(`⚠️ Oquvchilar topilmadi
                📌 Foydalanuvchi: (${req.user?.id} - ${req.user?.name})
                📂 Route: ${req.originalUrl}
                🔍 learningCenter_id: ${req.query.learningCenter_id}
            `);
            return res.status(204).send({ message: "No students found" });
        }

        sendLog(`✅ ${students.length} ta oquvchi topildi
            📌 Foydalanuvchi: (${req.user?.id} - ${req.user?.name})
            📂 Route: ${req.originalUrl}
            🔍 learningCenter_id: ${req.query.learningCenter_id}
        `);

        res.send(students);
    } catch (error) {
        sendLog(`❌ Xatolik yuz berdi: ${error.message}
            📌 Foydalanuvchi: (${req.user?.id} - ${req.user?.name})
            📂 Route: ${req.originalUrl}
            📥 Sorov: ${JSON.stringify(req.query)}
            🛠️ Stack: ${error.stack}
        `);
        res.status(400).send({ message: error.message });
    }
});


app.get("/average-star", AuthMiddleware(), async (req, res) => {
    try {
        let { learningCenter_id } = req.query;

        if (!learningCenter_id) {
            sendLog(`⚠️ Xato sorov: learningCenter_id kiritilmagan
                📌 Foydalanuvchi: (${req.user?.id} - ${req.user?.name})
                📂 Route: ${req.originalUrl}
                📥 Sorov: ${JSON.stringify(req.query)}
            `);
            return res.status(400).send({ message: "learningCenter_id is required" });
        }

        let center_data = await Comment.findAll({ where: { learningCenter_id } });

        if (!center_data) {
            sendLog(`⚠️ Ushbu oquv markazida sharhlar topilmadi
                📌 Foydalanuvchi: (${req.user?.id} - ${req.user?.name})
                📂 Route: ${req.originalUrl}
                🔍 learningCenter_id: ${learningCenter_id}
            `);
            return res.send({ average_star: 0 });
        }

        let totalStars = center_data.reduce((sum, comment) => sum + comment.star, 0);
        if(totalStars == 0){
            return res.send({ average_star: 0 })
        }
        let average_star = totalStars / center_data.length;

        sendLog(`✅ Ortacha baho hisoblandi: ${average_star.toFixed(2)}
            📌 Foydalanuvchi: (${req.user?.id} - ${req.user?.name})
            📂 Route: ${req.originalUrl}
            🔍 learningCenter_id: ${learningCenter_id}
            ⭐ Sharhlar soni: ${center_data.length}
        `);
        
        res.send({ average_star: average_star.toFixed(2) });
    } catch (error) {
        sendLog(`❌ Xatolik yuz berdi: ${error.message}
            📌 Foydalanuvchi: (${req.user?.id} - ${req.user?.name})
            📂 Route: ${req.originalUrl}
            📥 Sorov: ${JSON.stringify(req.query)}
            🛠️ Stack: ${error.stack}
        `);
        res.status(400).send({ message: error.message });
    }
});


app.get("/:id", roleMiddleware(["CEO"]), async (req, res) => {
    const { id } = req.params;
    try {
        if (!id) {
            sendLog(`⚠️ Xato sorov: ID kiritilmagan
                📌 Foydalanuvchi: (${req.user?.id} - ${req.user?.name})
                📂 Route: ${req.originalUrl}
                📥 Sorov: ${JSON.stringify(req.params)}
            `);
            return res.status(400).send({ message: "Wrong ID" });
        }

        let center = await Center.findByPk(id, {
            include: [
                { model: Region, attributes: ["name"] },
                { model: User, attributes: ["email", "name"] }
            ]
        });

        if (!center) {
            sendLog(`⚠️ Oquv markazi topilmadi
                📌 Foydalanuvchi: (${req.user?.id} - ${req.user?.name})
                📂 Route: ${req.originalUrl}
                🔍 ID: ${id}
            `);
            return res.status(404).send({ message: "No Center found" });
        }

        sendLog(`✅ Oquv markazi topildi
            📌 Foydalanuvchi: (${req.user?.id} - ${req.user?.name})
            📂 Route: ${req.originalUrl}
            🔍 ID: ${id}
        `);
        res.send(center);
    } catch (error) {
        sendLog(`❌ Xatolik yuz berdi: ${error.message}
            📌 Foydalanuvchi: (${req.user?.id} - ${req.user?.name})
            📂 Route: ${req.originalUrl}
            📥 Sorov: ${JSON.stringify(req.params)}
            🛠️ Stack: ${error.stack}
        `);
        res.status(400).send({ message: error.message });
    }
});


app.patch("/:id", roleMiddleware(["CEO"]), async (req, res) => {
    const { id } = req.params;
    try {
        if (!id) {
            sendLog(`⚠️ Xato sorov: ID kiritilmagan
                📌 Foydalanuvchi: (${req.user?.id} - ${req.user?.name})
                📂 Route: ${req.originalUrl}
                📥 Sorov: ${JSON.stringify(req.params)}
            `);
            return res.status(400).send({ message: "Wrong ID" });
        }

        let center = await Center.findByPk(id);
        if (!center) {
            sendLog(`⚠️ Oquv markazi topilmadi
                📌 Foydalanuvchi: (${req.user?.id} - ${req.user?.name})
                📂 Route: ${req.originalUrl}
                🔍 ID: ${id}
            `);
            return res.status(404).send({ message: "No Center found" });
        }

        await center.update(req.body);

        sendLog(`✅ O‘quv markazi yangilandi
            📌 Foydalanuvchi: (${req.user?.id} - ${req.user?.name})
            📂 Route: ${req.originalUrl}
            🔍 ID: ${id}
            🔄 Yangilangan ma'lumot: ${JSON.stringify(req.body)}
        `);
        res.send(center);
    } catch (error) {
        sendLog(`❌ Xatolik yuz berdi: ${error.message}
            📌 Foydalanuvchi: (${req.user?.id} - ${req.user?.name})
            📂 Route: ${req.originalUrl}
            📥 Sorov: ${JSON.stringify(req.body)}
            🛠️ Stack: ${error.stack}
        `);
        res.status(400).send({ message: error.message });
    }
});


app.delete("/:id", roleMiddleware(["CEO"]), async (req, res) => {
    const { id } = req.params;
    try {
        if (!id) {
            sendLog(`⚠️ Xato sorov: ID kiritilmagan
                📌 Foydalanuvchi: (${req.user?.id} - ${req.user?.name})
                📂 Route: ${req.originalUrl}
                📥 Sorov: ${JSON.stringify(req.params)}
            `);
            return res.status(400).send({ message: "Wrong ID" });
        }

        let center = await Center.findByPk(id);
        if (!center) {
            sendLog(`⚠️ Oquv markazi topilmadi
                📌 Foydalanuvchi: (${req.user?.id} - ${req.user?.name})
                📂 Route: ${req.originalUrl}
                🔍 ID: ${id}
            `);
            return res.status(404).send({ message: "No Center found" });
        }

        await center.destroy();

        sendLog(`🗑️ Oquv markazi ochirildi
            📌 Foydalanuvchi: (${req.user?.id} - ${req.user?.name})
            📂 Route: ${req.originalUrl}
            🔍 ID: ${id}
        `);
        res.send({ message: "Oquv markazi muvaffaqiyatli ochirildi", center });
    } catch (error) {
        sendLog(`❌ Xatolik yuz berdi: ${error.message}
            📌 Foydalanuvchi: (${req.user?.id} - ${req.user?.name})
            📂 Route: ${req.originalUrl}
            📥 Sorov: ${JSON.stringify(req.params)}
            🛠️ Stack: ${error.stack}
        `);
        res.status(400).send({ message: error.message });
    }
});


module.exports = app