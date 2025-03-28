const { AuthMiddleware } = require("../middleware/auth.middleware");
const {Like, Comment, Center} = require("../models/index.module");
const { description } = require("../validation/center.validation");
const app = require("express").Router()
/**
 * @swagger
 * /rating/star:
 *   get:
 *     summary: Get centers with their star ratings
 *     tags:
 *       - Learning Center Ratings 🏆
 *     parameters:
 *       - in: query
 *         name: top
 *         schema:
 *           type: integer
 *         description: Number of top centers to retrieve (default is all centers).
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
 *                   LearnigCenterName:
 *                     type: string
 *                     description: Name of the learning center.
 *                   phone:
 *                     type: string
 *                     description: Phone number of the learning center.
 *                   description:
 *                     type: string
 *                     description: Description of the learning center.
 *                   star:
 *                     type: number
 *                     description: Average star rating of the learning center.
 *       400:
 *         description: Bad request
 *       404:
 *         description: No centers found
 */

/**
 * @swagger
 * /rating/comments:
 *   get:
 *     summary: Get the total number of comments for a learning center
 *     tags:
 *       - Learning Center Ratings 🏆
 *     security:
 *       - BearerAuth: []
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
 * /rating/likes:
 *   get:
 *     summary: Get the total number of likes for a learning center
 *     tags:
 *       - Learning Center Ratings 🏆
 *     security:
 *       - BearerAuth: []
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
        let {top} = req.query
        let centers = await Center.findAll({attributes: ["name", "phone", "description"], include: [{model: Comment, attributes: ["star"]}]})
        if(centers.length==0){
            return res.status(404).send({message: "No centers found"})
        }
        let arr = []
        centers.map(e => {
            if(!e.dataValues.Comments.length){
                arr.push({LearnigCenterName: e.dataValues.name, phone: e.dataValues.phone, description: e.dataValues.description, star: 0})
            }else{
                let star = 0
                let length = 0
                e.dataValues.Comments.forEach(star_data => {
                    console.log(e.dataValues.name, star_data.dataValues.star);
                    star += star_data.dataValues.star
                    length++
                });
                console.log(star, length);
                
                arr.push({LearnigCenterName: e.dataValues.name, phone: e.dataValues.phone, description: e.dataValues.description, star: star/length})
            }
        })
        res.send(arr.sort((a, b) => b.star - a.star).splice(0, top || 100))
    } catch (error) {
        res.status(400).send(error) 
    }
})

app.get("/comments", async (req, res) => {
    try {
        let center_data = await Center.findAll({
            attributes: ["name"],
            include: [{ model: Comment, attributes: ["comment"] }]
        });

        if (!center_data) return res.status(404).send("Nothing found");

        let sorted = center_data.map(e => {
            if(!e.Comments.length){
                return {
                    name: e.name,
                    totalComments: e.Comments.length,
                };
            }else{
                return {
                    name: e.name,
                    totalComments: e.Comments.length,
                    Comments: e.Comments
                };
            }
        });

        res.send(sorted.sort((a, b)=> b.totalComments - a.totalComments));
    } catch (error) {
        res.status(400).send(error);
    }
});

app.get("/likes", async(req, res)=>{
    try {
        let center_data = await Center.findAll({attributes: ["name"], include: [{model: Like}]}); 
        if(!center_data) return res.status(404).send("Nothing found")
        
        let sorted = center_data.map(e =>{
            return {
                name: e.name,
                totalLikes: e.Likes.length
            }
        })
        res.send(sorted.sort((a,b)=> b.totalLikes - a.totalLikes))
    } catch (error) {
        res.status(400).send(error)
        
    }
})

module.exports = app