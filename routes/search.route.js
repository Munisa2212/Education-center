const router = require("express").Router()
const { AuthMiddleware } = require("../middleware/auth.middleware")
const {roleMiddleware} = require("../middleware/role.middleware")
const { Op } = require("sequelize")
const { Comment, User, Center } = require("../models/index.module")

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

router.get("/search", roleMiddleware(["ADMIN"]), async (req, res) => {
    try {
        let { name, email, phone, role} = req.query;
        const where = {}

        if(name) where.username = { [Op.like]: `%${name}%` }
        if(email) where.email = { [Op.like]: `%${email}%` }
        if(phone) where.phone = { [Op.like]: `%${phone}%` }
        if(role) where.role = role

        let users = await User.findAll({ where });
        res.send(users);
    } catch (error) {
        res.status(400).send(error)
    }
})