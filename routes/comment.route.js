const router = require("express").Router();
const {Comment, User, Center} = require("../models/index.module")
const { AuthMiddleware } = require("../middleware/auth.middleware")
const { Op } = require("sequelize");
const CommentValidation = require("../validation/comment.validation");

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


router.get("/", async(req, res)=>{
    try {
        let comments = await Comment.findAll({include: [{model: User, attributes: ["name", "email"]}, {model: Center, attributes: ["name"]}]});
        res.send(comments);
    } catch (error) {
        res.status(400).send(error)
    }
})



router.get("/:id", async(req, res)=>{
    try {
        let comment = await Comment.findByPk(req.params.id, {include: [{model: User, attributes: ["name", "email"]}, {model: Center, attributes: ["name"]}] });
        if (!comment) return res.status(404).send({ message: "Comment not found" });
        res.send(comment);
    } catch (error) {
        res.status(400).send(error)
    }
})

router.post("/", AuthMiddleware(), async(req, res)=>{
    try {
        let { error } = CommentValidation.validate(req.body)
        if (error) return res.status(400).send({ message: error.details[0].message})

        let { comment, star, learningCenter_id } = req.body;
        let newComment = await Comment.create({comment, star, learningCenter_id, user_id: req.user.id});
        res.send(newComment);
    } catch (error) {
        res.status(400).send(error)
    }
})

router.patch("/:id", AuthMiddleware(), async(req, res)=>{
    try {
        let existingComment = await Comment.findByPk(req.params.id);
        if (!existingComment) return res.status(404).send({ message: "Comment not found" });

        if(req.user.role !== "ADMIN" && req.user.id != existingComment.user_id){
            return res.status(403).send({ message: "You are not allowed to edit this comment." });
        }
        let { comment, star, learningCenter_id } = req.body;

        await existingComment.update({comment, star, learningCenter_id});
        res.send(existingComment);
    } catch (error) {
        res.status(400).send(error)
    }
})

router.delete("/:id", AuthMiddleware(), async(req, res)=>{
    try {
        let comment = await Comment.findByPk(req.params.id);
        if (!comment) return res.status(404).send({ message: "Comment not found" });

        if(req.user.role !== "ADMIN" && req.user.id != comment.user_id){
          return res.status(403).send({ message: `You are not allowed to delete this comment. ${req.user.role} can delete only his own comment` });
        }

        await comment.destroy();
        res.send({deleted_data:  comment, message: "Comment deleted successfully" });
    } catch (error) {
        res.status(400).send(error)
    }
})
module.exports = router