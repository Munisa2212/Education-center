const {Like, Center, User} = require("../models/index.module")
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
 *   /like/:
 *     delete:
 *       summary: Remove a like
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

        let existingLike = await Like.findOne({where: {user_id: req.user.id, learningCenter_id: learningCenter_id}})
        
        if(existingLike) return res.status(400).send({message: "You have already liked this learning center"})

        console.log(req.user.id);
        
        if (!await User.findOne({where: {id: req.user.id}})) return res.status(400).send({message: `User with ${req.user.id} id not found`})
        let like = await Like.create({user_id: req.user.id, learningCenter_id});
        res.send(like);
    } catch (error) {
        res.status(400).send(error)
    }
})

router.delete("/", AuthMiddleware(),async (req, res) => {
    try {
        let {learningCenter_id} = req.body
        let like = await Like.findOne({where: {user_id: req.user.id, learningCenter_id: learningCenter_id}});
        if (!like) return res.status(404).send({ message: "You have not liked this learning center yet" });
        let deleted = await like.destroy();
        res.send({deleted_data:  deleted, message: "Like deleted successfully" });
    } catch (error) {
        res.status(400).send(error)
    }
})

module.exports = router