const {Like} = require("../models/index.module")
const {User} = require("../models/index.module")
const {Center} = require("../models/index.module")
const router = require("express").Router()
const { AuthMiddleware } = require("../middleware/auth.middleware")

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

router.get("/", async (req, res) => {
    try {
        let likes = await Like.findAll();
        res.send(likes);
    } catch (error) {
        res.status(400).send(error)
    }
})

router.post("/", AuthMiddleware(),async (req, res) => {
    try {
        let {learningCenter_id} = req.body
        let center = await Center.findByPk(learningCenter_id);
        if (!center) return res.status(404).send({ message: "Center not found" });
        let like = await Like.create({user_id: req.user.id, learningCenter_id});
        res.send(like);
    } catch (error) {
        res.status(400).send(error)
    }
})

router.delete("/:id", async (req, res) => {
    try {
        let like = await Like.findByPk(req.params.id);
        if (!like) return res.status(404).send({ message: "Like not found" });
        let deleted = await like.destroy();
        res.send({deleted_data:  deleted, message: "Like deleted successfully" });
    } catch (error) {
        res.status(400).send(error)
    }
})

module.exports = router