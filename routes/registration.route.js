const { roleMiddleware } = require("../middleware/role.middleware")
const {Registration, User} = require("../models/index.module")
const RegistrationValidation = require("../validation/registration.validation")
const app = require("express").Router()
/**
 * @swagger
 * tags:
 *   name: Registration
 *   description: User registration for learning centers
 * 
 * paths:
 *   /registration:
 *     post:
 *       summary: Register a user for a course
 *       security:
 *         - BearerAuth: []
 *       tags: [Registration]
 *       requestBody:
 *         required: true
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Registration'
 *       responses:
 *         201:
 *           description: User successfully registered
 *         400:
 *           description: Validation error or age restriction
 * 
 *   /registration/{id}:
 *     delete:
 *       summary: Delete a registration
 *       security:
 *         - BearerAuth: []
 *       tags: [Registration]
 *       parameters:
 *         - in: path
 *           name: id
 *           required: true
 *           schema:
 *             type: integer
 *           description: Registration ID
 *       responses:
 *         200:
 *           description: Registration deleted successfully
 *         404:
 *           description: Registration not found
 * 
 * components:
 *   schemas:
 *     Registration:
 *       type: object
 *       properties:
 *         learningCenter_id:
 *           type: integer
 *           minimum: 1
 *           example: 1
 *         branch_id:
 *           type: integer
 *           minimum: 1
 *           example: 2
 *         date:
 *           type: string
 *           format: date
 *           example: "2025-03-25"
 */


app.post("/", roleMiddleware(["ADMIN", "CEO"]) , async(req, res)=>{
    const id = req.user.id
    try {
        let { error } = RegistrationValidation.validate(req.body)
        if (error) return res.status(400).send({ message: error.details?.[0]?.message || "Validation error" })
        
        let currentYear = new Date().getFullYear()

        let user = await User.findByPk(id)
        let age = currentYear - user.year
        
        if(age < 18){
            return res.send("You cannot register to course. Please register with your parent's account")
        }

        const {...data} = req.body
        const newRegister = await Registration.create({...data, user_id: id})
        res.send(newRegister)
    } catch (error) {
        console.log({message: error})
        res.status(400).send({message: error.details[0].message})
    }
})

app.delete("/:id", roleMiddleware(["ADMIN"]) , async(req, res)=>{
    const {id} = req.params
    try {
        if(!id){
            return res.status(400).send("Wrong id")
        }

        const data = await Registration.findByPk(id)
        if(!data){
            return res.status(404).send("Data not found")
        }

        await data.destroy()
        res.send(data)
    } catch (error) {
        console.log({message: error})
        res.status(400).send({message: error.details[0].message})
    }
})


module.exports = app