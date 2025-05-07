const { roleMiddleware } = require("../middleware/role.middleware")
const AuthMiddleware = require("../middleware/auth.middleware")
const {Registration, User, Branch, Center} = require("../models/index.module")
const RegistrationValidation = require("../validation/registration.validation")
const sendLog = require("../logger")
const e = require("express")
const app = require("express").Router()

/**
 * @swagger
 * tags:
 *   - name: Enrolment 📋
 *     description: User enrolment for learning centers
 * 
 * paths:
 *   /enrolment/my-enrolments:
 *     get:
 *       summary: Get all enrolments for the authenticated user
 *       security:
 *         - BearerAuth: []
 *       tags:
 *         - Enrolment 📋
 *       responses:
 *         200:
 *           description: List of enrolments
 *           content:
 *             application/json:
 *               schema:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                       example: 1
 *                     user_id:
 *                       type: integer
 *                       example: 1
 *                     center:
 *                       type: object
 *                       properties:
 *                         name:
 *                           type: string
 *                           example: "Learning Center A"
 *                         location:
 *                           type: string
 *                           example: "123 Main St"
 *                         description:
 *                           type: string
 *                           example: "A great place to learn"
 *         404:
 *           description: No enrolments found
 *         400:
 *           description: Bad request
 * 
 *   /enrolment:
 *     post:
 *       summary: Register a user for a course
 *       security:
 *         - BearerAuth: []
 *       tags:
 *         - Enrolment 📋
 *       requestBody:
 *         required: true
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Enrolment'
 *       responses:
 *         201:
 *           description: User successfully registered
 *         400:
 *           description: Validation error or age restriction
 * 
 *   /enrolment/{id}:
 *     delete:
 *       summary: Delete an enrolment
 *       security:
 *         - BearerAuth: []
 *       tags:
 *         - Enrolment 📋
 *       parameters:
 *         - in: path
 *           name: id
 *           required: true
 *           schema:
 *             type: integer
 *           description: Enrolment ID
 *       responses:
 *         200:
 *           description: Enrolment deleted successfully
 *         404:
 *           description: Enrolment not found
 * 
 * components:
 *   securitySchemes:
 *     BearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 *   schemas:
 *     Enrolment:
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
app.get("/my-enrolments", AuthMiddleware(), async (req, res) => {
  try {
      sendLog(`📥 Request received | GET /my-enrolments | User ID: ${req.user.id}`);

      let enrolments = await Registration.findAll({
          where: { user_id: req.user.id },
          include: [{ model: Center, attributes: ["name", "location", "description"] }]
      });

      if (!enrolments || enrolments.length === 0) {
          sendLog(`⚠️ No enrolments found for User ID: ${req.user.id}`);
          return res.status(404).send({ message: "You have not enrolled to any center yet!" });
      }

      sendLog(`✅ Enrolments retrieved for User ID: ${req.user.id}`);
      res.send(enrolments); 
  } catch (error) {
      sendLog(`❌ Error retrieving enrolments: ${error.message}`);
      res.status(400).send({ message: error.message });
  }
});

app.post("/",AuthMiddleware(), async (req, res) => {
    const id = req.user.id;
    try {
      sendLog(`📥 Sorov qabul qilindi | ✏️ POST | 🌍 Route: ${req.originalUrl} | 👤 User ID: ${id} | 📝 Malumot: ${JSON.stringify(req.body)}`);
  
      let { error } = RegistrationValidation.validate(req.body);
      if (error) {
        sendLog(`⚠️ Validatsiya xatosi: ${error.details?.[0]?.message} | 🌍 Route: ${req.originalUrl} | 👤 User ID: ${id}`);
        return res.status(400).send({ message: error.details?.[0]?.message || "Validation error" });
      }
      
      let center = await Center.findByPk(req.body.learningCenter_id, {include: [{model: Branch}]})
      if(!center) return res.status(404).send({message: `Learning center with ${req.body.learningCenter_id_id} id Not Found!`})
      
      let message = center.Branches.length ? `\nExisting Branches: ${center.Branches.map(id => id == id)}` : ""
      let branch = await Branch.findByPk(req.body.branch_id)
      if(!branch) return res.status(404).send({message: `This learning center doesnt have Branch with ${req.body.branch_id} id!${message}`})

      let currentYear = new Date().getFullYear();
      let user = await User.findByPk(id);
      let age = currentYear - user.year;
  
      if (age < 18) {
        sendLog(`❌ Yosh cheklovi: ${age} | 👤 User ID: ${id} | 🌍 Route: ${req.originalUrl}`);
        return res.send("You cannot register to course because your age is under 18. Please register with your parent's account");
      }
      
      let existingEnrolment = await Registration.findOne({where: {user_id: req.user.id, learningCenter_id: req.body.learningCenter_id}})
      if(existingEnrolment) {return res.status(400).send({message: "You have already enrolled to this learning center"})}

      const { ...data } = req.body;
      const newRegister = await Registration.create({ ...data, user_id: id });
  
      sendLog(`✅ Muvaffaqiyatli royxatdan otildi | 🌍 Route: ${req.originalUrl} | 👤 User ID: ${id} | 🆕 Registration ID: ${newRegister.id}`);
  
      res.send(newRegister);
    } catch (error) {
      sendLog(`❌ Xatolik: ${error.message} | 🌍 Route: ${req.originalUrl} | 👤 User ID: ${id} | 🛠️ Stack: ${error.stack}`);
      res.status(400).send(error);
    }
  });
  

  app.delete("/:id", AuthMiddleware(), async (req, res) => {
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
        return res.status(404).send({ message: "Enrolment not found" });
      }
      
      if(!req.user.role in ["ADMIN", "CEO"] || data.user_id != req.user.id){
        return res.status(400).send({message: `You are not allowed to delete other's enrolment. ${req.user.role} can delete only his own enrolment. Only ADMIN can do it!😉`})
      }
      await data.destroy();
  
      sendLog(`✅ Ma'lumot ochirildi | 🌍 Route: ${req.originalUrl} | 👤 User ID: ${userId} | 🆔 ID: ${id}`);
  
      res.send({ message: "Deleted successfully", deleted_data: data });
    } catch (error) {
      sendLog(`❌ Xatolik: ${error.message} | 🌍 Route: ${req.originalUrl} | 👤 User ID: ${userId} | 🛠️ Stack: ${error.stack}`);
      res.status(400).send({ error: error.message });
    }
  });
  


module.exports = app