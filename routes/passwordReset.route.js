const router = require("express").Router()
const {AuthMiddleware} = require("../middleware/auth.middleware")
const {User} = require("../models/index.module")
const sendLog = require("../logger")
const { totp } = require('otplib')
const jwt = require('jsonwebtoken')
const { sendEmail } = require('../config/transporter')
const bcrypt = require('bcrypt')

/**
 * @swagger
 * /password/request-reset:
 *   post:
 *     summary: Request a password reset OTP
 *     tags:
 *       - Password Reset 🔐
 *     security:
 *       - BearerAuth: []      
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
 *                 example: user@gmail.com
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
 * /password/reset-password:
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
 *                 example: user@gmail.com
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

router.post('/request-reset' ,async (req, res) => {
    try {
      const { email } = req.body
      console.log(email);
      
      if (!email) {
        return res.status(400).sends({ message: 'Email is required' })
      }
  
      let user = await User.findOne({ where: { email: email } })
      console.log(user);
      
      if (!user) {
        return res.status(404).send({message: 'No account found with the Email address you provided!',})
      }
  
      let otp = totp.generate(email + 'reset_password')
      console.log(otp);
      
      sendEmail(email, otp)
  
      sendLog(
        `✅ OTP yuborildi | 🔍 /request-reet | 📌 Email: ${email} | OTP: ${otp}`,
      )
  
      res.send({
        message: `${user.name}, an OTP has been sent to your email (${user.email}). Please check and confirm it!`,
        otp: otp,
      })
    } catch (error) {
      sendLog(
        `❌ Xatolik: ${error.message} | 🔍 /request-reet | 🛠 Stack: ${error.stack}`,
      )
      res.status(400).send(error.message)
    }
  })
  
  router.post('/reset-password',async (req, res) => {
    try {
      let { email, newPassword, otp } = req.body
      if (!email || !newPassword || !otp) {
        return res.status(400).send({message: 'email, newPassword, otp are required. Provide every detail!'})
      }
  
      let user = await User.findOne({ where: { email } })
      if (!user) {
        return res.status(400).send({ message: 'No account found with the Email address you provided!',})
      }
  
      let decode_otp = totp.verify({token: otp,secret: email + 'reset_password',
      })
      if (!decode_otp) {
        return res.status(400).send({ message: 'OTP is not valid' })
      }
  
      let hash = bcrypt.hashSync(newPassword, 10)
      await user.update({ password: hash })
  
      sendLog(
        `✅ Yangi parol muvaffaqiyatli ornatildi | 🔍 /reset-password | 👤 Kim tomonidan: ${user.name} | 🔑 New password - ${newPassword}`,
      )
  
      res.send({
        message: `New password set successfully🎉. Your newPassword🔑 - ${newPassword}`,
      })
    } catch (error) {
        const routePath = "/reset-password"
      await sendLog(
        `❌ Xatolik: ${error.message} | 🔍 ${routePath} | 🛠 Stack: ${error.stack}`,
      )
      res.status(400).send(error)
    }
  })

module.exports = router