const { AuthMiddleware } = require("../middleware/auth.middleware");
const {Like} = require("../models/index.module");

const app = require("express").Router()

app.get("/average-star", AuthMiddleware ,async(req, res)=>{
    try {
        let {learningCenter_id} = req.query;

        if(!learningCenter_id){
            return res.status(400).send({message: "learningCenter_id is required"})
        }
        let center_data = await Comment.findAll({where: {learningCenter_id: learningCenter_id}});        
        let average_star = 0
        if(!center_data){
            return res.send({average_star})
        }

        let count = 0
        let star = 0

        center_data.forEach(e => {
            count++
            star += e.star
        });
        let total = star / count;
        res.send({average_star: total})
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
        if(!center_data)    return res.status(404).send("Nothing found")
        
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