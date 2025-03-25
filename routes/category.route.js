const CategoryValidation = require("../validation/category.validation")
const app = require("express").Router()
const {Category} = require("../models/index.module")

app.post("/", async(req, res)=>{
    try {
        let { error } = CategoryValidation.validate(req.body)
        if (error) return res.status(400).send({ message: error.details?.[0]?.message || "Validation error" })

        const newCategory = await Category.create(req.body)
        res.send(newCategory)
    } catch (error) {
        console.log({message: error.details[0].message})
        res.status(400).send({message: error.details[0].message})
    }
})

app.get("/", async(req, res)=>{
    try {
        const data = await Category.findAll()
        if(!data){
            res.status(404).send("Category not found")
        }
        res.send(data)
    } catch (error) {
        console.log({message: error.details[0].message})
        res.status(400).send({message: error.details[0].message})
    }
})

app.get("/:id", async(req, res)=>{
    const {id} = req.params
    try {
        if(!id){
            return res.status(400).send("Wrong id")
        }

        const data = await Category.findByPk(id)
        if(!data){
            res.status(404).send("Category not found")
        }
        res.send(data)
    } catch (error) {
        console.log({message: error.details[0].message})
        res.status(400).send({message: error.details[0].message})
    }
})

app.delete("/:id", async(req, res)=>{
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
        console.log({message: error.details[0].message})
        res.status(400).send({message: error.details[0].message})
    }
})

app.patch("/:id", async(req, res)=>{
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
        console.log({message: error.details[0].message})
        res.status(400).send({message: error.details[0].message})
    }
})


module.exports = app