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
 * /search/center :
 *   get:
 *     summary: Get centers with filtering, sorting, and pagination
 *     tags:
 *       - LearningCenters 🎓
 *     security:
 *       - BearerAuth: []
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
 *       - name: subject_id
 *         in: query
 *         description: Filter by subject ID
 *         schema:
 *           type: integer
 *       - name: field_id
 *         in: query
 *         description: Filter by field ID
 *         schema:
 *           type: integer
 *       - name: student_count
 *         in: query
 *         description: Filter by student_count
 *         schema:
 *           type: integer
 *       - name: branch_name
 *         in: query
 *         description: Filter by branch name
 *         schema:
 *           type: string
 *       - name: branch_id
 *         in: query
 *         description: Filter by branch Id
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
 *         description: List of centers
 *       203:
 *         description: No centers found
 *       400:
 *         description: Bad request
 */

/**
 * @swagger
 * /center/get/all:
 *   get:
 *     summary: Get all centers with filtering, sorting, and pagination
 *     tags:
 *       - LearningCenters 🎓
 *     security:
 *       - BearerAuth: []
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
 *         description: List of centers
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Center'
 *       404:
 *         description: No centers found
 *       400:
 *         description: Invalid request
 */

/**
 * @swagger
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
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Center'
 *       404:
 *         description: Center not found
 */

/**
 * @swagger
 * /center/students:
 *   get:
 *     summary: Get students registered in a center
 *     tags:
 *       - LearningCenters 🎓
 *     security:
 *       - BearerAuth: []
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
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                     description: Student ID
 *                   name:
 *                     type: string
 *                     description: Student name
 *       400:
 *         description: learningCenter_id is required
 */

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
 */

/**
 * @swagger
 * /center/{id}:
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
 */

/**
 * @swagger
 * /center/{id}:
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
 *           example: "+998882452212"
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
/**
 * @swagger
 * /center/my-learning-centers:
 *   get:
 *     summary: Get learning centers managed by the current user
 *     tags:
 *       - My LearningCenters 🎓
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: List of learning centers managed by the user
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                     description: ID of the learning center
 *                     example: 1
 *                   name:
 *                     type: string
 *                     description: Name of the learning center
 *                     example: "Tech Academy"
 *                   phone:
 *                     type: string
 *                     description: Phone number of the learning center
 *                     example: "+998901234567"
 *                   location:
 *                     type: string
 *                     description: Location of the learning center
 *                     example: "Tashkent, Uzbekistan"
 *                   Branches:
 *                     type: array
 *                     description: List of branches under the learning center
 *                     items:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: integer
 *                           description: ID of the branch
 *                           example: 1
 *                         name:
 *                           type: string
 *                           description: Name of the branch
 *                           example: "Downtown Branch"
 *                   Region:
 *                     type: object
 *                     description: Region where the learning center is located
 *                     properties:
 *                       id:
 *                         type: integer
 *                         description: ID of the region
 *                         example: 1
 *                       name:
 *                         type: string
 *                         description: Name of the region
 *                         example: "Tashkent"
 *                   Comments:
 *                     type: array
 *                     description: List of comments for the learning center
 *                     items:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: integer
 *                           description: ID of the comment
 *                           example: 1
 *                         comment:
 *                           type: string
 *                           description: The comment text
 *                           example: "Great learning center!"
 *                         star:
 *                           type: integer
 *                           description: Star rating of the comment
 *                           example: 5
 *       204:
 *         description: No learning centers found for the user
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "You have no learning-centers yet"
 *       400:
 *         description: Bad request or server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "An error occurred while fetching learning centers"
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
        
        const notFound_Subjects = []
        for(let i of subject_id){
            let existingSubject = await Subject.findOne({where: {id: i}})
            if(!existingSubject) notFound_Subjects.push(i)
        }
        if(notFound_Subjects.length) {
            sendLog(`⚠️ Bazi subject_id topilmadi
                📌 Foydalanuvchi: (${req.user?.id} - ${req.user?.name})
                📂 Route: ${req.originalUrl}
                🔍 Kiritilgan subject_id: ${JSON.stringify(subject_id)}
            `);
            return res.status(404).send({message: `Subjects with ${notFound_Subjects} id not found`})
        }

        const notFound_Fields = []
        for(let i of subject_id){
            let existingFields = await Field.findOne({where: {id: i}})
            if(!existingFields) notFound_Fields.push(i)
        }
        if(notFound_Fields.length) {
            sendLog(`⚠️ Bazi field_id topilmadi
                📌 Foydalanuvchi: (${req.user?.id} - ${req.user?.name})
                📂 Route: ${req.originalUrl}
                🔍 Kiritilgan field_id: ${JSON.stringify(field_id)}
            `);
            return res.status(404).send({message: `Fields with ${notFound_Fields} id not found`})
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

        res.send({id: newCenter.id, ...req.body});
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


app.get("/get/all", async (req, res) => {
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
                { model: User, attributes: ["id", "email", "name"] },
                { model: Subject, through: { attributes: [] } },
                { model: Field, through: { attributes: [] } },
                { model: Region, attributes: ["id", "name"] },
                { model: Branch, attributes: ["id", "name", "location", "region_id"] },
                { model: Comment, attributes: ["id", "star", "comment"] }
            ]
        });

        const centersWithAverageStar = centers.map(center => {
            const comments = center.Comments || [];
            const totalStars = comments.reduce((sum, comment) => sum + comment.star, 0);
            const average_star = comments.length > 0 ? (totalStars / comments.length).toFixed(2) : 0;

            return {
                ...center.toJSON(),
                average_star
            };
        });

        sendLog(`✅ Markazlar topildi
            📌 Foydalanuvchi: (${req.user?.id} - ${req.user?.name})
            📂 Route: ${req.originalUrl}
            🔍 Natija: ${centers.length} ta markaz
        `);

        res.send(centersWithAverageStar);
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

app.get("/my-learning-centers", roleMiddleware(["CEO"]), async (req, res)=>{
    try {
        let user_id = req.user.id
        const centers = await Center.findAll({where: {ceo_id: user_id}, include: [
            { model: User, attributes: ["email", "name"] },
            { model: Subject, through: { attributes: [] } },
            { model: Field, through: { attributes: [] } },
            { model: Region, attributes: ["name"] },
            { model: Branch, attributes: ["name", "location", "region_id"] },
            { model: Comment, attributes: ["star", "comment"] },
            { model: Registration}
        ]})
        if(!centers){
            return res.send({message: "You have no learning-centers yet"})
        }
        const centersWithAverageStar = centers.map(center => {
            const comments = center.Comments || [];
            const totalStars = comments.reduce((sum, comment) => sum + comment.star, 0);
            const average_star = comments.length > 0 ? (totalStars / comments.length).toFixed(2) : 0;

            return {
                ...center.toJSON(),
                average_star
            };
        });
        res.send(centersWithAverageStar)
    } catch (error) {   
        res.status(400).send({error: error.message})
    }
})

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
        
        let students = await User.findAndCountAll({attributes: ["id", "name", "email", "phone"], include: [{model: Registration, where: {learningCenter_id: req.query.learningCenter_id}}]});

        if (!students.rows.length) {
            sendLog(`⚠️ Oquvchilar topilmadi
                📌 Foydalanuvchi: (${req.user?.id} - ${req.user?.name})
                📂 Route: ${req.originalUrl}
                🔍 learningCenter_id: ${req.query.learningCenter_id}
            `);
            return res.send({ message: "No students found" });
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
                { model: User, attributes: ["email", "name"] },
                { model: Subject, through: { attributes: [] } },
                { model: Field, through: { attributes: [] } },
                { model: Region, attributes: ["name"] },
                { model: Branch, attributes: ["name", "location"] },
                { model: Comment, attributes: ["star", "comment"] }
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

app.patch("/:id", roleMiddleware(["CEO", "SUPER-ADMIN"]), async (req, res) => {
    const { id } = req.params;
    let { field_id, subject_id } = req.body;

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

        if (field_id && Array.isArray(field_id)) {
            const existingFields = await CenterField.findAll({ where: { CenterId: id } });
            const existingFieldIds = existingFields.map(f => f.FieldId);

            const fieldsToRemove = existingFieldIds.filter(f => !field_id.includes(f));
            const fieldsToAdd = field_id.filter(f => !existingFieldIds.includes(f));

            await CenterField.destroy({ where: { CenterId: id, FieldId: fieldsToRemove } });

            await CenterField.bulkCreate(fieldsToAdd.map(f => ({ CenterId: id, FieldId: f })));
        }

        if (subject_id && Array.isArray(subject_id)) {
            const existingSubjects = await CenterSubject.findAll({ where: { CenterId: id } });
            const existingSubjectIds = existingSubjects.map(s => s.SubjectId);

            const subjectsToRemove = existingSubjectIds.filter(s => !subject_id.includes(s));
            const subjectsToAdd = subject_id.filter(s => !existingSubjectIds.includes(s));

            await CenterSubject.destroy({ where: { CenterId: id, SubjectId: subjectsToRemove } });

            await CenterSubject.bulkCreate(subjectsToAdd.map(s => ({ CenterId: id, SubjectId: s })));
        }

        await center.update(req.body);

        sendLog(`✅ O‘quv markazi yangilandi
            📌 Foydalanuvchi: (${req.user?.id} - ${req.user?.name})
            📂 Route: ${req.originalUrl}
            🔍 ID: ${id}
            🔄 Yangilangan ma'lumot: ${JSON.stringify(req.body)}
        `);

        res.send(await Center.findByPk(id, {
            include: [
                { model: User, attributes: ["email", "name"] },
                { model: Subject, through: { attributes: [] } },
                { model: Field, through: { attributes: [] } },
                { model: Region, attributes: ["name"] },
                { model: Branch, attributes: ["name", "location"] },
                { model: Comment, attributes: ["star", "comment"] }
            ]
        }));
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