const router = require("express").Router();
const { AuthMiddleware } = require("../middleware/auth.middleware");
const { roleMiddleware } = require("../middleware/role.middleware");
const { Op } = require("sequelize");
const { Comment, User, Center, Branch, Category, Field, Subject, Region } = require("../models/index.module");

/**
 * @swagger
 * /search/comment 📝:
 *   get:
 *     summary: Get comments with filtering, sorting, and pagination
 *     tags:
 *       - Search 🔍
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
 * /search/user 👤:
 *   get:
 *     summary: Get users with filtering
 *     tags:
 *       - Search 🔍
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
 * /search/center 🏬:
 *   get:
 *     summary: Get centers with filtering, sorting, and pagination
 *     tags:
 *       - Search 🔍
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
 * /search/branch 🏢:
 *   get:
 *     summary: Get branches with filtering, sorting, and pagination
 *     tags:
 *       - Search 🔍
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
 * /search/category 📂:
 *   get:
 *     summary: Get categories with filtering, sorting, and pagination
 *     tags:
 *       - Search 🔍
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
 * /search/field 🏷️:
 *   get:
 *     summary: Get fields with filtering, sorting, and pagination
 *     tags:
 *       - Search 🔍
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
 * /search/subject 📚:
 *   get:
 *     summary: Get subjects with filtering, sorting, and pagination
 *     tags:
 *       - Search 🔍
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
 * /search/region 🗺:
 *   get:
 *     summary: Get regions with filtering, sorting, and pagination
 *     tags:
 *       - Search 🔍
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

        if (user_id) where.user_id = user_id;
        if (comment) where.comment = { [Op.like]: `%${comment}%` };
        if (star) where.star = star;
        if (learningCenter_id) where.learningCenter_id = learningCenter_id;

        const limit = parseInt(take) || 10;
        const offset = (parseInt(page) - 1) * limit;
        const order = [[sortBy || "id", (sortOrder || "ASC").toUpperCase()]];

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

        res.send(comments);
    } catch (error) {
        res.status(400).send({ message: error.message });
    }
});

router.get("/user", roleMiddleware(["ADMIN"]), async (req, res) => {
    try {
        let { name, email, phone, role } = req.query;
        const where = {};

        if (name) where.username = { [Op.like]: `%${name}%` };
        if (email) where.email = { [Op.like]: `%${email}%` };
        if (phone) where.phone = { [Op.like]: `%${phone}%` };
        if (role) where.role = role;

        const users = await User.findAll({ where });
        res.send(users);
    } catch (error) {
        res.status(400).send({ message: error.message });
    }
});

router.get("/center", roleMiddleware(["ADMIN"]), async (req, res) => {
    try {
        let { name, region_id, ceo_id, subject_id, field_id, limit = 10, page = 1, order = "ASC", sortBy = "id" } = req.query;
        const where = {};

        if (name) where.name = { [Op.like]: `%${name}%` };
        if (region_id) where.region_id = region_id;
        if (ceo_id) where.ceo_id = ceo_id;
        if (subject_id) where.subject_id = subject_id;
        if (field_id) where.field_id = field_id;

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
            return res.status(203).send({ message: "Nothing found" });
        }

        res.send(centers);
    } catch (error) {
        res.status(400).send({ message: error.message });
    }
});

router.get("/branch", async (req, res) => {
    try {
        let { name, location, center_id, limit = 10, page = 1, sortBy = "id", order = "ASC" } = req.query;
        const where = {};

        if (name) where.name = { [Op.like]: `%${name}%` };
        if (location) where.location = { [Op.like]: `%${location}%` };
        if (center_id) where.center_id = center_id;

        const branches = await Branch.findAll({
            where,
            limit: parseInt(limit),
            offset: (parseInt(page) - 1) * parseInt(limit),
            order: [[sortBy, order.toUpperCase()]],
        });

        res.send(branches);
    } catch (error) {
        res.status(400).send({ message: error.message });
    }
})

router.get("/category", async (req, res) => {
    try {
        let { name, limit = 10, page = 1, sortBy = "id", order = "ASC" } = req.query;
        const where = {};

        if (name) where.name = { [Op.like]: `%${name}%` };

        const categories = await Category.findAll({
            where,
            limit: parseInt(limit),
            offset: (parseInt(page) - 1) * parseInt(limit),
            order: [[sortBy, order.toUpperCase()]],
            include: [{ model: Resource, attributes: ["name", "description"] }],
        });

        if (!categories.length) {
            return res.status(404).send({ message: "Category not found" });
        }

        res.send(categories);
    } catch (error) {
        res.status(400).send({ message: error.message });
    }
})

router.get("/field", async (req, res) => {
    try {
        let { name, limit = 10, page = 1, sortBy = "id", order = "ASC" } = req.query;
        const where = {};

        if (name) where.name = { [Op.like]: `%${name}%` };

        const fields = await Field.findAll({
            where,
            limit: parseInt(limit),
            offset: (parseInt(page) - 1) * parseInt(limit),
            order: [[sortBy, order.toUpperCase()]],
        });

        if (!fields.length) {
            return res.status(404).send({ message: "Field not found" });
        }

        res.send(fields);
    } catch (error) {
        res.status(400).send({ message: error.message });
    }
})

router.get("/subject", async (req, res) => {
    try {
        let { name, limit = 10, page = 1, sortBy = "id", order = "ASC" } = req.query;
        const where = {};

        if (name) where.name = { [Op.like]: `%${name}%` };

        const subjects = await Subject.findAll({
            where,
            limit: parseInt(limit),
            offset: (parseInt(page) - 1) * parseInt(limit),
            order: [[sortBy, order.toUpperCase()]],
        });

        if (!subjects.length) {
            return res.status(404).send({ message: "Subject not found" });
        }

        res.send(subjects);
    } catch (error) {
        res.status(400).send({ message: error.message });
    }
})

router.get("/region", async (req, res) => {
    try {
        let { name, limit = 10, page = 1, sortBy = "id", order = "ASC" } = req.query;
        const where = {};

        if (name) where.name = { [Op.like]: `%${name}%` };

        const regions = await Region.findAll({
            where,
            limit: parseInt(limit),
            offset: (parseInt(page) - 1) * parseInt(limit),
            order: [[sortBy, order.toUpperCase()]],
        });

        if (!regions.length) {
            return res.status(404).send({ message: "Region not found" });
        }

        res.send(regions);
    } catch (error) {
        res.status(400).send({ message: error.message });
    }
})

module.exports = router;