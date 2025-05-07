const { User, Region, Center, Branch, Field, Subject, Comment} = require('../models/index.module')
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
const { route } = require('./branch.route')
const { all } = require('axios')

totp.options = { step: 300, digits: 5 }

/**
 * @swagger
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

/**
 * @swagger
 * /search/user:
 *   get:
 *     summary: Get users with filtering
 *     tags:
 *       - User 👤
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - name: name
 *         in: query
 *         description: Filter by username
 *         schema:
 *           type: string
 *       - name: email
 *         in: query
 *         description: Filter by email
 *         schema:
 *           type: string
 *       - name: phone
 *         in: query
 *         description: Filter by phone number
 *         schema:
 *           type: string
 *       - name: role
 *         in: query
 *         description: Filter by user role
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of users
 *       400:
 *         description: Bad request
 */

/**
 * @swagger
 * /user/:
 *   get:
 *     summary: Retrieve all users
 *     description: Fetches a list of all users with their associated region. Only accessible to ADMIN and CEO roles.
 *     tags:
 *       - User 👤
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

    if(!users) return res.status(404).send({message: "User not found"})

    res.send(users)
  } catch (error) {
    sendLog(
      `❌ Xatolik: ${error.message} | 🔍 ${routePath} | 👤 Kim tomonidan: ${user} | 🛠 Stack: ${error.stack}`,
    )
    res.status(400).send({error: error.message})
  }
})

router.get("/my-info", AuthMiddleware(), async(req, res)=>{
  try {
    let all_data = await User.findByPk(req.user.id, {
      include: [
        { model: Region },
        {model: Center , include: [
          { model: Branch, attributes: ["name", "location"] },
          { model: Subject, through: { attributes: [] } },
          { model: Field, through: { attributes: [] } },
          { model: Region, attributes: ["name"] },
          { model: Comment, attributes: ["star", "comment"] }
      ]},
      ]
    })

    if(!all_data) return res.status(404).send({message: "Nothing found about you!"})
    res.send(all_data)
  } catch (error) {
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
 *       - User 👤
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
 *       - User 👤
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
 *       - User 👤
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

    let User_id = await User.findByPk(req.params.id)

    if (!User_id) {
      sendLog(
        `⚠️ Foydalanuvchi topilmadi | 🔍 ${routePath} | 👤 Kim tomonidan: ${user} | Parametrlar: ${JSON.stringify(
          req.params,
        )}`,
      )
      return res.status(404).send({ message: 'User not found' })
    }

    if (req.user.role !== 'ADMIN' && req.user.id != User_id.id) {
      sendLog(
        `⚠️ Xatolik | 🔍 ${routePath} | 👤 Kim tomonidan: ${user} | Xabar: "Ruxsat yoq | Faqat ADMIN boshqa foydalanuvchini ozgartira oladi."`,
      )
      return res.status(403).send({
        message: `You are not allowed to patch this user. ${req.user.role} can update only his own account. Only ADMIN can update other's account`,
      })
    }

    let updatedUser = await User_id.update(req.body)

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
 *       - User 👤
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

    let User_id = await User.findByPk(req.params.id)

    if (!User_id) {
      sendLog(
        `⚠️ Foydalanuvchi topilmadi | 🔍 ${routePath} | 👤 Kim tomonidan: ${user} | Parametrlar: ${JSON.stringify(
          req.params,
        )}`,
      )
      return res.status(404).send({ message: 'User not found' })
    }

    if (req.user.role !== 'ADMIN' && req.user.id != User_id.id) {
      sendLog(
        `⚠️ Xatolik | 🔍 ${routePath} | 👤 Kim tomonidan: ${user} | Xabar: "Ruxsat yoq | Faqat ADMIN boshqa foydalanuvchini o‘chirishga ruxsat beradi."`,
      )
      return res.status(403).send({
        message: `You are not allowed to delete this user. ${req.user.role} can delete only his own account. Only ADMIN can delete other's account`,
      })
    }

    let deletedUser = await User_id.destroy()

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

module.exports = router