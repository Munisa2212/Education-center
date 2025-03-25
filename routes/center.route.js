const { Op } = require("sequelize");
const {Center, Region, User, Branch, Comment, Registration} = require("../models/index.module");
const CenterValidation = require("../validation/center.validation");
const { roleMiddleware } = require("../middleware/role.middleware");
const { AuthMiddleware } = require("../middleware/auth.middleware");
const app = require("express").Router()


/**
 * @swagger
 * /centers:
 *   post:
 *     summary: Create a new center
 *     security:
 *       - BearerAuth: []
 *     tags:
 *       - Centers
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Center'
 *     responses:
 *       200:
 *         description: Center created successfully
 *       400:
 *         description: Validation error
 * 
 *   get:
 *     summary: Get all centers with filtering, sorting, and pagination
 *     security:
 *       - BearerAuth: []
 *     tags:
 *       - Centers
 *     parameters:
 *       - name: name
 *         in: query
 *         description: Filter by center name
 *         schema:
 *           type: string
 *       - name: region_id
 *         in: query
 *         description: Filter by region ID
 *         schema:
 *           type: integer
 *       - name: ceo_id
 *         in: query
 *         description: Filter by CEO ID
 *         schema:
 *           type: integer
 *       - name: limit
 *         in: query
 *         description: Number of results per page
 *         schema:
 *           type: integer
 *           default: 10
 *       - name: page
 *         in: query
 *         description: Page number
 *         schema:
 *           type: integer
 *           default: 1
 *       - name: order
 *         in: query
 *         description: Sorting order (ASC or DESC)
 *         schema:
 *           type: string
 *           enum: [ASC, DESC]
 *           default: ASC
 *       - name: sortBy
 *         in: query
 *         description: Field to sort by
 *         schema:
 *           type: string
 *           default: id
 *     responses:
 *       200:
 *         description: List of centers
 *       203:
 *         description: No centers found
 *       400:
 *         description: Invalid request
 * 
 * /centers/{id}:
 *   get:
 *     summary: Get a center by ID
 *     security:
 *       - BearerAuth: []
 *     tags:
 *       - Centers
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: Center ID
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Center details
 *       404:
 *         description: Center not found
 * 
 *   patch:
 *     summary: Update a center by ID
 *     security:
 *       - BearerAuth: []
 *     tags:
 *       - Centers
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: Center ID
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Center'
 *     responses:
 *       200:
 *         description: Center updated successfully
 *       404:
 *         description: Center not found
 * 
 *   delete:
 *     summary: Delete a center by ID
 *     security:
 *       - BearerAuth: []
 *     tags:
 *       - Centers
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: Center ID
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Center deleted successfully
 *       404:
 *         description: Center not found
 * 
 * /centers/students:
 *   get:
 *     summary: Get students registered in a center
 *     tags:
 *       - Centers
 *     parameters:
 *       - name: learningCenter_id
 *         in: query
 *         required: true
 *         description: Learning center ID
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: List of students
 *       400:
 *         description: learningCenter_id is required
 * 
 * /centers/average-star:
 *   get:
 *     summary: Get average rating of a center
 *     security:
 *       - BearerAuth: []
 *     tags:
 *       - Centers
 *     parameters:
 *       - name: learningCenter_id
 *         in: query
 *         required: true
 *         description: Learning center ID
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Average star rating
 *       400:
 *         description: learningCenter_id is required
 */


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

app.get("/students", async(req, res)=>{
    try {
        if(!req.query.learningCenter_id){
            return res.status(400).send({message: "learningCenter_id is required"})
        }

        let student = await Registration.findAll({where: {learningCenter_id: req.query.learningCenter_id}})

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