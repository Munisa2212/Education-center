const router = require("express").Router();
const {Comment, User, Center} = require("../models/index.module")
const { AuthMiddleware } = require("../middleware/auth.middleware")
const { roleMiddleware } = require("../middleware/role.middleware")
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
 * 
 *   /comment/search:
 *     get:
 *       summary: Search for comments with filters
 *       tags: [Comment]
 *       parameters:
 *         - in: query
 *           name: user_id
 *           schema:
 *             type: integer
 *           description: Filter by user ID
 *         - in: query
 *           name: comment
 *           schema:
 *             type: string
 *           description: Filter by comment content
 *         - in: query
 *           name: star
 *           schema:
 *             type: integer
 *           description: Filter by star rating
 *         - in: query
 *           name: learningCenter_id
 *           schema:
 *             type: integer
 *           description: Filter by learning center ID
 *         - in: query
 *           name: take
 *           schema:
 *             type: integer
 *           description: Number of records per page
 *         - in: query
 *           name: page
 *           schema:
 *             type: integer
 *           description: Page number
 *         - in: query
 *           name: sortBy
 *           schema:
 *             type: string
 *           description: Sorting column
 *         - in: query
 *           name: sortOrder
 *           schema:
 *             type: string
 *             enum: [ASC, DESC]
 *           description: Sorting order
 *       responses:
 *         200:
 *           description: Filtered list of comments
 * 
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
 *         user_id:
 *           type: integer
 *           example: 5
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
        let { comment, star, learningCenter_id } = req.body;

        if(req.user.role !== "ADMIN" && req.user.id != comment.user_id){
            return res.status(403).send({ message: `You are not allowed to edit this comment. ${req.user.role} can edit only his own comment` });
        }

        let updatedComment = await Comment.update({comment, star, learningCenter_id}, {where: {id: req.params.id}});
        res.send(updatedComment);
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

        let deleted = await comment.destroy();
        res.send({deleted_data:  deleted, message: "Comment deleted successfully" });
    } catch (error) {
        res.status(400).send(error)
    }
})
module.exports = router