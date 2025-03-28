const { User, Region } = require('../models/index.module')
const {
  UserValidation,
  LoginValidation,
  AdminValidation,
} = require('../validation/user.validation')
const router = require('express').Router()
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const AuthMiddleware = require('../middleware/auth.middleware')
const { roleMiddleware } = require('../middleware/role.middleware')
const { totp } = require('otplib')
const { sendEmail } = require('../config/transporter')
const { Op } = require('sequelize')
const DeviceDetector = require('device-detector-js')
const deviceDetector = new DeviceDetector()
const sendLog = require("../logger")
const sendSMS = require("../config/eskiz")

totp.options = { step: 300, digits: 5 }

/**
 * @swagger
 * /user/register:
 *   post:
 *     summary: Register a new user
 *     description: Creates a new user and sends an OTP to their email.
 *     tags:
 *       - AUTH
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Munisa"
 *               year:
 *                 type: integer
 *                 example: 2005
 *                 description: Birth year of the user
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "ibodullayevamunisa570@example.com"
 *               phone:
 *                 type: string
 *                 example: "+998882452212"
 *               password:
 *                 type: string
 *                 format: password
 *                 example: "SecurePass123!"
 *               image:
 *                 type: string
 *                 example: photo.png 
 *               role:
 *                 type: string
 *                 enum: [ADMIN, CEO, USER]
 *                 example: "CEO"
 *               region_id:
 *                 type: integer
 *                 example: 1
 *             required:
 *               - name
 *               - email
 *               - phone
 *               - password
 *               - role
 *               - region_id
 *     responses:
 *       201:
 *         description: User created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 user_data:
 *                   type: object
 *                   example:
 *                     id: 1
 *                     name: "John Doe"
 *                     email: "johndoe@example.com"
 *                     phone: "+998901234567"
 *                     role: "USER"
 *                 message:
 *                   type: string
 *                   example: "User created successfully, OTP is sent to email and phone"
 *       400:
 *         description: Bad request (Validation error or user already exists)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "User already exists, email exists"
 *       404:
 *         description: User not found
 *
 * /user/me:
 *   get:
 *     summary: Get current authenticated user info
 *     security:
 *       - BearerAuth: []
 *     tags: 
 *       - User 👤
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
 *         - year
 *         - email
 *         - password
 *         - image
 *         - phone
 *         - role
 *         - region_id
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
 *         region_id:
 *           type: integer
 *           example: 1
 *         phone:
 *           type: string
 *           example: "+998882452212"
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

router.post('/register', async (req, res) => {
  const user = req.user ? req.user.username : 'Anonim'
  const routePath = '/register'

  try {
    sendLog(
      `📥 Sorov qabul qilindi | 🔍 ${routePath} | 👤 Kim tomonidan: ${user} | 📌 Body: ${JSON.stringify(
        req.body,
      )}`,
    )

    if (req.body.role == 'CEO') {
      let { error } = AdminValidation.validate(req.body)
      if (error) {
        sendLog(
          `⚠️ Admin validation xatosi | 🔍 ${routePath} | 👤 Kim tomonidan: ${user} | 📌 Error: ${error.details[0].message}`,
        )
        console.log(req.body);
        
        return res.status(400).send(error.details[0].message)
      }
    } else {
      let { error } = UserValidation.validate(req.body)
      if (error) {
        sendLog(
          `⚠️ User validation xatosi | 🔍 ${routePath} | 👤 Kim tomonidan: ${user} | 📌 Error: ${error.details[0].message}`,
        )
        return res.status(400).send(error.details[0].message)
      }
    }
    const { name, password, email, phone, region_id, ...rest } = req.body
    let existingUser = await User.findOne({ where: { email: email } })

    const reg = await Region.findByPk(region_id)
    if(!reg){
      return res.status(404).send({message: "Region not found"})
    }
    if (existingUser) {
      sendLog(
        `⚠️ Foydalanuvchi mavjud | 🔍 ${routePath} | 👤 Kim tomonidan: ${user} | 📌 Email: ${email}`,
      )
      return res
        .status(400)
        .send({ message: 'User already exists, email exists' })
    }

    let hash = bcrypt.hashSync(password, 10)
    let newUser = await User.create({
      ...rest,
      name: name,
      phone: phone,
      email: email,
      password: hash,
      region_id: region_id
    })

    let otp = totp.generate(email + 'email')
    console.log(otp)
    sendLog(
      `✅ Foydalanuvchi yaratildi | 🔍 ${routePath} | 👤 Kim tomonidan: ${user} | 📌 User: ${JSON.stringify(
        newUser,
      )}`,
    )
    sendSMS(phone,otp)
    sendEmail(email, otp)

    res.status(201).send({ user_data: newUser, message: 'User created successfully, otp is sent to email and phone',})
  } catch (error) {
    sendLog(
      `❌ Xatolik: ${error.message} | 🔍 ${routePath} | 👤 Kim tomonidan: ${user} | 🛠 Stack: ${error.stack}`,
    )
    res.status(400).send({error: error.message})
  }
})

/**
 * @swagger
 * /user/verify:
 *   post:
 *     summary: Verify a user's email with OTP
 *     description: Verifies a user's email using the OTP sent to their email during registration.
 *     tags:
 *       - AUTH
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "ibodullayevamunisa570@example.com"
 *               otp:
 *                 type: string
 *                 example: "123456"
 *             required:
 *               - email
 *               - otp
 *     responses:
 *       200:
 *         description: Email successfully verified
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Email successfully verified! You can now log in."
 *       404:
 *         description: User not found or OTP invalid
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "User not found"
 *       400:
 *         description: Bad request or server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Unexpected error occurred"
 */

router.post('/verify', async (req, res) => {
  const user = req.user ? req.user.username : 'Anonim'
  const routePath = '/verify'

  let { email, otp } = req.body

  try {
    sendLog(
      `📥 Sorov qabul qilindi | 🔍 ${routePath} | 👤 Kim tomonidan: ${user} | 📌 Body: ${JSON.stringify(
        req.body,
      )}`,
    )

    let existingUser = await User.findOne({ where: { email: email } })

    if (!existingUser) {
      sendLog(
        `⚠️ Foydalanuvchi topilmadi | 🔍 ${routePath} | 👤 Kim tomonidan: ${user} | 📌 Email: ${email}`,
      )
      return res.status(404).send({ message: 'User not found' })
    }

    let match = totp.verify({ token: otp, secret: email + 'email' })

    if (!match) {
      sendLog(
        `⚠️ Otp notogri | 🔍 ${routePath} | 👤 Kim tomonidan: ${user} | 📌 Otp: ${otp}`,
      )
      return res.status(404).send({ message: 'Otp is not valid' })
    }

    await existingUser.update({ status: 'ACTIVE' })

    sendLog(
      `✅ Email tasdiqlandi | 🔍 ${routePath} | 👤 Kim tomonidan: ${user} | 📌 Foydalanuvchi: ${email}`,
    )
    res.send({ message: 'Email successfully verified! You can now log in.' })
  } catch (error) {
    sendLog(
      `❌ Xatolik: ${error.message} | 🔍 ${routePath} | 👤 Kim tomonidan: ${user} | 🛠 Stack: ${error.stack}`,
    )
    res.status(400).send({error: error.message})
  }
})

/**
 * @swagger
 * /user/resend-otp:
 *   post:
 *     summary: Resend OTP to a user's email
 *     description: Generates a new OTP and sends it to the provided email.
 *     tags:
 *       - AUTH
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "ibodullayevamunisa570@example.com"
 *             required:
 *               - email
 *     responses:
 *       200:
 *         description: OTP successfully sent to the user
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Otp sent to johndoe@example.com"
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "User not found"
 *       400:
 *         description: Bad request or server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Unexpected error occurred"
 */

router.post('/resend-otp', async (req, res) => {
  const user = req.user ? req.user.username : 'Anonim'
  const routePath = '/resend-otp'

  let { email } = req.body

  try {
    sendLog(
      `📥 Sorov qabul qilindi | 🔍 ${routePath} | 👤 Kim tomonidan: ${user} | 📌 Body: ${JSON.stringify(
        req.body,
      )}`,
    )

    let existingUser = await User.findOne({ where: { email } })

    if (!existingUser) {
      sendLog(
        `⚠️ Foydalanuvchi topilmadi | 🔍 ${routePath} | 👤 Kim tomonidan: ${user} | 📌 Email: ${email}`,
      )
      return res.status(404).send({ message: 'User not found' })
    }

    const token = totp.generate(email + 'email')
    sendLog(
      `✅ OTP yaratilgan | 🔍 ${routePath} | 👤 Kim tomonidan: ${user} | 📌 Otp: ${token} | Email: ${email}`,
    )

    sendEmail(email, token)
    sendLog(
      `✅ Otp yuborildi | 🔍 ${routePath} | 👤 Kim tomonidan: ${user} | 📌 Email: ${email}`,
    )

    res.send({ message: `Otp sent to ${email}` })
  } catch (error) {
    sendLog(
      `❌ Xatolik: ${error.message} | 🔍 ${routePath} | 👤 Kim tomonidan: ${user} | 🛠 Stack: ${error.stack}`,
    )
    console.log(error)
    res.status(400).send({error: error.message})
  }
})
/**
 * @swagger
 * /user/login:
 *   post:
 *     summary: User login
 *     description: Authenticates a user and returns access and refresh tokens.
 *     tags:
 *       - AUTH
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "ibodullayevamunisa570@example.com"
 *               password:
 *                 type: string
 *                 format: password
 *                 example: "password123"
 *             required:
 *               - email
 *               - password
 *     responses:
 *       200:
 *         description: Login successful, returns access and refresh tokens
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 refresh_token:
 *                   type: string
 *                   example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *                 access_token:
 *                   type: string
 *                   example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *       400:
 *         description: Validation error or wrong password
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Wrong password"
 *       401:
 *         description: Email not verified
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Verify your email first!"
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "User not found"
 */
router.post('/login', async (req, res) => {
  const user = req.user ? req.user.username : 'Anonim'
  const routePath = '/login'

  try {
    sendLog(
      `📥 Sorov qabul qilindi | 🔍 ${routePath} | 👤 Kim tomonidan: ${user} | 📌 Body: ${JSON.stringify(
        req.body,
      )}`,
    )

    let { error } = LoginValidation.validate(req.body)
    if (error) {
      sendLog(
        `⚠️ Validatsiya xatosi | 🔍 ${routePath} | 👤 Kim tomonidan: ${user} | 📌 Error: ${error.details[0].message}`,
      )
      return res.status(400).send(error.details[0].message)
    }

    let { password, email } = req.body
    let existingUser = await User.findOne({ where: { email: email } })

    if (!existingUser) {
      sendLog(
        `⚠️ Foydalanuvchi topilmadi | 🔍 ${routePath} | 👤 Kim tomonidan: ${user} | 📌 Email: ${email}`,
      )
      return res.status(404).send({ message: 'User not found' })
    }

    let match = bcrypt.compareSync(password, existingUser.password)
    if (!match) {
      sendLog(
        `⚠️ Notogri parol | 🔍 ${routePath} | 👤 Kim tomonidan: ${user} | 📌 Email: ${email}`,
      )
      return res.status(400).send({ message: 'Wrong password' })
    }

    if (existingUser.status !== 'ACTIVE') {
      sendLog(
        `⚠️ Email tasdiqlanmadi | 🔍 ${routePath} | 👤 Kim tomonidan: ${user} | 📌 Email: ${email}`,
      )
      return res.status(401).send({ message: 'Verify your email first!' })
    }

    let refresh_token = jwt.sign(
      { id: existingUser.id, role: existingUser.role },
      'refresh',
      { expiresIn: '1d' },
    )
    let access_token = jwt.sign(
      { id: existingUser.id, role: existingUser.role },
      'sekret',
      { expiresIn: '1h' },
    )

    sendLog(
      `✅ Kirish muvaffaqiyatli | 🔍 ${routePath} | 👤 Kim tomonidan: ${user} | 📌 Email: ${email} | Rollar: ${existingUser.role}`,
    )
    res.send({ refresh_token: refresh_token, access_token: access_token })
  } catch (err) {
    sendLog(
      `❌ Xatolik: ${err.message} | 🔍 ${routePath} | 👤 Kim tomonidan: ${user} | 🛠 Stack: ${err.stack}`,
    )
    res.status(400).send({error: error.message})
  }
})

/**
 * @swagger
 * /user/refresh-token:
 *   post:
 *     summary: Refresh access token
 *     description: Generates a new access token using a valid refresh token.
 *     tags:
 *       - AUTH
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               refresh_token:
 *                 type: string
 *                 example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *             required:
 *               - refresh_token
 *     responses:
 *       200:
 *         description: Successfully generated new access token
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 access_token:
 *                   type: string
 *                   example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *       400:
 *         description: Invalid or missing refresh token
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Invalid refresh token"
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "User not found"
 */
router.post('/refresh-token', async (req, res) => {
  const user = req.user ? req.user.username : 'Anonim'
  const routePath = '/refresh-token'

  try {
    sendLog(
      `📥 Sorov qabul qilindi | 🔍 ${routePath} | 👤 Kim tomonidan: ${user} | 📌 Body: ${JSON.stringify(
        req.body,
      )}`,
    )

    let { refresh_token } = req.body
    if (!refresh_token) {
      sendLog(
        `⚠️ Refresh token yoq | 🔍 ${routePath} | 👤 Kim tomonidan: ${user}`,
      )
      return res.status(400).send({ message: 'Refresh token is required' })
    }

    let decoded = jwt.verify(refresh_token, 'refresh')
    if (!decoded) {
      sendLog(
        `⚠️ Notogri refresh token | 🔍 ${routePath} | 👤 Kim tomonidan: ${user} | 📌 Token: ${refresh_token}`,
      )
      return res.status(400).send({ message: 'Invalid refresh token' })
    }

    let user = await User.findByPk(decoded.id)
    if (!user) {
      sendLog(
        `⚠️ Foydalanuvchi topilmadi | 🔍 ${routePath} | 👤 Kim tomonidan: ${user} | 📌 User ID: ${decoded.id}`,
      )
      return res.status(404).send({ message: 'User not found' })
    }

    let access_token = jwt.sign({ id: user.id, role: user.role }, 'sekret', {
      expiresIn: '1h',
    })
    sendLog(
      `✅ Refresh token tasdiqlandi | 🔍 ${routePath} | 👤 Kim tomonidan: ${user} | 📌 User ID: ${user.id} | Rollar: ${user.role}`,
    )

    res.send({ access_token: access_token })
  } catch (error) {
    sendLog(
      `❌ Xatolik: ${error.message} | 🔍 ${routePath} | 👤 Kim tomonidan: ${user} | 🛠 Stack: ${error.stack}`,
    )
    res.status(400).send({ message: 'Wrong refresh_token' })
  }
})

/**
 * @swagger
 * /user/:
 *   get:
 *     summary: Retrieve all users
 *     description: Fetches a list of all users with their associated region. Only accessible to ADMIN and CEO roles.
 *     tags:
 *       - USER
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Successfully retrieved users list
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                     example: 1
 *                   name:
 *                     type: string
 *                     example: "John Doe"
 *                   email:
 *                     type: string
 *                     example: "john.doe@example.com"
 *                   phone:
 *                     type: string
 *                     example: "+1234567890"
 *                   status:
 *                     type: string
 *                     example: "ACTIVE"
 *                   role:
 *                     type: string
 *                     example: "ADMIN"
 *                   region:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                         example: 2
 *                       name:
 *                         type: string
 *                         example: "Tashkent"
 *       400:
 *         description: Error while fetching users
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Something went wrong"
 *       401:
 *         description: Unauthorized access (missing or invalid token)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Unauthorized"
 *       403:
 *         description: Forbidden - User does not have permission
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Access denied"
 */
router.get('/', roleMiddleware(['ADMIN', 'CEO']), async (req, res) => {
  const user = req.user ? req.user.username : 'Anonim'
  const routePath = '/'

  try {
    sendLog(
      `📥 Sorov qabul qilindi | 🔍 ${routePath} | 👤 Kim tomonidan: ${user} | 📌 Query Params: ${JSON.stringify(
        req.query,
      )}`,
    )

    let users = await User.findAll({ include: [{ model: Region }] })

    sendLog(
      `✅ ${users.length} ta foydalanuvchi topildi | 🔍 ${routePath} | 👤 Kim tomonidan: ${user}`,
    )
    res.send(users)
  } catch (error) {
    sendLog(
      `❌ Xatolik: ${error.message} | 🔍 ${routePath} | 👤 Kim tomonidan: ${user} | 🛠 Stack: ${error.stack}`,
    )
    res.status(400).send({error: error.message})
  }
})

/**
 * @swagger
 * /user/me:
 *   get:
 *     summary: Get authenticated user info
 *     description: Returns the authenticated user's details along with device information.
 *     tags:
 *       - USER
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Successfully retrieved user info
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 user:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                       example: 1
 *                     name:
 *                       type: string
 *                       example: "John Doe"
 *                     email:
 *                       type: string
 *                       example: "john.doe@example.com"
 *                     phone:
 *                       type: string
 *                       example: "+1234567890"
 *                     status:
 *                       type: string
 *                       example: "ACTIVE"
 *                     role:
 *                       type: string
 *                       example: "USER"
 *                 device:
 *                   type: object
 *                   properties:
 *                     client:
 *                       type: string
 *                       example: "Chrome"
 *                     os:
 *                       type: string
 *                       example: "Windows"
 *                     device:
 *                       type: string
 *                       example: "Desktop"
 *       400:
 *         description: Error while retrieving user data
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Something went wrong"
 *       401:
 *         description: Unauthorized (missing or invalid token)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Unauthorized"
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "User not found"
 */
router.get('/me', AuthMiddleware(), async (req, res) => {
  const user = req.user ? req.user.username : 'Anonim'
  const routePath = '/me'

  try {
    sendLog(
      `📥 Sorov qabul qilindi | 🔍 ${routePath} | 👤 Kim tomonidan: ${user} | 📌 Query Params: ${JSON.stringify(
        req.query,
      )} | 📱 Device Info: ${JSON.stringify(req.headers['user-agent'])}`,
    )

    let data = deviceDetector.parse(req.headers['user-agent'])
    let userRecord = await User.findByPk(req.user.id)

    if (!userRecord) {
      sendLog(
        `⚠️ Foydalanuvchi topilmadi | 🔍 ${routePath} | 👤 Kim tomonidan: ${user}`,
      )
      return res.status(404).send({ message: 'User not found' })
    }

    sendLog(
      `✅ Foydalanuvchi ma'lumotlari qaytarildi | 🔍 ${routePath} | 👤 Kim tomonidan: ${user}`,
    )
    res.send({ user: userRecord, device: data })
  } catch (error) {
    sendLog(
      `❌ Xatolik: ${error.message} | 🔍 ${routePath} | 👤 Kim tomonidan: ${user} | 🛠 Stack: ${error.stack}`,
    )
    res.status(400).send({error: error.message})
  }
})
/**
 * @swagger
 * /user/{id}:
 *   get:
 *     summary: Get user by ID
 *     description: Retrieves user details by their ID. Only accessible to ADMIN users.
 *     tags:
 *       - USER
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The ID of the user to retrieve
 *     responses:
 *       200:
 *         description: Successfully retrieved user details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                   example: 1
 *                 name:
 *                   type: string
 *                   example: "John Doe"
 *                 email:
 *                   type: string
 *                   example: "john.doe@example.com"
 *                 phone:
 *                   type: string
 *                   example: "+1234567890"
 *                 status:
 *                   type: string
 *                   example: "ACTIVE"
 *                 role:
 *                   type: string
 *                   example: "USER"
 *       400:
 *         description: Error while retrieving user data
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Something went wrong"
 *       401:
 *         description: Unauthorized (missing or invalid token)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Unauthorized"
 *       403:
 *         description: Forbidden (User does not have permission)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Forbidden"
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "User not found"
 */
router.get('/:id', roleMiddleware(['ADMIN']), async (req, res) => {
  const user = req.user ? req.user.username : 'Anonim'
  const routePath = `/${req.params.id}`

  try {
    sendLog(
      `📥 Sorov qabul qilindi | 🔍 ${routePath} | 👤 Kim tomonidan: ${user} | 📌 Parametrlar: ${JSON.stringify(
        req.params,
      )}`,
    )

    let userRecord = await User.findByPk(req.params.id)

    if (!userRecord) {
      sendLog(
        `⚠️ Foydalanuvchi topilmadi | 🔍 ${routePath} | 👤 Kim tomonidan: ${user} | Parametrlar: ${JSON.stringify(
          req.params,
        )}`,
      )
      return res.status(404).send({ message: 'User not found' })
    }

    sendLog(
      `✅ Foydalanuvchi ma'lumotlari qaytarildi | 🔍 ${routePath} | 👤 Kim tomonidan: ${user} | Parametrlar: ${JSON.stringify(
        req.params,
      )}`,
    )
    res.send(userRecord)
  } catch (error) {
    sendLog(
      `❌ Xatolik: ${
        error.message
      } | 🔍 ${routePath} | 👤 Kim tomonidan: ${user} | Parametrlar: ${JSON.stringify(
        req.params,
      )} | 🛠 Stack: ${error.stack}`,
    )
    res.status(400).send({error: error.message})
  }
})
/**
 * @swagger
 * /user/{id}:
 *   patch:
 *     summary: Update user details
 *     description: Allows a user to update their own account details. Admins can update any user's details.
 *     tags:
 *       - USER
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The ID of the user to update
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Jane Doe"
 *               email:
 *                 type: string
 *                 example: "jane.doe@example.com"
 *               phone:
 *                 type: string
 *                 example: "+1234567890"
 *               status:
 *                 type: string
 *                 enum: ["ACTIVE", "INACTIVE"]
 *                 example: "ACTIVE"
 *     responses:
 *       200:
 *         description: Successfully updated the user
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                   example: 1
 *                 name:
 *                   type: string
 *                   example: "Jane Doe"
 *                 email:
 *                   type: string
 *                   example: "jane.doe@example.com"
 *                 phone:
 *                   type: string
 *                   example: "+1234567890"
 *                 status:
 *                   type: string
 *                   example: "ACTIVE"
 *       400:
 *         description: Error while updating user data
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Something went wrong"
 *       401:
 *         description: Unauthorized (missing or invalid token)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Unauthorized"
 *       403:
 *         description: Forbidden (User does not have permission)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "You are not allowed to patch this user. Only ADMIN can update others."
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "User not found"
 */
router.patch('/:id', AuthMiddleware(), async (req, res) => {
  const user = req.user ? req.user.username : 'Anonim'
  const routePath = `/${req.params.id}`

  try {
    sendLog(
      `📥 Sorov qabul qilindi | 🔍 ${routePath} | 👤 Kim tomonidan: ${user} | 📌 Parametrlar: ${JSON.stringify(
        req.params,
      )}`,
    )

    let targetUser = await User.findByPk(req.params.id)

    if (!targetUser) {
      sendLog(
        `⚠️ Foydalanuvchi topilmadi | 🔍 ${routePath} | 👤 Kim tomonidan: ${user} | Parametrlar: ${JSON.stringify(
          req.params,
        )}`,
      )
      return res.status(404).send({ message: 'User not found' })
    }

    if (req.user.role !== 'ADMIN' && req.user.id != targetUser.id) {
      sendLog(
        `⚠️ Xatolik | 🔍 ${routePath} | 👤 Kim tomonidan: ${user} | Xabar: "Ruxsat yoq | Faqat ADMIN boshqa foydalanuvchini ozgartira oladi."`,
      )
      return res.status(403).send({
        message: `You are not allowed to patch this user. ${req.user.role} can update only his own account. Only ADMIN can update other's account`,
      })
    }

    let updatedUser = await targetUser.update(req.body)

    sendLog(
      `✅ Foydalanuvchi muvaffaqiyatli yangilandi | 🔍 ${routePath} | 👤 Kim tomonidan: ${user} | Yangilangan: ${JSON.stringify(
        updatedUser,
      )}`,
    )
    res.send(updatedUser)
  } catch (error) {
    sendLog(
      `❌ Xatolik: ${
        error.message
      } | 🔍 ${routePath} | 👤 Kim tomonidan: ${user} | Parametrlar: ${JSON.stringify(
        req.params,
      )} | 🛠 Stack: ${error.stack}`,
    )
    res.status(400).send({error: error.message})
  }
})
/**
 * @swagger
 * /user/{id}:
 *   delete:
 *     summary: Delete a user
 *     description: Allows a user to delete their own account. Admins can delete any user's account.
 *     tags:
 *       - USER
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The ID of the user to delete
 *     responses:
 *       200:
 *         description: Successfully deleted the user
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 deleted_data:
 *                   type: object
 *                   description: The deleted user data
 *                 message:
 *                   type: string
 *                   example: "User deleted successfully"
 *       400:
 *         description: Error while deleting user
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Something went wrong"
 *       401:
 *         description: Unauthorized (missing or invalid token)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Unauthorized"
 *       403:
 *         description: Forbidden (User does not have permission)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "You are not allowed to delete this user. Only ADMIN can delete others."
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "User not found"
 */
router.delete('/:id', AuthMiddleware(), async (req, res) => {
  const user = req.user ? req.user.username : 'Anonim'
  const routePath = `/${req.params.id}`

  try {
    sendLog(
      `📥 Sorov qabul qilindi | 🔍 ${routePath} | 👤 Kim tomonidan: ${user} | 📌 Parametrlar: ${JSON.stringify(
        req.params,
      )}`,
    )

    let targetUser = await User.findByPk(req.params.id)

    if (!targetUser) {
      sendLog(
        `⚠️ Foydalanuvchi topilmadi | 🔍 ${routePath} | 👤 Kim tomonidan: ${user} | Parametrlar: ${JSON.stringify(
          req.params,
        )}`,
      )
      return res.status(404).send({ message: 'User not found' })
    }

    if (req.user.role !== 'ADMIN' && req.user.id != targetUser.id) {
      sendLog(
        `⚠️ Xatolik | 🔍 ${routePath} | 👤 Kim tomonidan: ${user} | Xabar: "Ruxsat yoq | Faqat ADMIN boshqa foydalanuvchini o‘chirishga ruxsat beradi."`,
      )
      return res.status(403).send({
        message: `You are not allowed to delete this user. ${req.user.role} can delete only his own account. Only ADMIN can delete other's account`,
      })
    }

    let deletedUser = await targetUser.destroy()

    sendLog(
      `✅ Foydalanuvchi muvaffaqiyatli ochirildi | 🔍 ${routePath} | 👤 Kim tomonidan: ${user} | O‘chirildi: ${JSON.stringify(
        deletedUser,
      )}`,
    )
    res.send({
      deleted_data: deletedUser,
      message: 'User deleted successfully',
    })
  } catch (error) {
    sendLog(
      `❌ Xatolik: ${
        error.message
      } | 🔍 ${routePath} | 👤 Kim tomonidan: ${user} | Parametrlar: ${JSON.stringify(
        req.params,
      )} | 🛠 Stack: ${error.stack}`,
    )
    res.status(400).send({error: error.message})
  }
})
/**
 * @swagger
 * /user/refresh:
 *   get:
 *     summary: Refresh access token
 *     description: Generates a new access token for an authenticated user.
 *     tags:
 *       - USER
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Successfully refreshed the access token
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 access_token:
 *                   type: string
 *                   example: "newly_generated_jwt_token"
 *       400:
 *         description: Error while refreshing token
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Something went wrong"
 *       401:
 *         description: Unauthorized (missing or invalid token)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Unauthorized"
 */
router.get('/refresh', AuthMiddleware(), async (req, res) => {
    const user = req.user ? req.user.username : 'Anonim';
    const routePath = `/refresh`;

    try {
        sendLog(`📥 Sorov qabul qilindi | 🔍 ${routePath} | 👤 Kim tomonidan: ${user} | 📌 Parametrlar: ${JSON.stringify(req.user)}`);

        let id = req.user.id;
        let role = req.user.role;

        let access_token = jwt.sign({ id: id, role: role }, 'sekret', {
            expiresIn: '30m',
        });

        sendLog(`✅ Token muvaffaqiyatli yangilandi | 🔍 ${routePath} | 👤 Kim tomonidan: ${user} | Yangi access_token: ${access_token}`);
        res.send({ access_token: access_token });
    } catch (error) {
        sendLog(`❌ Xatolik: ${error.message} | 🔍 ${routePath} | 👤 Kim tomonidan: ${user} | Parametrlar: ${JSON.stringify(req.user)} | 🛠 Stack: ${error.stack}`);
        res.status(400).send({error: error.message})
    }
});

const PromoteRouter = require("./addAdmin.route")
router.use("/promotion", PromoteRouter)

module.exports = router