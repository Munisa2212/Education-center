const { AuthMiddleware } = require("../middleware/auth.middleware");
const {Like, Comment, Center} = require("../models/index.module");
const app = require("express").Router()

/**
 * @swagger
 * /rating/star:
 *   get:
 *     summary: Get centers with their star ratings
 *     tags:
 *       - Learning Center Ratings 🏆
 *     responses:
 *       200:
 *         description: List of centers with their star ratings
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   name:
 *                     type: string
 *                     description: Name of the center
 *                   ceo_id:
 *                     type: integer
 *                     description: ID of the CEO
 *                   subject_id:
 *                     type: integer
 *                     description: ID of the subject
 *                   field_id:
 *                     type: integer
 *                     description: ID of the field
 *                   star:
 *                     type: integer
 *                     description: Star rating of the center
 *       400:
 *         description: Bad request
 */

/**
 * @swagger
 * /rating/comments:
 *   get:
 *     summary: Get the total number of comments for a learning center
 *     tags:
 *       - Learning Center Ratings 🏆
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - name: learningCenter_id
 *         in: query
 *         required: true
 *         description: ID of the learning center
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Total number of comments for the learning center
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 totalComments:
 *                   type: integer
 *                   description: Total number of comments
 *       400:
 *         description: Missing or invalid learningCenter_id
 *       404:
 *         description: No comments found for the specified learning center
 */

/**
 * @swagger
 * /rating/likes:
 *   get:
 *     summary: Get the total number of likes for a learning center
 *     tags:
 *       - Learning Center Ratings 🏆
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - name: learningCenter_id
 *         in: query
 *         required: true
 *         description: ID of the learning center
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Total number of likes for the learning center
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 totalLikes:
 *                   type: integer
 *                   description: Total number of likes
 *       400:
 *         description: Missing or invalid learningCenter_id
 *       404:
 *         description: No likes found for the specified learning center
 */

app.get("/star", async (req, res) => {
    try {
        const routeInfo = `🛤️ **Route**: ${req.method} ${req.originalUrl}`;

        sendLog(`📥 Sorov boshlandi
                 ${routeInfo}`);

        let centers = await Center.findAll({
            attributes: ["name"],
            include: [{ model: Comment, attributes: ["star"] }]
        });

        if (!centers.length) {
            sendLog(`⚠️ Xatolik: Hech qanday markaz topilmadi
                     ${routeInfo}`);
            return res.status(404).send({ message: "No centers found" });
        }

        let result = centers.map(c => ({
            name: c.name,
            stars: c.Comments.map(comment => comment.star)
        }));

        sendLog(`✅ Markazlar va reytinglar
                 ${routeInfo}
                 🌟 Natija: ${JSON.stringify(result)}`);

        res.send(result);
    } catch (error) {
        sendLog(`❌ Xatolik yuz berdi: ${error.message}
                 ${routeInfo}
                 🛠️ Stack: ${error.stack}`);
        res.status(400).send({ message: error.message });
    }
});


app.get("/comments", async (req, res) => {
    try {
        const { learningCenter_id } = req.query;
        const routeInfo = `🛤️ oute: ${req.method} ${req.originalUrl}`;

        sendLog(`📥 Sorov boshlandi
                 ${routeInfo}
                 🔍 Qidirilayotgan learningCenter_id: ${learningCenter_id}`);

        if (!learningCenter_id) {
            sendLog(`⚠️ Xatolik: learningCenter_id talab qilinadi
                     ${routeInfo}`);
            return res.status(400).send({ message: "learningCenter_id is required" });
        }

        let center_data = await Comment.findAll({ where: { learningCenter_id } });

        if (!center_data.length) {
            sendLog(`⚠️ Xatolik: Kommentlar topilmadi
                     ${routeInfo}
                     🔍 ID: ${learningCenter_id}`);
            return res.status(404).send({ message: "Nothing found" });
        }

        let totalComments = center_data.length;

        sendLog(`✅ Kommentlar soni
                 ${routeInfo}
                 📝 Jami kommentlar: ${totalComments}`);

        res.send({ totalComments });
    } catch (error) {
        sendLog(`❌ Xatolik yuz berdi: ${error.message}
                 ${routeInfo}
                 🛠️ Stack: ${error.stack}`);
        res.status(400).send({ message: error.message });
    }
});


app.get("/likes", async (req, res) => {
    try {
        const route = `${req.method} ${req.originalUrl}`;
        const { learningCenter_id } = req.query;

        sendLog(`📥 Sorov boshlandi 🔹 route: ${route} 🔍 learningCenter_id: ${learningCenter_id}`);

        if (!learningCenter_id) {
            sendLog(`⚠️ Xatolik: learningCenter_id talab qilinadi 🔹 route: ${route}`);
            return res.status(400).send({ message: "learningCenter_id is required" });
        }

        let center_data = await Like.findAll({ where: { learningCenter_id } });

        if (!center_data.length) {
            sendLog(`⚠️ Xatolik: Like topilmadi 🔹 route: ${route} 🔍 ID: ${learningCenter_id}`);
            return res.status(404).send({ message: "Nothing found" });
        }

        let totalLikes = center_data.length;
        sendLog(`✅ Like'lar soni 🔹 route: ${route} ❤️ Jami likelar: ${totalLikes}`);

        res.send({ totalLikes });
    } catch (error) {
        sendLog(`❌ Xatolik yuz berdi: ${error.message} 🔹 route: ${route} 🛠️ Stack: ${error.stack}`);
        res.status(400).send({ message: error.message });
    }
});

module.exports = app