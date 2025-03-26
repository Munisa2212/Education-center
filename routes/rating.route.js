const { AuthMiddleware } = require("../middleware/auth.middleware");
const {Like, Center} = require("../models/index.module");
const app = require("express").Router()

/**
 * @swagger
 * /rating/star ⭐:
 *   get:
 *     summary: Get centers with their star ratings
 *     tags:
 *       - Learning Center Ratings 🏆
 *     responses:
 *       200:
 *         description: List of centers with their star ratings
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   name:
 *                     type: string
 *                     description: Name of the center
 *                   ceo_id:
 *                     type: integer
 *                     description: ID of the CEO
 *                   subject_id:
 *                     type: integer
 *                     description: ID of the subject
 *                   field_id:
 *                     type: integer
 *                     description: ID of the field
 *                   star:
 *                     type: integer
 *                     description: Star rating of the center
 *       400:
 *         description: Bad request
 */

/**
 * @swagger
 * /rating/comments 📝:
 *   get:
 *     summary: Get the total number of comments for a learning center
 *     tags:
 *       - Learning Center Ratings 🏆
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - name: learningCenter_id
 *         in: query
 *         required: true
 *         description: ID of the learning center
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Total number of comments for the learning center
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 totalComments:
 *                   type: integer
 *                   description: Total number of comments
 *       400:
 *         description: Missing or invalid learningCenter_id
 *       404:
 *         description: No comments found for the specified learning center
 */

/**
 * @swagger
 * /rating/likes ❤️:
 *   get:
 *     summary: Get the total number of likes for a learning center
 *     tags:
 *       - Learning Center Ratings 🏆
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - name: learningCenter_id
 *         in: query
 *         required: true
 *         description: ID of the learning center
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Total number of likes for the learning center
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 totalLikes:
 *                   type: integer
 *                   description: Total number of likes
 *       400:
 *         description: Missing or invalid learningCenter_id
 *       404:
 *         description: No likes found for the specified learning center
 */

app.get("/star", async(req, res)=>{
    try {
        let centers = await Center.findAll({attributes: ["name", "ceo_id", "subject_id", "field_id"]},{include: [{model: Comment, attributes: ["star"]}]})
        res.send(centers)
    } catch (error) {
        res.status(400).send(error) 
    }
})

app.get("/comments", AuthMiddleware, async(req,res)=>{
    try {
        let {learningCenter_id} = req.query;
        if(!learningCenter_id){
            return res.status(400).send({message: "learningCenter_id is required"})
        }
        let center_data = await Comment.findAll({where: {learningCenter_id: learningCenter_id}}); 
        if(!center_data) return res.status(404).send("Nothing found")
        
        let totalComments = center_data.length()
        res.send({totalComments})
    } catch (error) {
        res.status(400).send(error)
        
    }
})

app.get("/likes", AuthMiddleware, async(req, res)=>{
    try {
        let {learningCenter_id} = req.query;
        if(!learningCenter_id){
            return res.status(400).send({message: "learningCenter_id is required"})
        }
        
        let center_data = await Like.findAll({where: {learningCenter_id: learningCenter_id}}); 
        if(!center_data)    return res.status(404).send("Nothing found")

        let totalLikes = center_data.length
        res.send({totalLikes})
    } catch (error) {
        res.status(400).send(error)
        
    }
})

module.exports = app