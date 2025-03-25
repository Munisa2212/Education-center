const { Op } = require("sequelize");
const {Center, Region, User, Branch, Comment} = require("../models/index.module");
const CenterValidation = require("../validation/center.validation");
const { roleMiddleware } = require("../middleware/role.middleware");
const { AuthMiddleware } = require("../middleware/auth.middleware");
const app = require("express").Router()

app.post("/",roleMiddleware(["CEO"]), async(req, res)=>{
    try {
        let { error } = CenterValidation.validate(req.body)
        console.log(error)
        if (error) return res.status(400).send({ message: error.details[0].message})
        
        const newCenter = await Center.create(req.body)
        res.send(newCenter)
    } catch (error) {
        console.log(error)
        res.status(400).send({message: error.details[0].message})
    }
})

app.get("/",AuthMiddleware,  async(req, res)=>{
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

router.get("/average-star", async(req, res)=>{
    try {
        let {center_id} = req.query;

        if(!center_id){
            return res.status(400).send({message: "center_id is required"})
        }

        let center_data = await Comment.findAll({where: {center_id: center_id}});
        
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

        let total = stat / count;
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