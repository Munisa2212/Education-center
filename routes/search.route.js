const router = require("express").Router();
const { AuthMiddleware } = require("../middleware/auth.middleware");
const { roleMiddleware } = require("../middleware/role.middleware");
const { Op } = require("sequelize");
const { Comment, User, Center, Branch, Category, Field, Subject, Region } = require("../models/index.module");

// openapi: 3.0.0
// info:
//   title: Learning Center API
//   description: API for managing comments, users, centers, branches, categories, fields, subjects, and regions.
//   version: 1.0.0

// servers:
//   - url: http://localhost:3000
//     description: Local server

// paths:
//   /comment:
//     get:
//       summary: Get comments
//       description: Retrieve a list of comments with filtering and pagination.
//       parameters:
//         - name: user_id
//           in: query
//           schema:
//             type: integer
//           description: Filter comments by user ID.
//         - name: comment
//           in: query
//           schema:
//             type: string
//           description: Search comments by text.
//         - name: star
//           in: query
//           schema:
//             type: integer
//           description: Filter comments by star rating.
//         - name: learningCenter_id
//           in: query
//           schema:
//             type: integer
//           description: Filter comments by learning center ID.
//         - name: take
//           in: query
//           schema:
//             type: integer
//           description: Number of results per page.
//         - name: page
//           in: query
//           schema:
//             type: integer
//           description: Page number.
//         - name: sortBy
//           in: query
//           schema:
//             type: string
//           description: Field to sort by.
//         - name: sortOrder
//           in: query
//           schema:
//             type: string
//             enum: [ASC, DESC]
//           description: Sort order (ascending or descending).
//       responses:
//         "200":
//           description: A list of comments
//         "400":
//           description: Bad request

//   /user:
//     get:
//       summary: Get users
//       description: Retrieve a list of users with filtering.
//       security:
//         - BearerAuth: []
//       parameters:
//         - name: name
//           in: query
//           schema:
//             type: string
//           description: Filter users by name.
//         - name: email
//           in: query
//           schema:
//             type: string
//           description: Filter users by email.
//         - name: phone
//           in: query
//           schema:
//             type: string
//           description: Filter users by phone number.
//         - name: role
//           in: query
//           schema:
//             type: string
//           description: Filter users by role.
//       responses:
//         "200":
//           description: A list of users
//         "400":
//           description: Bad request
//         "403":
//           description: Forbidden

//   /center:
//     get:
//       summary: Get centers
//       description: Retrieve a list of learning centers.
//       security:
//         - BearerAuth: []
//       parameters:
//         - name: name
//           in: query
//           schema:
//             type: string
//           description: Filter centers by name.
//         - name: region_id
//           in: query
//           schema:
//             type: integer
//           description: Filter centers by region ID.
//         - name: ceo_id
//           in: query
//           schema:
//             type: integer
//           description: Filter centers by CEO ID.
//         - name: subject_id
//           in: query
//           schema:
//             type: integer
//           description: Filter centers by subject ID.
//         - name: field_id
//           in: query
//           schema:
//             type: integer
//           description: Filter centers by field ID.
//         - name: limit
//           in: query
//           schema:
//             type: integer
//           description: Number of results per page.
//         - name: page
//           in: query
//           schema:
//             type: integer
//           description: Page number.
//       responses:
//         "200":
//           description: A list of centers
//         "203":
//           description: No results found
//         "400":
//           description: Bad request
//         "403":
//           description: Forbidden

//   /branch:
//     get:
//       summary: Get branches
//       description: Retrieve a list of branches.
//       parameters:
//         - name: name
//           in: query
//           schema:
//             type: string
//           description: Filter branches by name.
//         - name: location
//           in: query
//           schema:
//             type: string
//           description: Filter branches by location.
//         - name: center_id
//           in: query
//           schema:
//             type: integer
//           description: Filter branches by center ID.
//       responses:
//         "200":
//           description: A list of branches
//         "400":
//           description: Bad request

//   /category:
//     get:
//       summary: Get categories
//       description: Retrieve a list of categories.
//       parameters:
//         - name: name
//           in: query
//           schema:
//             type: string
//           description: Filter categories by name.
//       responses:
//         "200":
//           description: A list of categories
//         "404":
//           description: Category not found
//         "400":
//           description: Bad request

//   /field:
//     get:
//       summary: Get fields
//       description: Retrieve a list of fields.
//       parameters:
//         - name: name
//           in: query
//           schema:
//             type: string
//           description: Filter fields by name.
//       responses:
//         "200":
//           description: A list of fields
//         "404":
//           description: Field not found
//         "400":
//           description: Bad request

//   /subject:
//     get:
//       summary: Get subjects
//       description: Retrieve a list of subjects.
//       parameters:
//         - name: name
//           in: query
//           schema:
//             type: string
//           description: Filter subjects by name.
//       responses:
//         "200":
//           description: A list of subjects
//         "404":
//           description: Subject not found
//         "400":
//           description: Bad request

//   /region:
//     get:
//       summary: Get regions
//       description: Retrieve a list of regions.
//       parameters:
//         - name: name
//           in: query
//           schema:
//             type: string
//           description: Filter regions by name.
//       responses:
//         "200":
//           description: A list of regions
//         "404":
//           description: Region not found
//         "400":
//           description: Bad request

// components:
//   securitySchemes:
//     BearerAuth:
//       type: http
//       scheme: bearer
//       bearerFormat: JWT

    
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