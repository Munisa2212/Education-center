const { Op } = require("sequelize")
const {Resource, Category} = require("../models/index.module")
const ResourceValidation = require("../validation/resource.validation")
const { roleMiddleware } = require("../middleware/role.middleware")
const AuthMiddleware = require("../middleware/auth.middleware")
const sendLog = require("../logger")
const app = require("express").Router()
/**
 * @swagger
 * tags:
 *   name: Resource 🛠️
 *   description: Resource management API
 * 
 * paths:
 *   /resource:
 *     post:
 *       summary: Create a new resource
 *       security:
 *         - BearerAuth: []
 *       tags: [Resource 🛠️]
 *       requestBody:
 *         required: true
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Resource'
 *       responses:
 *         201:
 *           description: Resource created successfully
 *         400:
 *           description: Validation error
 * 
 *     get:
 *       summary: Get a list of resources
 *       security:
 *         - BearerAuth: []
 *       tags: [Resource 🛠️]
 *       parameters:
 *         - in: query
 *           name: name
 *           schema:
 *             type: string
 *           description: Filter by resource name
 *         - in: query
 *           name: user_id
 *           schema:
 *             type: integer
 *           description: Filter by user ID
 *         - in: query
 *           name: category_id
 *           schema:
 *             type: integer
 *           description: Filter by category ID
 *         - in: query
 *           name: limit
 *           schema:
 *             type: integer
 *             default: 10
 *           description: Number of items per page
 *         - in: query
 *           name: page
 *           schema:
 *             type: integer
 *             default: 1
 *           description: Page number
 *         - in: query
 *           name: order
 *           schema:
 *             type: string
 *             enum: [ASC, DESC]
 *             default: ASC
 *           description: Sort order
 *         - in: query
 *           name: sortBy
 *           schema:
 *             type: string
 *             default: id
 *           description: Sort by field
 *       responses:
 *         200:
 *           description: List of resources
 *         400:
 *           description: Bad request
 * 
 *   /resource/{id}:
 *     get:
 *       summary: Get a resource by ID
 *       security:
 *         - BearerAuth: []
 *       tags: [Resource 🛠️]
 *       parameters:
 *         - in: path
 *           name: id
 *           required: true
 *           schema:
 *             type: integer
 *           description: Resource ID
 *       responses:
 *         200:
 *           description: Resource found
 *         404:
 *           description: Resource not found
 * 
 *     delete:
 *       summary: Delete a resource
 *       security:
 *         - BearerAuth: []
 *       tags: [Resource 🛠️]
 *       parameters:
 *         - in: path
 *           name: id
 *           required: true
 *           schema:
 *             type: integer
 *           description: Resource ID
 *       responses:
 *         200:
 *           description: Resource deleted
 *         404:
 *           description: Resource not found
 * 
 *     patch:
 *       summary: Update a resource
 *       security:
 *         - BearerAuth: []
 *       tags: [Resource 🛠️]
 *       parameters:
 *         - in: path
 *           name: id
 *           required: true
 *           schema:
 *             type: integer
 *           description: Resource ID
 *       requestBody:
 *         required: true
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Resource'
 *       responses:
 *         200:
 *           description: Resource updated
 *         404:
 *           description: Resource not found
 * 
 * components:
 *   schemas:
 *     Resource:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *           example: English article
 *           minLength: 2
 *         image:
 *           type: string
 *           example: photo
 *         description:
 *           type: string
 *           example: Good article
 *         category_id:
 *           type: integer
 *           example: 1
 *         file:
 *           type: string
 *         link:
 *           type: string
 */


app.post("/", AuthMiddleware(), async (req, res) => {
    const userId = req.user.id;
    try {
      sendLog(`📥 Sorov qabul qilindi | ➕ POST | 🌍 Route: ${req.originalUrl} | 👤 User ID: ${userId} | 📂 Sorov malumoti: ${JSON.stringify(req.body)}`);
  
      let { error } = ResourceValidation.validate(req.body);
      if (error) {
        sendLog(`⚠️ Validatsiya xatosi | 🌍 Route: ${req.originalUrl} | 👤 User ID: ${userId} | 📝 Xabar: ${error.details?.[0]?.message}`);
        return res.status(400).send({ message: error.details?.[0]?.message || "Validation error" });
      }
  
      const { ...data } = req.body;
      const newResource = await Resource.create({ ...data, user_id: userId });
  
      sendLog(`✅ Yangi resurs yaratildi | 🌍 Route: ${req.originalUrl} | 👤 User ID: ${userId} | 🆕 Resource ID: ${newResource.id}`);
  
      res.send(newResource);
    } catch (error) {
      sendLog(`❌ Xatolik: ${error.message} | 🌍 Route: ${req.originalUrl} | 👤 User ID: ${userId} | 🛠️ Stack: ${error.stack}`);
      res.status(400).send({ message: error.details?.[0]?.message || error.message });
    }
  });
  

  app.get("/", async (req, res) => {
    const { name, user_id, category_id, limit = 10, page = 1, order = "ASC", sortBy = "id" } = req.query;

    try {
        sendLog(`📥 Sorov qabul qilindi | 🔍 GET | 🌍 Route: ${req.originalUrl} | 👤 User ID: ${req.user.id} | 📝 Filter: ${JSON.stringify(req.query)}`);

        const where = {};

        if (name) where.name = { [Op.like]: `%${name}%` };
        if (user_id) where.user_id = { [Op.like]: `%${user_id}%` };
        if (category_id) where.category_id = { [Op.like]: `%${category_id}%` };

        const data = await Resource.findAll({
            where,
            limit: parseInt(limit),
            offset: (parseInt(page) - 1) * parseInt(limit),
            order: [[sortBy, order.toUpperCase()]],
            include: [{ model: Category, attributes: ["name"] }]
        });

        if (!data || data.length === 0) {
            sendLog(`⚠️ Resurs topilmadi | 🌍 Route: ${req.originalUrl} | 👤 User ID: ${req.user.id}`);
            return res.status(404).send({ message: "Resource not found" });
        }

        sendLog(`✅ Sorov bajarildi | 🌍 Route: ${req.originalUrl} | 👤 User ID: ${req.user.id} | 🔢 Topilgan resurslar soni: ${data.length}`);

        res.send(data);
    } catch (error) {
        sendLog(`❌ Xatolik: ${error.message} | 🌍 Route: ${req.originalUrl} | 👤 User ID: ${req.user.id} | 🛠️ Stack: ${error.stack}`);
        res.status(400).send({ message: error.details?.[0]?.message || error.message });
    }
});


app.get("/:id", async (req, res) => {
    const { id } = req.params;

    try {
        sendLog(`📥 Sorov qabul qilindi | 🔍 GET | 🌍 Route: ${req.originalUrl} | 👤 User ID: ${req.user.id} | 🆔 Resource ID: ${id}`);

        if (!id) {
            sendLog(`⚠️ Notogri ID | 🌍 Route: ${req.originalUrl} | 👤 User ID: ${req.user.id}`);
            return res.status(400).send({ message: "Wrong ID" });
        }

        const data = await Resource.findByPk(id, {
            include: [{ model: Category, attributes: ["name"] }]
        });

        if (!data) {
            sendLog(`❌ Resurs topilmadi | 🌍 Route: ${req.originalUrl} | 👤 User ID: ${req.user.id} | 🆔 ID: ${id}`);
            return res.status(404).send({ message: "Resource not found" });
        }

        sendLog(`✅ Resurs topildi | 🌍 Route: ${req.originalUrl} | 👤 User ID: ${req.user.id} | 🆔 ID: ${id} | 📂 Resource: ${JSON.stringify(data)}`);

        res.send(data);
    } catch (error) {
        sendLog(`❌ Xatolik: ${error.message} | 🌍 Route: ${req.originalUrl} | 👤 User ID: ${req.user.id} | 🛠️ Stack: ${error.stack}`);
        res.status(400).send({ message: error.details?.[0]?.message || error.message });
    }
});

app.delete("/:id", roleMiddleware(["ADMIN"]), async (req, res) => {
    const { id } = req.params;

    try {
        sendLog(`📥 Sorov qabul qilindi | 🗑 DELETE | 🌍 Route: ${req.originalUrl} | 👤 User ID: ${req.user.id} | 🆔 Resource ID: ${id}`);

        if (!id) {
            sendLog(`⚠️ Notogri ID | 🌍 Route: ${req.originalUrl} | 👤 User ID: ${req.user.id}`);
            return res.status(400).send({ message: "Wrong ID" });
        }

        const data = await Resource.findByPk(id);

        if (!data) {
            sendLog(`❌ Resurs topilmadi | 🌍 Route: ${req.originalUrl} | 👤 User ID: ${req.user.id} | 🆔 ID: ${id}`);
            return res.status(404).send({ message: "Resource not found" });
        }

        await data.destroy();

        sendLog(`✅ Resurs ochirildi | 🌍 Route: ${req.originalUrl} | 👤 User ID: ${req.user.id} | 🆔 ID: ${id} | 📂 Deleted Data: ${JSON.stringify(data)}`);

        res.send({ message: "Resource deleted successfully", deleted_data: data });

    } catch (error) {
        sendLog(`❌ Xatolik: ${error.message} | 🌍 Route: ${req.originalUrl} | 👤 User ID: ${req.user.id} | 🛠️ Stack: ${error.stack}`);
        res.status(400).send({ message: error.details?.[0]?.message || error.message });
    }
});

app.patch("/:id", roleMiddleware(["SUPER-ADMIN", "ADMIN"]), async (req, res) => {
    const { id } = req.params;

    try {
        sendLog(`📥 So‘rov qabul qilindi | ✏ PATCH | 🌍 Route: ${req.originalUrl} | 👤 User ID: ${req.user.id} | 🆔 Resource ID: ${id} | 🔄 Update Data: ${JSON.stringify(req.body)}`);

        if (!id) {
            sendLog(`⚠️ Notogri ID | 🌍 Route: ${req.originalUrl} | 👤 User ID: ${req.user.id}`);
            return res.status(400).send({ message: "Wrong ID" });
        }

        const data = await Resource.findByPk(id);

        if (!data) {
            sendLog(`❌ Resurs topilmadi | 🌍 Route: ${req.originalUrl} | 👤 User ID: ${req.user.id} | 🆔 ID: ${id}`);
            return res.status(404).send({ message: "Resource not found" });
        }

        await data.update(req.body);

        sendLog(`✅ Resurs yangilandi | 🌍 Route: ${req.originalUrl} | 👤 User ID: ${req.user.id} | 🆔 ID: ${id} | 🔄 Yangilangan Data: ${JSON.stringify(data)}`);

        res.send({ message: "Resource updated successfully", updated_data: data });

    } catch (error) {
        sendLog(`❌ Xatolik: ${error.message} | 🌍 Route: ${req.originalUrl} | 👤 User ID: ${req.user.id} | 🛠 Stack: ${error.stack}`);
        res.status(400).send({ message: error.details?.[0]?.message || error.message });
    }
});


module.exports = app