const { roleMiddleware } = require("../middleware/role.middleware")
const PromotionValidation = require("../validation/addAdmin.validation")
const {User} = require("../models/index.module")

const router = require("express").Router()

/**
 * @swagger
 * /user/promotion:
 *   post:
 *     summary: Promote a user to a new role
 *     tags:
 *       - Promotion ↕
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - user_id
 *               - role
 *             properties:
 *               user_id:
 *                 type: integer
 *                 description: ID of the user to promote
 *                 example: 5
 *               role:
 *                 type: string
 *                 description: New role for the user
 *                 enum: [ADMIN, SUPER-ADMIN, USER]
 *                 example: ADMIN
 *     responses:
 *       200:
 *         description: User's role has been successfully changed
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "User's role has been successfully changed into ADMIN"
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                       example: 5
 *                     role:
 *                       type: string
 *                       example: ADMIN
 *       400:
 *         description: Validation error or user not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Validation error: user_id is required"
 *       403:
 *         description: Unauthorized access
 */

router.post("/", roleMiddleware(["ADMIN"]), async(req, res)=>{
    try {
        let {error} = PromotionValidation.validate(req.body)
        if(error) return res.status(400).send({error: error.details[0].message})
        
        const {user_id, role} = req.body

        let user = await User.findByPk(user_id)
        if(!user) return res.status(400).send({message: `User with ${user_id} id not found`})
        
        if(user.id == req.user.id) return res.status(400).send({message: "You cannot promote yourself!"})

        if(user.role == role ) return res.send({message: `This user is already ${role}`})

        user.update({role: role})
        res.send({message: `User's role has been successfully changed into ${role}`, data: user})
    } catch (error) {
        res.status(400).send({error: error.message})
    }
})

module.exports = router