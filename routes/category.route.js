const CategoryValidation = require("../validation/category.validation")
const app = require("express").Router()
const {Category, Resource} = require("../models/index.module")
const { Op } = require("sequelize")
const { roleMiddleware } = require("../middleware/role.middleware")
const { AuthMiddleware } = require("../middleware/auth.middleware")


/**
 * @swagger
 * tags:
 *   name: Category
 *   description: API endpoints for managing categories
 */

/**
 * @swagger
 * /category:
 *   post:
 *     summary: Create a new category
 *     security:
 *       - BearerAuth: []
 *     tags: 
 *       - Category
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Category'
 *     responses:
 *       200:
 *         description: Category created successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized access
 * 
 *   get:
 *     summary: Get all categories with optional filters
 *     security:
 *       - BearerAuth: []
 *     tags: 
 *       - Category
 *     parameters:
 *       - name: name
 *         in: query
 *         description: Filter categories by name
 *         schema:
 *           type: string
 *       - name: limit
 *         in: query
 *         description: Number of categories per page
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
 *         description: List of categories retrieved successfully
 *       404:
 *         description: No categories found
 *       400:
 *         description: Invalid request
 * 
 * /category/{id}:
 *   get:
 *     summary: Get a category by ID
 *     security:
 *       - BearerAuth: []
 *     tags: 
 *       - Category
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: Category ID
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Category retrieved successfully
 *       404:
 *         description: Category not found
 * 
 *   patch:
 *     summary: Update a category by ID
 *     security:
 *       - BearerAuth: []
 *     tags: 
 *       - Category
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: Category ID
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Category'
 *     responses:
 *       200:
 *         description: Category updated successfully
 *       404:
 *         description: Category not found
 * 
 *   delete:
 *     summary: Delete a category by ID
 *     security:
 *       - BearerAuth: []
 *     tags: 
 *       - Category
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: Category ID
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Category deleted successfully
 *       404:
 *         description: Category not found
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Category:
 *       type: object
 *       required:
 *         - name
 *       properties:
 *         name:
 *           type: string
 *           example: Book
 *           description: Name of the category
 *         image:
 *           type: string
 *           example: photo
 *           description: Optional image URL for the category
 */

app.post("/", roleMiddleware(["ADMIN", "CEO"]) , async(req, res)=>{
    try {
        let { error } = CategoryValidation.validate(req.body)
        if (error){
            return res.status(400).send({ message: error.details?.[0]?.message || "Validation error" })
        }

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
            return res.status(404).send("Category not found")
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
            return res.status(404).send("Category not found")
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
            return res.status(404).send("Category not found")
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
            return res.status(404).send("Category not found")
        }
        
        await data.update(req.body)
        res.status(200).send(data)
    } catch (error) {
        console.log({message: error})
        res.status(400).send({message: error})
    }
})


module.exports = app