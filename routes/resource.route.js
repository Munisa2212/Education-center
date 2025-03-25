const { Op } = require("sequelize")
const {Resource, Category} = require("../models/index.module")
const ResourceValidation = require("../validation/resource.validation")
const { roleMiddleware } = require("../middleware/role.middleware")
const { AuthMiddleware } = require("../middleware/auth.middleware")
const app = require("express").Router()

app.post("/",AuthMiddleware, async(req, res)=>{
    const id = req.user.id
    try {
        let { error } = ResourceValidation.validate(req.body)
        if (error) return res.status(400).send({ message: error.details?.[0]?.message || "Validation error" })
        
        const {...data} = req.body
        const newResource = await Resource.create({...data, user_id: id})
        res.send(newResource)
    } catch (error) {
        console.log({message: error.details[0].message})
        res.status(400).send({message: error.details[0].message})
    }
})

app.get("/",AuthMiddleware, async(req, res)=>{
    const {name, user_id, category_id, limit = 10, page = 1, order = "ASC", sortBy = "id"} = req.query  
    try {
        const where = {};

        if (name) where.name = { [Op.like]: `%${name}%` };
        if (user_id) where.user_id = { [Op.like]: `%${user_id}%` };
        if (category_id) where.category_id = { [Op.like]: `%${category_id}%` };

        const data = await Resource.findAll({
            where,
            limit: parseInt(limit),
            offset: (parseInt(page) - 1) * parseInt(limit),
            order: [[sortBy, order.toUpperCase()]],
            include: [{model: Category, attributes: ["name"]}]
        });

        if(!data){
            res.status(404).send("Resource not found")
        }
        res.send(data)
    } catch (error) {
        console.log({message: error.details[0].message})
        res.status(400).send({message: error.details[0].message})
    }
})

app.get("/:id", roleMiddleware(["ADMIN"]), async(req, res)=>{
    const {id} = req.params
    try {
        if(!id){
            return res.status(400).send("Wrong id")
        }

        const data = await Resource.findByPk(id, {
            include: [{model: Category, attributes: ["name"]}]
        })
        if(!data){
            res.status(404).send("Resource not found")
        }
        res.send(data)
    } catch (error) {
        console.log({message: error})
        res.status(400).send({message: error.details[0].message})
    }
})

app.delete("/:id", roleMiddleware(["ADMIN"]), async(req, res)=>{
    const {id} = req.params
    try {
        if(!id){
            return res.status(400).send("Wrong id")
        }

        const data = await Resource.findByPk(id)
        if(!data){
            return res.status(404).send("Resource not found")
        }

        await data.destroy()
        res.send(data)
    } catch (error) {
        console.log({message: error.details[0].message})
        res.status(400).send({message: error.details[0].message})
    }
})

app.patch("/:id", roleMiddleware(["SUPER-ADMIN", "ADMIN"]),  async(req, res)=>{
    const {id} = req.params
    try {
        if(!id){
            return res.status(400).send("Wrong id")
        }

        const data = await Resource.findByPk(id)
        if(!data){
            return res.status(404).send("Resource not found")
        }
        
        await data.update(req.body)
        res.send(data)
    } catch (error) {
        console.log({message: error.details[0].message})
        res.status(400).send({message: error.details[0].message})
    }
})

module.exports = app