const router = require("express").Router();
const {Comment, User, Center} = require("../models/index.module")
const { AuthMiddleware } = require("../middleware/auth.middleware")
const { roleMiddleware } = require("../middleware/role.middleware")
const { Op } = require("sequelize");
const CommentValidation = require("../validation/comment.validation");

router.get("/", async(req, res)=>{
    try {
        let comments = await Comment.findAll({include: [{model: User, attributes: ["name", "email"]}, {model: Center, attributes: ["name"]}]});
        res.send(comments);
    } catch (error) {
        res.status(400).send(error)
    }
})

router.get("/search", async(req, res)=>{
    try {
        let {user_id, comment, star, learningCenter_id, take, page, sortBy, sortOrder} = req.query;
        const where = {}

        if(user_id) where.user_id = user_id
        if(comment) where.comment = { [Op.like]: `%${comment}%` }
        if(star) where.star = star
        if(learningCenter_id) where.learningCenter_id = learningCenter_id

        const limit = parseInt(take) || 10;
        const offset = (parseInt(page) - 1) * parseInt(take);
        const order = [[sortBy, sortOrder.toUpperCase()]];

        let comments = await Comment.findAll({ where, limit, offset, order, include: [{model: User, attributes: ["name", "email"]}, {model: Center, attributes: ["name"]}]});
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

router.post("/", AuthMiddleware, async(req, res)=>{
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

router.patch("/:id", AuthMiddleware, async(req, res)=>{
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

router.delete("/:id", AuthMiddleware, async(req, res)=>{
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