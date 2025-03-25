const { Op } = require("sequelize");
const {Center, Region, User, Branch, Comment, Registration, Subject, Field} = require("../models/index.module");
const CenterValidation = require("../validation/center.validation");
const { roleMiddleware } = require("../middleware/role.middleware");
const { AuthMiddleware } = require("../middleware/auth.middleware");
const app = require("express").Router()

app.post("/",roleMiddleware(["CEO"]), async(req, res)=>{
    try {
        let { error } = CenterValidation.validate(req.body)
        if (error) {return res.status(400).send({ message: error.details[0].message})}
        
        let {subject_id, field_id, ...rest} = req.body

        for (let i of subject_id) {
            let subject= await Subject.findByPk(i)
            if (!subject) return res.status(404).send({ message: `Subject with ${i} id not found` })
        }
        
        for (let i of field_id) {
            let field= await Field.findByPk(i)
            if (!field) return res.status(404).send({ message: `Field with ${i} id not found` })
        }

        const newCenter = await Center.create({
            ...rest,
            subject_id: JSON.stringify(subject_id),
            field_id: JSON.stringify(field_id),
        })

        let data = {
            ...rest,
            subject_id,
            field_id
        }
        res.send(data)
    } catch (error) {
        console.log(error)
        res.status(400).send({message: error})
    }
})

app.get("/",AuthMiddleware(), async(req, res)=>{
    const {name, region_id, ceo_id, limit = 10, page = 1, order = "ASC", sortBy = "id"} = req.query
    try {
        console.log("adse");
        
        const where = {};

        if (name) where.name = { [Op.like]: `%${name}%` };
        if (region_id) where.region_id = { [Op.like]: `%${region_id}%` };
        if (ceo_id) where.ceo_id = { [Op.like]: `%${ceo_id}%` };
        
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
        console.log(error)
        res.status(400).send({message: error})
    }
})

app.get("/students", async(req, res)=>{
    try {
        if(!req.query.learningCenter_id){
            return res.status(400).send({message: "learningCenter_id is required"})
        }

        let student = await Registration.findAll({where: {learningCenter_id: req.query.learningCenter_id}})
        
        res.send(student)
    } catch (error) {
        res.status(400).send(error)
    }
})

app.get("/average-star", roleMiddleware(["CEO"]),async(req, res)=>{
    try {
        let {learningCenter_id} = req.query;

        if(!learningCenter_id){
            return res.status(400).send({message: "learningCenter_id is required"})
        }
        let center_data = await Comment.findAll({where: {learningCenter_id: learningCenter_id}});        
        let average_star = 0
        if(!center_data){
            return res.send({average_star})
        }

        let count = 0
        let star = 0

        center_data.forEach(e => {
            count++
            star += e.star
        });
        let total = star / count;
        res.send({average_star: total})
    } catch (error) {
        res.status(400).send(error)
    }
})

app.get("/ratings/star", async(req, res)=>{
    try {
        let centers = await Center.findAll({include: [{model: Comment, attributes: ["star"]}]})
        let data = []
    } catch (error) {
        res.status(400).send(error) 
    }
})
app.get("/:id",roleMiddleware(["CEO"]),  async(req, res)=>{
    const {id} = req.params
    try {
        if(!id){
            return res.status(400).send({message: "Wrong ID"})
        }
        let center = await Center.findByPk(id, {
            include: [{model: Region, attributes: ["name"]}, {model: User, attributes: ["email", "name"]}]
          });
          if (!center) return res.status(404).send({ message: "Center not found" });
          res.send(center);
    } catch (error) {
        console.log(error)
        res.status(400).send({message: error})
    }
})

app.patch("/:id",roleMiddleware(["CEO"]),  async(req, res)=>{
    const {id} = req.params
    try {
        if(!id){
            return res.status(400).send({message: "Wrong ID"})
        }
        let center = await Center.findByPk(id)
        if(!center){
            return res.status(404).send({message: "Center not found"})
        }

        await center.update(req.body)
        res.send(center)
    } catch (error) {
        console.log(error)
        res.status(400).send({message: error})
    }
})

app.delete("/:id",roleMiddleware(["CEO"]),  async(req, res)=>{
    const {id} = req.params
    try {
        if(!id){
            return res.status(400).send({message: "Wrong ID"})
        }

        let center = await Center.findByPk(id)
        if(!center){
            return res.status(404).send({message: "Center not found"})
        }
        await center.destroy()
        res.send(center)
    } catch (error) {
        console.log(error)
        res.status(400).send({message: error})
    }
})

module.exports = app