const express = require("express")
const app = express.Router()
const {AdminValidation, UserValidation} = require("../validation/user.validation") 
const {User} = require("../models/index.module")
const sendLog = require("../logger")
const {roleMiddleware} = require("../middleware/role.middleware")


/**
 * @swagger
 * /admin:
 *   post:
 *     summary: Add a new admin
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Admin added successfully
 *       400:
 *         description: Validation error
 */
app.post("/admin", roleMiddleware(["ADMIN"]), async (req, res) => {
    try {
        const { error } = AdminValidation.validate(req.body);
        if (error) {
            sendLog(`Admin add failed: ${error.details[0].message}`);
            return res.status(400).json({ msg: error.details[0].message });
        }
        let newAdmin = await User.create(req.body);
        sendLog(`Admin added: ${JSON.stringify(newAdmin)}`);
        res.send(newAdmin);
    } catch (err) {
        sendLog(`Admin add error: ${err.message}`);
        console.log(err.message);
    }
});

/**
 * @swagger
 * /super-admin:
 *   post:
 *     summary: Add a new super admin
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Super Admin added successfully
 *       400:
 *         description: Validation error
 */
app.post("/super-admin", roleMiddleware(["ADMIN"]), async (req, res) => {
    try {
        const { error } = AdminValidation.validate(req.body);
        if (error) {
            sendLog(`Super Admin add failed: ${error.details[0].message}`);
            return res.status(400).json({ msg: error.details[0].message });
        }
        let newSuperAdmin = await User.create(req.body);
        sendLog(`Super Admin added: ${JSON.stringify(newSuperAdmin)}`);
        res.send(newSuperAdmin);
    } catch (err) {
        sendLog(`Super Admin add error: ${err.message}`);
        console.log(err.message);
    }
});

/**
 * @swagger
 * /ceo:
 *   post:
 *     summary: Add a new CEO
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: CEO added successfully
 *       400:
 *         description: Validation error
 */
app.post("/ceo", roleMiddleware(["ADMIN"]), async (req, res) => {
    try {
        const { error } = AdminValidation.validate(req.body);
        if (error) {
            sendLog(`CEO add failed: ${error.details[0].message}`);
            return res.status(400).json({ msg: error.details[0].message });
        }
        let newCEO = await User.create(req.body);
        sendLog(`CEO added: ${JSON.stringify(newCEO)}`);
        res.send(newCEO);
    } catch (err) {
        sendLog(`CEO add error: ${err.message}`);
        console.log(err.message);
    }
});

/**
 * @swagger
 * /user:
 *   post:
 *     summary: Add a new user
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: User added successfully
 *       400:
 *         description: Validation error
 */
app.post("/user", roleMiddleware(["ADMIN"]), async (req, res) => {
    try {
        const { error } = UserValidation.validate(req.body);
        if (error) {
            sendLog(`User add failed: ${error.details[0].message}`);
            return res.status(400).json({ message: error.details[0].message });
        }
        let newUser = await User.create(req.body);
        sendLog(`User added: ${JSON.stringify(newUser)}`);
        res.send(newUser);
    } catch (err) {
        sendLog(`User add error: ${err.message}`);
        console.log(err.message);
    }
});



module.exports = app