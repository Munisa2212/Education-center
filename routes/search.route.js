const router = require("express").Router()
const { AuthMiddleware } = require("../middleware/auth.middleware")
const {roleMiddleware} = require("../middleware/role.middleware")
const { Op } = require("sequelize")
const { Comment, User, Center } = require("../models/index.module")

router.get("/comment", async(req, res)=>{
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

router.get("/user", roleMiddleware(["ADMIN"]), async (req, res) => {
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

router.get("/center", roleMiddleware(["ADMIN"]), async (req, res) => {
    try {
        let { name, region_id, ceo_id, subject_id, field_id, limit = 10, page = 1, order = "ASC", sortBy = "id"} = req.query
        const where = {};

        if (name) where.name = { [Op.like]: `%${name}%` };
        if (region_id) where.region_id = region_id
        if (ceo_id) where.ceo_id = ceo_id
        if(subject_id) where.subject_id = subject_id
        if(field_id) where.field_id = field_id

        const centers = await Center.findAll({
            where,
            limit: parseInt(limit),
            offset: (parseInt(page) - 1) * parseInt(limit),
            order: [[sortBy, order.toUpperCase()]],
            include: [{model: Region, attributes: ["name"]}, {model: User, attributes: ["email", "name"]}, {model: Branch, attributes: ["name", "location"]}, {model: Comment, attributes: ["star", "comment"]}]
        });

        if(!centers){
            return res.status(203).send({message: "Nothing found"})
        }

        res.send(centers)
    } catch (error) {
        res.status(400).send(error)
    }
})