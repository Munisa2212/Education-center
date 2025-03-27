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
const { totp, authenticator } = require('otplib')
const { sendEmail } = require('../config/transporter')
const { Op } = require('sequelize')
const DeviceDetector = require('device-detector-js')
const deviceDetector = new DeviceDetector()
const sendLog = require("../logger")

totp.options = { step: 300, digits: 5 }

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
 * /user/request-reset:
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
 * /user/reset-password:
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

router.post('/register', async (req, res) => {
  const user = req.user ? req.user.username : 'Anonim'
  const routePath = '/register'

  try {
    sendLog(
      `📥 Sorov qabul qilindi | 🔍 ${routePath} | 👤 Kim tomonidan: ${user} | 📌 Body: ${JSON.stringify(
        req.body,
      )}`,
    )

    if (req.body.role == 'ADMIN' || req.body.role == 'CEO') {
      let { error } = AdminValidation.validate(req.body)
      if (error) {
        sendLog(
          `⚠️ Admin validation xatosi | 🔍 ${routePath} | 👤 Kim tomonidan: ${user} | 📌 Error: ${error.details[0].message}`,
        )
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

    const { name, password, email, phone, ...rest } = req.body
    let existingUser = await User.findOne({ where: { email: email } })

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
    })

    let otp = totp.generate(email + 'email')
    sendLog(
      `✅ Foydalanuvchi yaratildi | 🔍 ${routePath} | 👤 Kim tomonidan: ${user} | 📌 User: ${JSON.stringify(
        newUser,
      )}`,
    )
    sendEmail(email, otp)

    res
      .status(201)
      .send({
        user_data: newUser,
        message: 'User created successfully, otp is sent to email and phone',
      })
  } catch (error) {
    sendLog(
      `❌ Xatolik: ${error.message} | 🔍 ${routePath} | 👤 Kim tomonidan: ${user} | 🛠 Stack: ${error.stack}`,
    )
    res.status(400).send(error)
  }
})

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
    res.status(400).send(error)
  }
})

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
    res.status(400).send(error)
  }
})

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
    res.status(400).send(err)
  }
})

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

router.post('/request-reset%20%F0%9F%93%A9', async (req, res) => {
  const user = req.user ? req.user.username : 'Anonim'
  const routePath = '/request-reset'

  try {
    sendLog(
      `📥 Sorov qabul qilindi | 🔍 ${routePath} | 👤 Kim tomonidan: ${user} | 📌 Body: ${JSON.stringify(
        req.body,
      )}`,
    )

    let { email } = req.body
    if (!email) {
      sendLog(`⚠️ Email yoq | 🔍 ${routePath} | 👤 Kim tomonidan: ${user}`)
      return res.status(400).send({ message: 'Email is required' })
    }

    let user = await User.findOne({ where: { email: email } })
    if (!user) {
      sendLog(
        `⚠️ Foydalanuvchi topilmadi | 🔍 ${routePath} | 👤 Kim tomonidan: ${user} | 📌 Email: ${email}`,
      )
      return res
        .status(404)
        .send({
          message: 'No account found with the Email address you provided!',
        })
    }

    let otp = totp.generate(email + 'reset_password')
    sendEmail(email, otp)

    sendLog(
      `✅ OTP yuborildi | 🔍 ${routePath} | 👤 Kim tomonidan: ${user} | 📌 Email: ${email} | OTP: ${otp}`,
    )

    res.send({
      message: `${user.name}, an OTP has been sent to your email (${user.email}). Please check and confirm it!`,
      otp: otp,
    })
  } catch (error) {
    sendLog(
      `❌ Xatolik: ${error.message} | 🔍 ${routePath} | 👤 Kim tomonidan: ${user} | 🛠 Stack: ${error.stack}`,
    )
    res.status(400).send(error)
  }
})

router.post('/reset-password', async (req, res) => {
  const user = req.user ? req.user.username : 'Anonim'
  const routePath = '/reset-password'

  try {
    sendLog(
      `📥 Sorov qabul qilindi | 🔍 ${routePath} | 👤 Kim tomonidan: ${user} | 📌 Body: ${JSON.stringify(
        req.body,
      )}`,
    )

    let { email, newPassword, otp } = req.body
    if (!email || !newPassword || !otp) {
      sendLog(
        `⚠️ Zarur ma'lumotlar yetishmayapti | 🔍 ${routePath} | 👤 Kim tomonidan: ${user}`,
      )
      return res
        .status(400)
        .send({
          message:
            'email, newPassword, otp are required. Provide every detail!',
        })
    }

    let user = await User.findOne({ where: { email } })
    if (!user) {
      sendLog(
        `⚠️ Foydalanuvchi topilmadi | 🔍 ${routePath} | 👤 Kim tomonidan: ${user} | 📌 Email: ${email}`,
      )
      return res
        .status(400)
        .send({
          message: 'No account found with the Email address you provided!',
        })
    }

    let decode_otp = totp.verify({
      token: otp,
      secret: email + 'reset_password',
    })
    if (!decode_otp) {
      sendLog(
        `⚠️ OTP notogri | 🔍 ${routePath} | 👤 Kim tomonidan: ${user} | 📌 OTP: ${otp}`,
      )
      return res.status(400).send({ message: 'OTP is not valid' })
    }

    let hash = bcrypt.hashSync(newPassword, 10)
    await user.update({ password: hash })

    sendLog(
      `✅ Yangi parol muvaffaqiyatli ornatildi | 🔍 ${routePath} | 👤 Kim tomonidan: ${user} | 📌 Email: ${email}`,
    )

    res.send({
      message: `New password set successfully🎉. Your newPassword🔑 - ${newPassword}`,
    })
  } catch (error) {
    sendLog(
      `❌ Xatolik: ${error.message} | 🔍 ${routePath} | 👤 Kim tomonidan: ${user} | 🛠 Stack: ${error.stack}`,
    )
    res.status(400).send(error)
  }
})

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
    res.status(400).send(error)
  }
})

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
    res.status(404).send(error)
  }
})

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
    res.status(400).send(error)
  }
})

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
    res.status(400).send(error)
  }
})

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
    res.status(400).send(error)
  }
})

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
        res.status(400).send(error);
    }
});


module.exports = router
