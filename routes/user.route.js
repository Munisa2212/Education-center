const {User} = require("../models/index.module")
const {UserValidation, LoginValidation, AdminValidation} = require("../validation/user.validation")
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
 *   - name: Authorization
 *     description: API endpoints for user authentication and authorization
 *   - name: User
 *     description: API endpoints for user management
 */

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
 *       - Authorization
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
 *       - Authorization
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
 *                 example: ibodullayevamunisa570@gmail.com
 *                 format: email
 *               otp:
 *                 type: string
 *                 example: 11111
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
 *       - Authorization
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
 *                 example: ibodullayevamunisa570@gmail.com
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
 *       - Authorization
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
 * @swagger
 * /user/refresh-token:
 *   post:
 *     summary: Refresh the access token using a refresh token
 *     tags:
 *       - Authorization
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - refresh_token
 *             properties:
 *               refresh_token:
 *                 type: string
 *                 description: The refresh token used to generate a new access token
 *     responses:
 *       200:
 *         description: New access token generated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 access_token:
 *                   type: string
 *                   description: The newly generated access token
 *       400:
 *         description: Refresh token is missing or invalid
 *       404:
 *         description: User not found
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
 * @swagger
 * /user/{id}:
 *   patch:
 *     summary: Update user details
 *     security:
 *       - BearerAuth: []
 *     tags:
 *       - User
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: ID of the user to update
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: Updated name of the user
 *               email:
 *                 type: string
 *                 format: email
 *                 description: Updated email address of the user
 *               phone:
 *                 type: string
 *                 description: Updated phone number of the user
 *               role:
 *                 type: string
 *                 enum: [USER, ADMIN, SUPER-ADMIN, CEO]
 *                 description: Updated role of the user
 *     responses:
 *       200:
 *         description: User updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                   description: ID of the updated user
 *                 name:
 *                   type: string
 *                   description: Updated name of the user
 *                 email:
 *                   type: string
 *                   format: email
 *                   description: Updated email address of the user
 *                 phone:
 *                   type: string
 *                   description: Updated phone number of the user
 *                 role:
 *                   type: string
 *                   enum: [USER, ADMIN, SUPER-ADMIN, CEO]
 *                   description: Updated role of the user
 *       403:
 *         description: Unauthorized to update this user
 *       404:
 *         description: User not found
 *       400:
 *         description: Bad request or validation error
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
 *         name:
 *           type: string
 *           example: Munisa
 *           description: Full name of the user
 *         email:
 *           type: string
 *           format: email
 *           example: ibodullayevamunisa570@gmail.com
 *           description: Email address of the user
 *         password:
 *           type: string
 *           format: password
 *           example: hello22
 *           description: User's password
 *         phone:
 *           type: string
 *           example: +998882452212
 *           description: User's phone number
 *         image:
 *           type: string
 *           example: photo
 *           description: Profile image URL
 *         role:
 *           type: string
 *           enum: [USER, ADMIN, SUPER-ADMIN, CEO]
 *           example: CEO
 *           description: Role of the user
 *         year:
 *           type: integer
 *           example: 2005
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
 *           example: ibodullayevamunisa570@gmail.com
 *           format: email
 *           description: User email
 *         password:
 *           type: string
 *           format: password
 *           example: hello22
 *           description: User password
 */

/**
 * @swagger
 * /user/request-reset 📩:
 *   post:
 *     summary: Request a password reset OTP
 *     tags:
 *       - Password Reset 🔐
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
 *                 description: The email address of the user requesting the password reset
 *     responses:
 *       200:
 *         description: OTP sent successfully to the user's email
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Success message
 *                 otp:
 *                   type: string
 *                   description: The OTP sent to the user's email
 *       400:
 *         description: Email is required or other validation error
 *       404:
 *         description: No account found with the provided email address
 *
 * /user/reset-password 🔑:
 *   post:
 *     summary: Reset the user's password using an OTP
 *     tags:
 *       - Password Reset 🔐
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - newPassword
 *               - otp
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 description: The email address of the user resetting the password
 *               newPassword:
 *                 type: string
 *                 format: password
 *                 description: The new password for the user
 *               otp:
 *                 type: string
 *                 description: The OTP sent to the user's email for verification
 *     responses:
 *       200:
 *         description: Password reset successfully
 *       400:
 *         description: Missing required fields, invalid OTP, or other validation error
 *       404:
 *         description: No account found with the provided email address
 */

router.post("/register", async (req, res) => {
    try {
        if(req.body.role == "ADMIN" || req.body.role == "CEO"){
            let { error } = AdminValidation.validate(req.body);
            if (error) {
                return res.status(400).send(error.details[0].message);
            }
        }else{
            let { error } = UserValidation.validate(req.body);
            if (error) {
                return res.status(400).send(error.details[0].message);
            }
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
        res.send({ message: `Otp sent to ${email}` });
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

        let refresh_token = jwt.sign({ id: user.id, role: user.role }, "refresh",{expiresIn: "1d"});
        let access_token = jwt.sign({ id: user.id, role: user.role }, "sekret", { expiresIn: "15m" });
        res.send({ refresh_token: refresh_token, access_token: access_token });
    } catch (err) {
        res.status(400).send(err);
    }
});

router.post("/refresh-token", async(req, res)=>{
    try {
        let {refresh_token} = req.body
        if(!refresh_token) return res.status(400).send({message: "Refresh token is required"})
        let decoded = jwt.verify(refresh_token, "refresh")
        if(!decoded) return res.status(400).send({message: "Invalid refresh token"})
        let user = await User.findByPk(decoded.id)
        if(!user) return res.status(404).send({message: "User not found"})

        let access_token = jwt.sign({ id: user.id, role: user.role }, "sekret", { expiresIn: "15m" });
        res.send({access_token: access_token})
    } catch (error) {
        res.status(400).send({message: "Wrong refresh_token"})
    }
})

router.post("/request-reset", async(req, res)=>{
    try {
        let {email} = req.body
        if(!email) return res.status(400).send({message: "Email is required"})
        let user = await User.findOne({where: {email: email}})
        if(!user) return res.status(404).send({message: "No account found with the Email address you provided!"})
        let otp = totp.generate(email + "reset_password")
        sendEmail(email, otp)
        res.send({
            message: `${user.name}, an OTP has been sent to your email (${user.email}). Please check and confirm it!`,
            otp: otp
          })
    } catch (error) {
        res.status(400).send(error)
    }
})

router.post("/reset-password", async(req, res)=>{
    try {
        let {email, newPassword, otp} = req.body
        if(!email || !newPassword || !otp){
            return res.status(400).send({message: "email, newPassword, otp are required. Provide every detail!"})
        }
        let user = await User.findOne({where: {email}})
        if(!user) return res.status(400).send({message: "No account found with the Email address you provided!"})

        let decode_otp = totp.verify({token: otp, secret: email + "reset_password"})
        if(!decode_otp) return res.status(400).send({message: "OTP is not valid"})

        let hash = bcrypt.hashSync(newPassword, 10)
        user.update({password: hash})
        res.send({message: `New password set successully🎉. Your newPassword🔑 - ${newPassword}`})
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

router.get("/me", AuthMiddleware(), async(req, res)=>{
    try {
        let data = deviceDetector.parse(req.headers["user-agent"])
        let user = await User.findByPk(req.user.id)
        res.send({user: user, device: data})
    } catch (error) {
        res.status(404).send(error)
    }
})

router.get("/:id", roleMiddleware(["ADMIN"]), async (req, res) => {
    try {
        let user = await User.findByPk(req.params.id);
        if (!user) return res.status(404).send({ message: "User not found" });
        res.send(user);
    } catch (error) {
        res.status(400).send(error);
    }
});

router.patch("/:id", AuthMiddleware(), async(req, res)=>{
    try {
        let user = await User.findByPk(req.params.id)
        if (!user) return res.status(404).send({ message: "User not found" });

        if(req.user.role !== "ADMIN" && req.user.id != user.id){
            return res.status(403).send({ message: `You are not allowed to delete this user. ${req.user.role} can delete only his own account. Only ADMIN can patch other's account` });
        }

        let updated = await user.update(req.body)
        res.send(updated)
    } catch (error) {
        res.status(400).send(error)
    }
})

router.delete("/:id", AuthMiddleware(), async (req, res) => {
    try {
        let user = await User.findByPk(req.params.id);
        if (!user) return res.status(404).send({ message: "User not found" });

        if(req.user.role !== "ADMIN" && req.user.id != user.id){
          return res.status(403).send({ message: `You are not allowed to delete this user. ${req.user.role} can delete only his own account. Only ADMIN can delete other's account` });
        }
        let deleted = await user.destroy();
        res.send({deleted_data:  deleted, message: "User deleted successfully" });
    } catch (error) {
        res.status(400).send(error);
    }
});




router.get("/refresh", AuthMiddleware(), async(req,res)=>{
    try {
        let id = req.user.id
        let role = req.user.role
        let access_token = jwt.sign({id: id,role: role},"sekret",{expiresIn: "30m"})
        res.send({access_token: access_token})
    } catch (error) {
        res.status(400).send(error)
    }
})

module.exports = router;