const { Op } = require("sequelize")
const {Resource, Category} = require("../models/index.module")
const ResourceValidation = require("../validation/resource.validation")
const { roleMiddleware } = require("../middleware/role.middleware")
const { AuthMiddleware } = require("../middleware/auth.middleware")
const app = require("express").Router()
/**
 * @swagger
 * tags:
 *   name: Resource
 *   description: Resource management API
 * 
 * paths:
 *   /resource:
 *     post:
 *       summary: Create a new resource
 *       security:
 *         - BearerAuth: []
 *       tags: [Resource]
 *       requestBody:
 *         required: true
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Resource'
 *       responses:
 *         201:
 *           description: Resource created successfully
 *         400:
 *           description: Validation error
 * 
 *     get:
 *       summary: Get a list of resources
 *       security:
 *         - BearerAuth: []
 *       tags: [Resource]
 *       parameters:
 *         - in: query
 *           name: name
 *           schema:
 *             type: string
 *           description: Filter by resource name
 *         - in: query
 *           name: user_id
 *           schema:
 *             type: integer
 *           description: Filter by user ID
 *         - in: query
 *           name: category_id
 *           schema:
 *             type: integer
 *           description: Filter by category ID
 *         - in: query
 *           name: limit
 *           schema:
 *             type: integer
 *             default: 10
 *           description: Number of items per page
 *         - in: query
 *           name: page
 *           schema:
 *             type: integer
 *             default: 1
 *           description: Page number
 *         - in: query
 *           name: order
 *           schema:
 *             type: string
 *             enum: [ASC, DESC]
 *             default: ASC
 *           description: Sort order
 *         - in: query
 *           name: sortBy
 *           schema:
 *             type: string
 *             default: id
 *           description: Sort by field
 *       responses:
 *         200:
 *           description: List of resources
 *         400:
 *           description: Bad request
 * 
 *   /resource/{id}:
 *     get:
 *       summary: Get a resource by ID
 *       security:
 *         - BearerAuth: []
 *       tags: [Resource]
 *       parameters:
 *         - in: path
 *           name: id
 *           required: true
 *           schema:
 *             type: integer
 *           description: Resource ID
 *       responses:
 *         200:
 *           description: Resource found
 *         404:
 *           description: Resource not found
 * 
 *     delete:
 *       summary: Delete a resource
 *       security:
 *         - BearerAuth: []
 *       tags: [Resource]
 *       parameters:
 *         - in: path
 *           name: id
 *           required: true
 *           schema:
 *             type: integer
 *           description: Resource ID
 *       responses:
 *         200:
 *           description: Resource deleted
 *         404:
 *           description: Resource not found
 * 
 *     patch:
 *       summary: Update a resource
 *       security:
 *         - BearerAuth: []
 *       tags: [Resource]
 *       parameters:
 *         - in: path
 *           name: id
 *           required: true
 *           schema:
 *             type: integer
 *           description: Resource ID
 *       requestBody:
 *         required: true
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Resource'
 *       responses:
 *         200:
 *           description: Resource updated
 *         404:
 *           description: Resource not found
 * 
 * components:
 *   schemas:
 *     Resource:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *           example: English article
 *           minLength: 2
 *         image:
 *           type: string
 *           example: photo
 *         description:
 *           type: string
 *           example: Good article
 *         category_id:
 *           type: integer
 *           example: 1
 *         file:
 *           type: string
 *         link:
 *           type: string
 */


app.post("/",AuthMiddleware(), async(req, res)=>{
    const id = req.user.id
    try {
        let { error } = ResourceValidation.validate(req.body)
        if (error) return res.status(400).send({ message: error.details?.[0]?.message || "Validation error" })
        
        const {...data} = req.body
        const newResource = await Resource.create({...data, user_id: id})
        res.send(newResource)
    } catch (error) {
        console.log({message: error})
        res.status(400).send({message: error.details[0].message || error})
    }
})

app.get("/",AuthMiddleware(), async(req, res)=>{
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
        console.log({message: error})
        res.status(400).send({message: error.details[0].message || error})
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
        res.status(400).send({message: error.details[0].message || error})
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
        console.log({message: error})
        res.status(400).send({message: error.details[0].message || error})
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
        console.log({message: error})
        res.status(400).send({message: error.details[0].message || error})
    }
})

module.exports = app