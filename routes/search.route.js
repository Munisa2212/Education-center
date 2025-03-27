const router = require("express").Router();
const AuthMiddleware = require("../middleware/auth.middleware");
const { roleMiddleware } = require("../middleware/role.middleware");
const { Op } = require("sequelize");
const { Comment, User, Center, Branch, Category, Field, Subject, Region } = require("../models/index.module");
const sendLog = require("../logger")

/**
 * @swagger
 * /search/comment:
 *   get:
 *     summary: Get comments with filtering, sorting, and pagination
 *     tags:
 *       - Search
 *     parameters:
 *       - name: user_id
 *         in: query
 *         description: Filter by user ID
 *         schema:
 *           type: integer
 *       - name: comment
 *         in: query
 *         description: Filter by comment text
 *         schema:
 *           type: string
 *       - name: star
 *         in: query
 *         description: Filter by star rating
 *         schema:
 *           type: integer
 *       - name: learningCenter_id
 *         in: query
 *         description: Filter by learning center ID
 *         schema:
 *           type: integer
 *       - name: take
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
 *       - name: sortOrder
 *         in: query
 *         description: Sorting order (ASC or DESC)
 *         schema:
 *           type: string
 *           enum: [ASC, DESC]
 *           default: ASC
 *     responses:
 *       200:
 *         description: List of comments
 *       400:
 *         description: Bad request
 */

/**
 * @swagger
 * /search/user:
 *   get:
 *     summary: Get users with filtering
 *     tags:
 *       - Search
 *     parameters:
 *       - name: name
 *         in: query
 *         description: Filter by username
 *         schema:
 *           type: string
 *       - name: email
 *         in: query
 *         description: Filter by email
 *         schema:
 *           type: string
 *       - name: phone
 *         in: query
 *         description: Filter by phone number
 *         schema:
 *           type: string
 *       - name: role
 *         in: query
 *         description: Filter by user role
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of users
 *       400:
 *         description: Bad request
 */

/**
 * @swagger
 * /search/center :
 *   get:
 *     summary: Get centers with filtering, sorting, and pagination
 *     tags:
 *       - Search
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
 * /search/branch :
 *   get:
 *     summary: Get branches with filtering, sorting, and pagination
 *     tags:
 *       - Search
 *     parameters:
 *       - name: name
 *         in: query
 *         description: Filter by branch name
 *         schema:
 *           type: string
 *       - name: location
 *         in: query
 *         description: Filter by branch location
 *         schema:
 *           type: string
 *       - name: center_id
 *         in: query
 *         description: Filter by center ID
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
 *         description: List of branches
 *       400:
 *         description: Bad request
 */

/**
 * @swagger
 * /search/category :
 *   get:
 *     summary: Get categories with filtering, sorting, and pagination
 *     tags:
 *       - Search
 *     parameters:
 *       - name: name
 *         in: query
 *         description: Filter by category name
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
 *         description: List of categories
 *       404:
 *         description: Category not found
 *       400:
 *         description: Bad request
 */

/**
 * @swagger
 * /search/field :
 *   get:
 *     summary: Get fields with filtering, sorting, and pagination
 *     tags:
 *       - Search
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
 * /search/subject :
 *   get:
 *     summary: Get subjects with filtering, sorting, and pagination
 *     tags:
 *       - Search
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
 * /search/region :
 *   get:
 *     summary: Get regions with filtering, sorting, and pagination
 *     tags:
 *       - Search
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

router.get("/comment", async (req, res) => {
    try {
        let { user_id, comment, star, learningCenter_id, take, page, sortBy, sortOrder } = req.query;
        const where = {};

        sendLog(`📥 Sorov qabul qilindi | 🔍 GET /comment | 📌 Query Params: ${JSON.stringify(req.query)}`);

        if (user_id) where.user_id = user_id;
        if (comment) where.comment = { [Op.like]: `%${comment}%` };
        if (star) where.star = star;
        if (learningCenter_id) where.learningCenter_id = learningCenter_id;

        const limit = parseInt(take) || 10;
        const offset = (parseInt(page) - 1) * limit;
        const order = [[sortBy || "id", (sortOrder || "ASC").toUpperCase()]];

        sendLog(`🔄 Filtirlangan ma'lumotlar | 📌 Filter: ${JSON.stringify(where)} | 📊 Limit: ${limit} | 📍 Page: ${page} | 📌 Sort: ${JSON.stringify(order)}`);

        const comments = await Comment.findAll({
            where,
            limit,
            offset,
            order,
            include: [
                { model: User, attributes: ["name", "email"] },
                { model: Center, attributes: ["name"] },
            ],
        });

        if (!comments.length) {
            sendLog(`⚠️ Hech qanday izoh topilmadi | 🔍 Query: ${JSON.stringify(req.query)}`);
            return res.status(404).send({ message: "Comments not found" });
        }

        sendLog(`✅ ${comments.length} ta izoh topildi | 🔍 Query: ${JSON.stringify(req.query)}`);
        res.send(comments);

    } catch (error) {
        sendLog(`❌ Xatolik: ${error.message} | 🔍 GET /comment | 🛠 Stack: ${error.stack}`);
        res.status(400).send({ message: error.message });
    }
});

router.get("/user", roleMiddleware(["ADMIN"]), async (req, res) => {
    try {
        let { name, email, phone, role } = req.query;
        const where = {};

        sendLog(`📥 Sorov qabul qilindi | 🔍 GET /user | 📌 Query Params: ${JSON.stringify(req.query)}`);

        if (name) where.username = { [Op.like]: `%${name}%` };
        if (email) where.email = { [Op.like]: `%${email}%` };
        if (phone) where.phone = { [Op.like]: `%${phone}%` };
        if (role) where.role = role;

        sendLog(`🔄 Filtirlangan ma'lumotlar | 📌 Filter: ${JSON.stringify(where)}`);

        const users = await User.findAll({ where });

        if (!users.length) {
            sendLog(`⚠️ Hech qanday user topilmadi | 🔍 Query: ${JSON.stringify(req.query)}`);
            return res.status(404).send({ message: "Users not found" });
        }

        sendLog(`✅ ${users.length} ta user topildi | 🔍 Query: ${JSON.stringify(req.query)}`);
        res.send(users);

    } catch (error) {
        sendLog(`❌ Xatolik: ${error.message} | 🔍 GET /user | 🛠 Stack: ${error.stack}`);
        res.status(400).send({ message: error.message });
    }
});

router.get("/center", roleMiddleware(["ADMIN"]), async (req, res) => {
    try {
        let { name, region_id, ceo_id, subject_id, field_id, limit = 10, page = 1, order = "ASC", sortBy = "id" } = req.query;
        const where = {};

        sendLog(`📥 Sorov qabul qilindi | 🔍 GET /center | 📌 Query Params: ${JSON.stringify(req.query)}`);

        if (name) where.name = { [Op.like]: `%${name}%` };
        if (region_id) where.region_id = region_id;
        if (ceo_id) where.ceo_id = ceo_id;
        if (subject_id) where.subject_id = subject_id;
        if (field_id) where.field_id = field_id;

        sendLog(`🔄 Filtirlangan ma'lumotlar | 📌 Filter: ${JSON.stringify(where)}`);

        const centers = await Center.findAll({
            where,
            limit: parseInt(limit),
            offset: (parseInt(page) - 1) * parseInt(limit),
            order: [[sortBy, order.toUpperCase()]],
            include: [
                { model: Region, attributes: ["name"] },
                { model: User, attributes: ["email", "name"] },
                { model: Branch, attributes: ["name", "location"] },
                { model: Comment, attributes: ["star", "comment"] },
            ],
        });

        if (!centers.length) {
            sendLog(`⚠️ Hech qanday oquv markazi topilmadi | 🔍 Query: ${JSON.stringify(req.query)}`);
            return res.status(203).send({ message: "Nothing found" });
        }

        sendLog(`✅ ${centers.length} ta oquv markazi topildi | 🔍 Query: ${JSON.stringify(req.query)}`);
        res.send(centers);

    } catch (error) {
        sendLog(`❌ Xatolik: ${error.message} | 🔍 GET /center | 🛠 Stack: ${error.stack}`);
        res.status(400).send({ message: error.message });
    }
});

router.get("/branch", async (req, res) => {
    try {
        let { name, location, center_id, limit = 10, page = 1, sortBy = "id", order = "ASC" } = req.query;
        const where = {};

        sendLog(`📥 Sorov qabul qilindi | 🔍 GET /branch | 📌 Query Params: ${JSON.stringify(req.query)}`);

        if (name) where.name = { [Op.like]: `%${name}%` };
        if (location) where.location = { [Op.like]: `%${location}%` };
        if (center_id) where.center_id = center_id;

        sendLog(`🔄 Filtrlash qollandi | 📌 Filter: ${JSON.stringify(where)}`);

        const branches = await Branch.findAll({
            where,
            limit: parseInt(limit),
            offset: (parseInt(page) - 1) * parseInt(limit),
            order: [[sortBy, order.toUpperCase()]],
        });

        if (!branches.length) {
            sendLog(`⚠️ Hech qanday filial topilmadi | 🔍 Query: ${JSON.stringify(req.query)}`);
            return res.status(203).send({ message: "Nothing found" });
        }

        sendLog(`✅ ${branches.length} ta filial topildi | 🔍 Query: ${JSON.stringify(req.query)}`);
        res.send(branches);

    } catch (error) {
        sendLog(`❌ Xatolik: ${error.message} | 🔍 GET /branch | 🛠 Stack: ${error.stack}`);
        res.status(400).send({ message: error.message });
    }
});

router.get("/category", async (req, res) => {
    try {
        let { name, limit = 10, page = 1, sortBy = "id", order = "ASC" } = req.query;
        const where = {};

        sendLog(`📥 Sorov qabul qilindi | 🔍 GET /category | 📌 Query Params: ${JSON.stringify(req.query)}`);

        if (name) where.name = { [Op.like]: `%${name}%` };

        sendLog(`🔄 Filtrlash qollandi | 📌 Filter: ${JSON.stringify(where)}`);

        const categories = await Category.findAll({
            where,
            limit: parseInt(limit),
            offset: (parseInt(page) - 1) * parseInt(limit),
            order: [[sortBy, order.toUpperCase()]],
            include: [{ model: Resource, attributes: ["name", "description"] }],
        });

        if (!categories.length) {
            sendLog(`⚠️ Kategoriya topilmadi | 🔍 Query: ${JSON.stringify(req.query)}`);
            return res.status(404).send({ message: "Category not found" });
        }

        sendLog(`✅ ${categories.length} ta kategoriya topildi | 🔍 Query: ${JSON.stringify(req.query)}`);
        res.send(categories);

    } catch (error) {
        sendLog(`❌ Xatolik: ${error.message} | 🔍 GET /category | 🛠 Stack: ${error.stack}`);
        res.status(400).send({ message: error.message });
    }
});


router.get("/field", async (req, res) => {
    try {
        let { name, limit = 10, page = 1, sortBy = "id", order = "ASC" } = req.query;
        const where = {};

        sendLog(`📥 Sorov qabul qilindi | 🔍 GET /field | 📌 Query Params: ${JSON.stringify(req.query)}`);

        if (name) where.name = { [Op.like]: `%${name}%` };

        sendLog(`🔄 Filtrlash qollandi | 📌 Filter: ${JSON.stringify(where)}`);

        const fields = await Field.findAll({
            where,
            limit: parseInt(limit),
            offset: (parseInt(page) - 1) * parseInt(limit),
            order: [[sortBy, order.toUpperCase()]],
        });

        if (!fields.length) {
            sendLog(`⚠️ Maydon topilmadi | 🔍 Query: ${JSON.stringify(req.query)}`);
            return res.status(404).send({ message: "Field not found" });
        }

        sendLog(`✅ ${fields.length} ta maydon topildi | 🔍 Query: ${JSON.stringify(req.query)}`);
        res.send(fields);

    } catch (error) {
        sendLog(`❌ Xatolik: ${error.message} | 🔍 GET /field | 🛠 Stack: ${error.stack}`);
        res.status(400).send({ message: error.message });
    }
});


router.get("/subject", async (req, res) => {
    try {
        let { name, limit = 10, page = 1, sortBy = "id", order = "ASC" } = req.query;
        const where = {};

        sendLog(`📥 Sorov qabul qilindi | 🔍 GET /subject | 📌 Query Params: ${JSON.stringify(req.query)}`);

        if (name) where.name = { [Op.like]: `%${name}%` };

        sendLog(`🔄 Filtrlash qollandi | 📌 Filter: ${JSON.stringify(where)}`);

        const subjects = await Subject.findAll({
            where,
            limit: parseInt(limit),
            offset: (parseInt(page) - 1) * parseInt(limit),
            order: [[sortBy, order.toUpperCase()]],
        });

        if (!subjects.length) {
            sendLog(`⚠️ Fan topilmadi | 🔍 Query: ${JSON.stringify(req.query)}`);
            return res.status(404).send({ message: "Subject not found" });
        }

        sendLog(`✅ ${subjects.length} ta fan topildi | 🔍 Query: ${JSON.stringify(req.query)}`);
        res.send(subjects);

    } catch (error) {
        sendLog(`❌ Xatolik: ${error.message} | 🔍 GET /subject | 🛠 Stack: ${error.stack}`);
        res.status(400).send({ message: error.message });
    }
});


router.get("/region", async (req, res) => {
    try {
        let { name, limit = 10, page = 1, sortBy = "id", order = "ASC" } = req.query;
        const where = {};

        sendLog(`📥 Sorov qabul qilindi | 🔍 GET /region | 📌 Query Params: ${JSON.stringify(req.query)}`);

        if (name) where.name = { [Op.like]: `%${name}%` };

        sendLog(`🔄 Filtrlash qollandi | 📌 Filter: ${JSON.stringify(where)}`);

        const regions = await Region.findAll({
            where,
            limit: parseInt(limit),
            offset: (parseInt(page) - 1) * parseInt(limit),
            order: [[sortBy, order.toUpperCase()]],
        });

        if (!regions.length) {
            sendLog(`⚠️ Hudud topilmadi | 🔍 Query: ${JSON.stringify(req.query)}`);
            return res.status(404).send({ message: "Region not found" });
        }

        sendLog(`✅ ${regions.length} ta hudud topildi | 🔍 Query: ${JSON.stringify(req.query)}`);
        res.send(regions);

    } catch (error) {
        sendLog(`❌ Xatolik: ${error.message} | 🔍 GET /region | 🛠 Stack: ${error.stack}`);
        res.status(400).send({ message: error.message });
    }
});


module.exports = router;