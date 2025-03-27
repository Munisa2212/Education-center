const { roleMiddleware } = require("../middleware/role.middleware")
const {Registration, User} = require("../models/index.module")
const RegistrationValidation = require("../validation/registration.validation")
const sendLog = require("../logger")
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


app.post("/", roleMiddleware(["ADMIN"]), async (req, res) => {
    const id = req.user.id;
    try {
      sendLog(`📥 Sorov qabul qilindi | ✏️ POST | 🌍 Route: ${req.originalUrl} | 👤 User ID: ${id} | 📝 Malumot: ${JSON.stringify(req.body)}`);
  
      let { error } = RegistrationValidation.validate(req.body);
      if (error) {
        sendLog(`⚠️ Validatsiya xatosi: ${error.details?.[0]?.message} | 🌍 Route: ${req.originalUrl} | 👤 User ID: ${id}`);
        return res.status(400).send({ message: error.details?.[0]?.message || "Validation error" });
      }
  
      let currentYear = new Date().getFullYear();
      let user = await User.findByPk(id);
      let age = currentYear - user.year;
  
      if (age < 18) {
        sendLog(`❌ Yosh cheklovi: ${age} | 👤 User ID: ${id} | 🌍 Route: ${req.originalUrl}`);
        return res.send("You cannot register to course. Please register with your parent's account");
      }
  
      const { ...data } = req.body;
      const newRegister = await Registration.create({ ...data, user_id: id });
  
      sendLog(`✅ Muvaffaqiyatli royxatdan otildi | 🌍 Route: ${req.originalUrl} | 👤 User ID: ${id} | 🆕 Registration ID: ${newRegister.id}`);
  
      res.send(newRegister);
    } catch (error) {
      sendLog(`❌ Xatolik: ${error.message} | 🌍 Route: ${req.originalUrl} | 👤 User ID: ${id} | 🛠️ Stack: ${error.stack}`);
      res.status(400).send({ message: error.message });
    }
  });
  

  app.delete("/:id", roleMiddleware(["ADMIN"]), async (req, res) => {
    const { id } = req.params;
    const userId = req.user.id;
  
    try {
      sendLog(`📥 Sorov qabul qilindi | 🗑 DELETE | 🌍 Route: ${req.originalUrl} | 👤 User ID: ${userId} | 🆔 Ochirilayotgan ID: ${id}`);
  
      if (!id) {
        sendLog(`⚠️ Xato ID berilgan | 🌍 Route: ${req.originalUrl} | 👤 User ID: ${userId}`);
        return res.status(400).send({ message: "Wrong id" });
      }
  
      const data = await Registration.findByPk(id);
      if (!data) {
        sendLog(`❌ Ma'lumot topilmadi | 🌍 Route: ${req.originalUrl} | 👤 User ID: ${userId} | 🆔 ID: ${id}`);
        return res.status(404).send({ message: "Data not found" });
      }
  
      await data.destroy();
  
      sendLog(`✅ Ma'lumot ochirildi | 🌍 Route: ${req.originalUrl} | 👤 User ID: ${userId} | 🆔 ID: ${id}`);
  
      res.send({ message: "Deleted successfully", deleted_data: data });
    } catch (error) {
      sendLog(`❌ Xatolik: ${error.message} | 🌍 Route: ${req.originalUrl} | 👤 User ID: ${userId} | 🛠️ Stack: ${error.stack}`);
      res.status(400).send({ message: error.message });
    }
  });
  


module.exports = app