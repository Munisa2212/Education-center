const router = require("express").Router();
const {Comment, User, Center} = require("../models/index.module")
const { AuthMiddleware } = require("../middleware/auth.middleware")
const { Op } = require("sequelize");
const CommentValidation = require("../validation/comment.validation");
const sendLog = require('../logger')

/**
 * @swagger
 * tags:
 *   name: Comment
 *   description: Comments management for learning centers
 * 
 * paths:
 *   /comment:
 *     get:
 *       summary: Get all comments
 *       tags: [Comment]
 *       responses:
 *         200:
 *           description: List of all comments
 * 
 *     post:
 *       summary: Add a new comment
 *       security:
 *         - BearerAuth: []
 *       tags: [Comment]
 *       requestBody:
 *         required: true
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Comment'
 *       responses:
 *         201:
 *           description: Comment successfully added
 *         400:
 *           description: Validation error
 *   /comment/{id}:
 *     get:
 *       summary: Get a comment by ID
 *       tags: [Comment]
 *       parameters:
 *         - in: path
 *           name: id
 *           required: true
 *           schema:
 *             type: integer
 *           description: Comment ID
 *       responses:
 *         200:
 *           description: Comment found
 *         404:
 *           description: Comment not found
 * 
 *     patch:
 *       summary: Update a comment
 *       security:
 *         - BearerAuth: []
 *       tags: [Comment]
 *       parameters:
 *         - in: path
 *           name: id
 *           required: true
 *           schema:
 *             type: integer
 *           description: Comment ID
 *       requestBody:
 *         required: true
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Comment'
 *       responses:
 *         200:
 *           description: Comment updated
 *         403:
 *           description: User not allowed to update this comment
 * 
 *     delete:
 *       summary: Delete a comment
 *       security:
 *         - BearerAuth: []
 *       tags: [Comment]
 *       parameters:
 *         - in: path
 *           name: id
 *           required: true
 *           schema:
 *             type: integer
 *           description: Comment ID
 *       responses:
 *         200:
 *           description: Comment deleted successfully
 *         403:
 *           description: User not allowed to delete this comment
 * 
 * components:
 *   schemas:
 *     Comment:
 *       type: object
 *       properties:
 *         comment:
 *           type: string
 *           example: "This is a great learning center!"
 *         star:
 *           type: integer
 *           example: 4
 *         learningCenter_id:
 *           type: integer
 *           example: 2
 */ 


router.get("/", async (req, res) => {
    try {
        let comments = await Comment.findAll({
            include: [
                { model: User, attributes: ["name", "email"] },
                { model: Center, attributes: ["name"] }
            ]
        });

        sendLog(`📄 Kommentlar royxati olindi
            📌 Foydalanuvchi: (${req.user?.id} - ${req.user?.name || "Aniqlanmagan"})
            📂 Route: ${req.originalUrl}
            🔢 Topilgan kommentlar: ${comments.length}
        `);

        res.send(comments);
    } catch (error) {
        sendLog(`❌ Xatolik yuz berdi: ${error.message}
            📌 Foydalanuvchi: (${req.user?.id} - ${req.user?.name || "Aniqlanmagan"})
            📂 Route: ${req.originalUrl}
            🛠️ Stack: ${error.stack}
        `);
        res.status(400).send({ message: error.message });
    }
});


router.post("/", AuthMiddleware(), async (req, res) => {
    try {
        let { error } = CommentValidation.validate(req.body);
        if (error) {
            return res.status(400).send({ message: error.details[0].message });
        }

        let { comment, star, learningCenter_id } = req.body;
        let newComment = await Comment.create({
            comment,
            star,
            learningCenter_id,
            user_id: req.user.id
        });

        sendLog(`📝 Yangi komment qo‘shildi
            📌 Foydalanuvchi: (${req.user.id} - ${req.user.name})
            📚 O‘quv markazi ID: ${learningCenter_id}
            ⭐ Baho: ${star}
            💬 Izoh: ${comment}
        `);

        res.send(newComment);
    } catch (error) {
        sendLog(`❌ Xatolik yuz berdi: ${error.message}
            📌 Foydalanuvchi: (${req.user?.id} - ${req.user?.name || "Aniqlanmagan"})
            📂 Route: ${req.originalUrl}
            🛠️ Stack: ${error.stack}
        `);
        res.status(400).send({ message: error.message });
    }
});


router.get("/:id", async (req, res) => {
    try {
        let comment = await Comment.findByPk(req.params.id, {
            include: [
                { model: User, attributes: ["name", "email"] },
                { model: Center, attributes: ["name"] }
            ]
        });

        if (!comment) {
            return res.status(404).send({ message: "Comment not found" });
        }

        sendLog(`📄 Komment malumoti olindi
            🆔 Komment ID: ${req.params.id}
            📌 Foydalanuvchi: (${comment.User?.name} - ${comment.User?.email})
            📚 Oquv markazi: ${comment.Center?.name}
            ⭐ Baho: ${comment.star}
            💬 Izoh: ${comment.comment}
        `);

        res.send(comment);
    } catch (error) {
        sendLog(`❌ Xatolik yuz berdi: ${error.message}
            📂 Route: ${req.originalUrl}
            🛠️ Stack: ${error.stack}
        `);
        res.status(400).send({ message: error.message });
    }
});



router.patch("/:id", AuthMiddleware(), async (req, res) => {
    try {
        let existingComment = await Comment.findByPk(req.params.id);
        if (!existingComment) {
            return res.status(404).send({ message: "Comment not found" });
        }

        if (req.user.role !== "ADMIN" && req.user.id != existingComment.user_id) {
            return res.status(403).send({ message: "You are not allowed to edit this comment." });
        }

        let { comment, star, learningCenter_id } = req.body;
        await existingComment.update({ comment, star, learningCenter_id });

        sendLog(`📝 Komment yangilandi
            🆔 Komment ID: ${req.params.id}
            📌 Foydalanuvchi: (${req.user.id} - ${req.user.name})
            ⭐ Yangi baho: ${star}
            💬 Yangi izoh: ${comment}
        `);

        res.send(existingComment);
    } catch (error) {
        sendLog(`❌ Xatolik yuz berdi: ${error.message}
            📂 Route: ${req.originalUrl}
            🛠️ Stack: ${error.stack}
        `);
        res.status(400).send({ message: error.message });
    }
});


router.delete("/:id", AuthMiddleware(), async (req, res) => {
    try {
        let comment = await Comment.findByPk(req.params.id);
        if (!comment) {
            return res.status(404).send({ message: "Comment not found" });
        }

        if (req.user.role !== "ADMIN" && req.user.id != comment.user_id) {
            return res.status(403).send({ message: "You are not allowed to delete this comment." });
        }

        await comment.destroy();

        sendLog(`🗑️ Komment ochirildi
            🆔 Komment ID: ${req.params.id}
            📌 Foydalanuvchi: (${req.user.id} - ${req.user.name})
            💬 Izoh: ${comment.comment}
        `);

        res.send({ deleted_data: comment });
    } catch (error) {
        sendLog(`❌ Xatolik yuz berdi: ${error.message}
            📂 Route: ${req.originalUrl}
            🛠️ Stack: ${error.stack}
        `);
        res.status(400).send({ message: error.message });
    }
});

module.exports = router