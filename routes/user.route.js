const {User} = require("../models/index.module")
const {UserValidation, LoginValidation} = require("../validation/user.validation")
const router = require("express").Router()
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")
const {AuthMiddleware} = require("../middleware/auth.middleware")
const {roleMiddleware} = require("../middleware/role.middleware")
const { totp, authenticator } = require("otplib");
const { sendEmail } = require("../config/transporter");
const { Op } = require("sequelize");
const DeviceDetector = require("device-detector-js");
const deviceDetector = new DeviceDetector()

totp.options = { step: 300, digits: 5 };

/**
 * @swagger
 * tags:
 *   name: User
 *   description: API endpoints for user management
 */

/**
 * @swagger
 * /user/register:
 *   post:
 *     summary: Register a new user
 *     tags: 
 *       - User
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/User'
 *     responses:
 *       201:
 *         description: User created successfully, OTP sent to email
 *       400:
 *         description: Validation error or user already exists
 *
 * /user/verify:
 *   post:
 *     summary: Verify user email with OTP
 *     tags: 
 *       - User
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - otp
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               otp:
 *                 type: string
 *     responses:
 *       200:
 *         description: Email successfully verified
 *       404:
 *         description: User not found or invalid OTP
 *
 * /user/resend-otp:
 *   post:
 *     summary: Resend OTP to user email
 *     tags: 
 *       - User
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *     responses:
 *       200:
 *         description: OTP sent successfully
 *       404:
 *         description: User not found
 *
 * /user/login:
 *   post:
 *     summary: Log in as a user
 *     tags: 
 *       - User
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Login'
 *     responses:
 *       200:
 *         description: User logged in successfully, access and refresh tokens returned
 *       400:
 *         description: Validation error or incorrect password
 *       401:
 *         description: User needs to verify email first
 *       404:
 *         description: User not found
 *
 * /user/search:
 *   get:
 *     summary: Search users (Admin only)
 *     security:
 *       - BearerAuth: []
 *     tags: 
 *       - User
 *     parameters:
 *       - name: name
 *         in: query
 *         description: Search by username
 *         schema:
 *           type: string
 *       - name: email
 *         in: query
 *         description: Search by email
 *         schema:
 *           type: string
 *       - name: phone
 *         in: query
 *         description: Search by phone number
 *         schema:
 *           type: string
 *       - name: role
 *         in: query
 *         description: Search by user role
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of users matching the criteria
 *       400:
 *         description: Bad request
 *
 * /user:
 *   get:
 *     summary: Get all users (Admin only)
 *     security:
 *       - BearerAuth: []
 *     tags: 
 *       - User
 *     responses:
 *       200:
 *         description: List of all users
 *       400:
 *         description: Bad request
 *
 * /user/{id}:
 *   get:
 *     summary: Get a user by ID (Admin only)
 *     security:
 *       - BearerAuth: []
 *     tags: 
 *       - User
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: User ID
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: User retrieved successfully
 *       404:
 *         description: User not found
 *
 *   delete:
 *     summary: Delete a user (self or admin)
 *     security:
 *       - BearerAuth: []
 *     tags: 
 *       - User
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: User ID
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: User deleted successfully
 *       403:
 *         description: Unauthorized to delete this user
 *       404:
 *         description: User not found
 *
 * /user/me:
 *   get:
 *     summary: Get current authenticated user info
 *     security:
 *       - BearerAuth: []
 *     tags: 
 *       - User
 *     responses:
 *       200:
 *         description: User information along with device details
 *       404:
 *         description: User not found
 *
 * /user/refresh:
 *   get:
 *     summary: Refresh access token
 *     security:
 *       - BearerAuth: []
 *     tags: 
 *       - User
 *     responses:
 *       200:
 *         description: New access token returned
 *       400:
 *         description: Bad request
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       required:
 *         - name
 *         - email
 *         - password
 *         - phone
 *         - role
 *       properties:
 *         id:
 *           type: integer
 *           description: Auto-generated ID of the user
 *         name:
 *           type: string
 *           description: Full name of the user
 *         email:
 *           type: string
 *           format: email
 *           description: Email address of the user
 *         password:
 *           type: string
 *           format: password
 *           description: User's password
 *         phone:
 *           type: string
 *           description: User's phone number
 *         image:
 *           type: string
 *           description: Profile image URL
 *         role:
 *           type: string
 *           enum: [USER, ADMIN, SUPER-ADMIN, CEO]
 *           description: Role of the user
 *         year:
 *           type: integer
 *           description: Birth year of the user
 *
 *     Login:
 *       type: object
 *       required:
 *         - email
 *         - password
 *       properties:
 *         email:
 *           type: string
 *           format: email
 *           description: User email
 *         password:
 *           type: string
 *           format: password
 *           description: User password
 */


router.post("/register", async (req, res) => {
    try {
        let { error } = UserValidation.validate(req.body);
        if (error) {
            return res.status(400).send(error.details[0].message);
        }
        const { name, password, email, phone, ...rest } = req.body;
        let user = await User.findOne({ where: { email: email } });
        if (user) {
            return res.status(400).send({ message: "User already exists, email exists" });
        }
        let hash = bcrypt.hashSync(password, 10);
        let newUser = await User.create({
            ...rest,
            name: name,
            phone: phone,
            email: email,
            password: hash
        });
        let otp = totp.generate(email + "email");
        console.log(otp);
        sendEmail(email, otp);
        res.status(201).send({user_data: newUser, message: "User created successfully otp is sended to email and phone"});
    } catch (error) {
        res.status(400).send(error);
    }
});

router.post("/verify", async (req, res) => {
    let { email, otp } = req.body;
    try {
        let user = await User.findOne({ where: { email: email } });
        if (!user) return res.status(404).send({ message: "User not found" });

        let match = totp.verify({ token: otp, secret: email + "email" });
        if (!match) return res.status(404).send({ message: "Otp is not valid" });

        await user.update({ status: "ACTIVE" });
        res.send({ message: "Email successfully verified! You can now log in." });
    } catch (error) {
        res.status(400).send(error);
    }
});

router.post("/resend-otp", async (req, res) => {
    let { email } = req.body;
    try {
        let user = await User.findOne({ where: { email } });
        if (!user) {
            return res.status(404).send({ message: "User not found" });
        }
        console.log(email);
        const token = totp.generate(email + "email");
        console.log("OTP: ", token);
        sendEmail(email, token);
        res.send({ message: `Token sent to ${email}` });
    } catch (error) {
        console.log(error);
        res.status(400).send(error);
    }
});

router.post("/login", async (req, res) => {
    try {
        let { error } = LoginValidation.validate(req.body);
        if (error) return res.status(400).send(error.details[0].message);

        let { password, email } = req.body;
        let user = await User.findOne({ where: { email: email } });
        if (!user) return res.status(404).send({ message: "User not found" });
        let match = bcrypt.compareSync(password, user.password);
        if (!match) return res.status(400).send({ message: "Wrong password" });

        if (user.status != "ACTIVE") return res.status(401).send({ message: "Verify your email first!" });

        let refresh_token = jwt.sign({ id: user.id, role: user.role }, "sekret",{expiresIn: "1d"});
        let access_token = jwt.sign({ id: user.id, role: user.role }, "sekret", { expiresIn: "15m" });
        res.send({ refresh_token: refresh_token, access_token: access_token });
    } catch (err) {
        res.status(400).send(err);
    }
});

router.get("/search", roleMiddleware(["ADMIN"]), async (req, res) => {
    try {
        let { name, email, phone, role } = req.query;
        const where = {}

        if(name) where.username = { [Op.like]: `%${name}%` }
        if(email) where.email = { [Op.like]: `%${email}%` }
        if(phone) where.phone = { [Op.like]: `%${phone}%` }
        if(role) where.role = role

        let users = await User.findAll({ where });
        res.send(users);
    } catch (error) {
        res.status(400).send(error)
    }
})

router.get("/", roleMiddleware(["ADMIN"]), async (req, res) => {
    try {
        let users = await User.findAll();
        res.send(users);
    } catch (error) {
        res.status(400).send(error);
    }
});

router.get("/:id", roleMiddleware(["ADMIN"]), async (req, res) => {
    try {
        let user = await User.findByPk(req.params.id);
        if (!user) return res.status(404).send({ message: "User not found" });
        res.send(user);
    } catch (error) {
        res.status(400).send(error);
    }
});

router.delete("/:id", AuthMiddleware, async (req, res) => {
    try {
        let user = await User.findByPk(req.params.id);
        if (!user) return res.status(404).send({ message: "User not found" });

        if(req.user.role !== "ADMIN" && req.user.id != user.id){
          return res.status(403).send({ message: `You are not allowed to delete this user. ${req.user.role} can delete only his own account` });
        }
        let deleted = await user.destroy();
        res.send({deleted_data:  deleted, message: "User deleted successfully" });
    } catch (error) {
        res.status(400).send(error);
    }
});

router.get("/me", AuthMiddleware, async(req, res)=>{
    try {
        let data = deviceDetector.parse(req.headers["user-agent"])
        let user = await User.findByPk(req.user.id)
        res.send({user: user, device: data})
    } catch (error) {
        res.status(404).send(error)
    }
})


router.get("/refresh", AuthMiddleware, async(req,res)=>{
    try {
        let id = req.user.id
        let role = req.user.role
        let access_token = jwt.sign({id: id,role: role},"sekret",{expiresIn: "15m"})
        res.send({access_token: access_token})
    } catch (error) {
        res.status(400).send(error)
    }
})

module.exports = router;