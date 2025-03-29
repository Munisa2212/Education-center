const {Like, Center, User} = require("../models/index.module")
const router = require("express").Router()
const AuthMiddleware = require("../middleware/auth.middleware")
const sendLog = require('../logger');
const { roleMiddleware } = require("../middleware/role.middleware");

/**
 * @swagger
 * tags:
 *   name: Like 💘
 *   description: Likes management for learning centers
 * 
 * paths:
 *   /like:
 *     get:
 *       summary: Get all likes
 *       tags: [Like 💘]
 *       security:
 *         - BearerAuth: []
 *       responses:
 *         200:
 *           description: List of all likes
 * 
 *     post:
 *       summary: Like a learning center
 *       security:
 *         - BearerAuth: []
 *       tags: [Like 💘]
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
 *   /like/:
 *     delete:
 *       summary: Remove a like
 *       security:
 *         - BearerAuth: []
 *       tags: [Like 💘]
 *       requestBody:
 *         required: true
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Like'
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

router.get("/", async (req, res) => {
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

        sendLog(`📥 Sorov boshlandi
                 ${routeInfo}
                 ${userInfo}
                 📩 Yuborilgan malumotlar: ${JSON.stringify(req.body)}`);

        let { learningCenter_id } = req.body;
        let center = await Center.findByPk(learningCenter_id);

        let existingLike = await Like.findOne({where: {user_id: req.user.id, learningCenter_id: learningCenter_id}})
        
        if(existingLike) return res.status(400).send({message: "You have already liked this learning center"})

        console.log(req.user.id);
        
        if (!await User.findOne({where: {id: req.user.id}})) return res.status(400).send({message: `User with ${req.user.id} id not found`})
        let like = await Like.create({user_id: req.user.id, learningCenter_id});
        res.send(like);
    } catch (error) {
        sendLog(`❌ Xatolik yuz berdi: ${error.message}
                 ${routeInfo}
                 🛠️ Stack: ${error.stack}`);
        res.status(400).send({ message: error.message });
    }
});

router.delete("/",AuthMiddleware(),async (req, res) => {
    try {
        let {learningCenter_id} = req.body
        let like = await Like.findOne({where: {user_id: req.user.id, learningCenter_id: learningCenter_id}});
        if (!like) return res.status(404).send({ message: "You have not liked this learning center yet" });
        let deleted = await like.destroy();
        res.send({deleted_data:  deleted, message: "Like deleted successfully" });
    } catch (error) {
        sendLog(`❌ Xatolik yuz berdi: ${error.message}
                 ${routeInfo}
                 🛠️ Stack: ${error.stack}`);
        res.status(400).send({ message: error.message });
    }
});


module.exports = router