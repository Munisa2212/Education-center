const {Like, Center, User} = require("../models/index.module")
const router = require("express").Router()
const { AuthMiddleware } = require("../middleware/auth.middleware")
const sendLog = require('../logger')

/**
 * @swagger
 * tags:
 *   name: Like
 *   description: Likes management for learning centers
 * 
 * paths:
 *   /like:
 *     get:
 *       summary: Get all likes
 *       tags: [Like]
 *       responses:
 *         200:
 *           description: List of all likes
 * 
 *     post:
 *       summary: Like a learning center
 *       security:
 *         - BearerAuth: []
 *       tags: [Like]
 *       requestBody:
 *         required: true
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Like'
 *       responses:
 *         201:
 *           description: Like successfully added
 *         404:
 *           description: Center not found
 * 
 *   /like/{id}:
 *     delete:
 *       summary: Remove a like
 *       tags: [Like]
 *       parameters:
 *         - in: path
 *           name: id
 *           required: true
 *           schema:
 *             type: integer
 *           description: Like ID
 *       responses:
 *         200:
 *           description: Like deleted successfully
 *         404:
 *           description: Like not found
 * 
 * components:
 *   schemas:
 *     Like:
 *       type: object
 *       properties:
 *         learningCenter_id:
 *           type: integer
 *           example: 3
 */

router.get("/",  async (req, res) => {
    try {
        const userInfo = req.user
            ? `👤 Foydalanuvchi: ID: ${req.user.id}, Role: ${req.user.role}`
            : "👤 Noma'lum foydalanuvchi";

        const routeInfo = `🛤️ Route: ${req.method} ${req.originalUrl}`;

        sendLog(`📥 Sorov boshlandi
                 ${routeInfo}
                 ${userInfo}`);

        let likes = await Like.findAll({
            include: [
                { model: User, attributes: ["id", "name", "email"] },
                { model: Center, attributes: ["id", "name", "region_id"] }
            ]
        });

        if (likes.length === 0) {
            sendLog(`⚠️ Natija: Hech qanday like topilmadi
                     ${routeInfo}`);
            return res.status(404).send({ message: "No likes found" });
        }

        sendLog(`✅ Sorov muvaffaqiyatli bajarildi
                 ${routeInfo}
                 🔢 Jami like: ${likes.length}
                 📊 Sorov natijasi: ${JSON.stringify(likes, null, 2)}`);

        res.send(likes);
    } catch (error) {
        sendLog(`❌ Xatolik yuz berdi: ${error.message}
                 ${routeInfo}
                 🛠️ Stack: ${error.stack}`);
        res.status(400).send({ message: error.message });
    }
});


router.post("/", AuthMiddleware(), async (req, res) => {
    try {
        const userInfo = `👤 Foydalanuvchi: ID: ${req.user.id}, Role: ${req.user.role}, Email: ${req.user.email}`;
        const routeInfo = `🛤️ Route: ${req.method} ${req.originalUrl}`;

        sendLog(`📥 So‘rov boshlandi
                 ${routeInfo}
                 ${userInfo}
                 📩 Yuborilgan ma’lumotlar: ${JSON.stringify(req.body)}`);

        let { learningCenter_id } = req.body;
        let center = await Center.findByPk(learningCenter_id);

        if (!center) {
            sendLog(`⚠️ Xatolik: Markaz topilmadi
                     ${routeInfo}
                     🔍 Qidirilgan ID: ${learningCenter_id}`);
            return res.status(404).send({ message: "Center not found" });
        }

        let existingLike = await Like.findOne({ where: { user_id: req.user.id, learningCenter_id } });

        if (existingLike) {
            sendLog(`⚠️ Xatolik: Foydalanuvchi allaqachon like bosgan
                     ${routeInfo}
                     🔍 Markaz ID: ${learningCenter_id}`);
            return res.status(400).send({ message: "You have already liked this learning center" });
        }

        let like = await Like.create({ user_id: req.user.id, learningCenter_id });

        sendLog(`✅ Muvaffaqiyatli like qo‘shildi
                 ${routeInfo}
                 👍 Like ID: ${like.id}
                 🔍 Markaz ID: ${learningCenter_id}`);

        res.send(like);
    } catch (error) {
        sendLog(`❌ Xatolik yuz berdi: ${error.message}
                 ${routeInfo}
                 🛠️ Stack: ${error.stack}`);
        res.status(400).send({ message: error.message });
    }
});


router.delete("/:id", AuthMiddleware(), async (req, res) => {
    try {
        const userInfo = `👤 Foydalanuvchi: ID: ${req.user.id}, Role: ${req.user.role}, Email: ${req.user.email}`;
        const routeInfo = `🛤️ Route: ${req.method} ${req.originalUrl}`;

        sendLog(`📥 DELETE so‘rovi boshlandi
                 ${routeInfo}
                 ${userInfo}
                 ❌ O‘chirilishi kerak bo‘lgan ID: ${req.params.id}`);

        let like = await Like.findByPk(req.params.id);

        if (!like) {
            sendLog(`⚠️ Xatolik: Like topilmadi
                     ${routeInfo}
                     🔍 ID: ${req.params.id}`);
            return res.status(404).send({ message: "Like not found" });
        }

        await like.destroy();

        sendLog(`✅ Muvaffaqiyatli ochirildi
                 ${routeInfo}
                 ❌ O‘chirilgan ID: ${req.params.id}`);

        res.send({ deleted_data: like, message: "Like deleted successfully" });
    } catch (error) {
        sendLog(`❌ Xatolik yuz berdi: ${error.message}
                 ${routeInfo}
                 🛠️ Stack: ${error.stack}`);
        res.status(400).send({ message: error.message });
    }
});


module.exports = router