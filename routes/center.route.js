const { Op } = require("sequelize");
const {Center, Region, User} = require("../models/index.module");
const CenterValidation = require("../validation/center.validation");
const { roleMiddleware } = require("../middleware/role.middleware");
const { AuthMiddleware } = require("../middleware/auth.middleware");
const app = require("express").Router()

app.post("/", roleMiddleware(["CEO"]) , async(req, res)=>{
    try {
        let { error } = CenterValidation.validate(req.body)
        if (error) return res.status(400).send({ message: error.details[0].message })
        
        const newCenter = await Center.create(req.body)
        res.send(newCenter)
    } catch (error) {
        console.log(error)
        res.status(400).send({message: error.details[0].message})
    }
})

app.get("/", AuthMiddleware , async(req, res)=>{
    const {name, region_id, ceo_id, limit = 10, page = 1, order = "ASC", sortBy = "id"} = req.query
    try {
        const where = {};

        if (name) where.name = { [Op.like]: `%${name}%` };
        if (region_id) where.region_id = { [Op.like]: `%${region_id}%` };
        if (ceo_id) where.ceo_id = { [Op.like]: `%${ceo_id}%` };
        
        const centers = await Center.findAll({
            where,
            limit: parseInt(limit),
            offset: (parseInt(page) - 1) * parseInt(limit),
            order: [[sortBy, order.toUpperCase()]],
            include: [{model: Region, attributes: ["name"]}, {model: User, attributes: ["email", "name"]}]
        });

        if(!centers){
            return res.status({message: "Nothing found"})
        }

        res.send(centers)
    } catch (error) {
        console.log(error)
        res.status(400).send({message: error.details[0].message})
    }
})

app.get("/:id", roleMiddleware(["CEO"]) , async(req, res)=>{
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
        res.status(400).send({message: error.details[0].message})
    }
})

app.patch("/:id", roleMiddleware(["CEO"]) , async(req, res)=>{
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
        res.status(400).send({message: error.details[0].message})
    }
})

app.delete("/:id", roleMiddleware(["CEO"]) , async(req, res)=>{
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
        res.status(400).send({message: error.details[0].message})
    }
})

module.exports = app