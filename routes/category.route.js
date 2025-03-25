const CategoryValidation = require("../validation/category.validation")
const app = require("express").Router()
const {Category, Resource} = require("../models/index.module")
const { Op } = require("sequelize")
const { roleMiddleware } = require("../middleware/role.middleware")
const { AuthMiddleware } = require("../middleware/auth.middleware")

app.post("/", roleMiddleware(["ADMIN"]) , async(req, res)=>{
    try {
        let { error } = CategoryValidation.validate(req.body)
        if (error) return res.status(400).send({ message: error.details?.[0]?.message || "Validation error" })

        const newCategory = await Category.create(req.body)
        res.send(newCategory)
    } catch (error) {
        console.log({message: error})
        res.status(400).send({message: error})
    }
})

app.get("/", AuthMiddleware() , async(req, res)=>{
    const {name, limit = 10, page = 1, order = "ASC", sortBy = "id"} = req.query                                                                     
    try {
        const where = {};

        if (name) where.name = { [Op.like]: `%${name}%` };

        const data = await Category.findAll({
            where,
            limit: parseInt(limit),
            offset: (parseInt(page) - 1) * parseInt(limit),
            order: [[sortBy, order.toUpperCase()]],
            include: [{model: Resource, attributes: ["name", "description"]}]
        });

        if(!data){
            res.status(404).send("Category not found")
        }
        res.send(data)
    } catch (error) {
        console.log({message: error})
        res.status(400).send({message: error})
    }
})

app.get("/:id", roleMiddleware(["ADMIN"]) , async(req, res)=>{
    const {id} = req.params
    try {
        if(!id){
            return res.status(400).send("Wrong id")
        }

        const data = await Category.findByPk(id, {
            include: [{model: Resource, attributes: ["name", "description"]}]
        })
        if(!data){
            res.status(404).send("Category not found")
        }
        res.send(data)
    } catch (error) {
        console.log({message: error})
        res.status(400).send({message: error})
    }
})

app.delete("/:id", roleMiddleware(["ADMIN"]) , async(req, res)=>{
    const {id} = req.params
    try {
        if(!id){
            return res.status(400).send("Wrong id")
        }
        
        const data = await Category.findByPk(id)
        if(!data){
            res.status(404).send("Category not found")
        }
        await data.destroy()
        res.status(200).send(data)
    } catch (error) {
        console.log({message: error})
        res.status(400).send({message: error})
    }
})

app.patch("/:id", roleMiddleware(["ADMIN", "SUPER-ADMIN"]) , async(req, res)=>{
    const {id} = req.params
    try {
        if(!id){
            return res.status(400).send("Wrong id")
        }

        const data = await Category.findByPk(id)
        if(!data){
            res.status(404).send("Category not found")
        }
        
        await data.update(req.body)
        res.status(200).send(data)
    } catch (error) {
        console.log({message: error})
        res.status(400).send({message: error})
    }
})


module.exports = app