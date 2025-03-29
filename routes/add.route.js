const express = require("express")
const app = express.Router()
const {AdminValidation} = require("../validation/user.validation") 
const {User, Region} = require("../models/index.module")
const sendLog = require("../logger")
const {roleMiddleware} = require("../middleware/role.middleware")


/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       required:
 *         - name
 *         - year
 *         - email
 *         - password
 *         - phone
 *         - role
 *         - image
 *       properties:
 *         name:
 *           type: string
 *         year:
 *           type: number
 *           minimum: 1950
 *           maximum: 2025
 *         email:
 *           type: string
 *           format: email
 *         password:
 *           type: string
 *         phone:
 *           type: string
 *           length: 13
 *         role:
 *           type: string
 *           enum: ["ADMIN", "SUPER-ADMIN"]
 *         image:
 *           type: string
 */

/**
 * @swagger
 * /admin:
 *   post:
 *     summary: Add a new admin
 *     tags: [Admin]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/User'
 *     responses:
 *       200:
 *         description: Admin added successfully
 *       400:
 *         description: Validation error
 */
app.post("/", roleMiddleware(["ADMIN", "CEO"]), async (req, res) => {
    try {
        const { error } = AdminValidation.validate(req.body);
        if (error) {
            sendLog(`Admin add failed: ${error.details[0].message}`);
            return res.status(400).json({ msg: error.details[0].message });
        }
        let {region_id = 1} = req.body
        
        let region = await Region.findByPk(region_id)
        if(!region) return res.status(404).send({message: "Region not found"})
    
        let newAdmin = await User.create({...req.body, region_id: region_id});
        sendLog(`Admin added: ${JSON.stringify(newAdmin)}`);
        res.send({message: "New Admin added successfully!", Admins_data: newAdmin});
    } catch (error) {
        sendLog(`Admin add error: ${error.message}`);
        console.log(error.message);
        res.status(400).send({error: error.message})
    }
});


module.exports = app