const {Like} = require("../models/index.module")
const {User} = require("../models/index.module")
const {Center} = require("../models/index.module")
const router = require("express").Router()
const { AuthMiddleware } = require("../middleware/auth.middleware")
 
router.get("/", async (req, res) => {
    try {
        let likes = await Like.findAll();
        res.send(likes);
    } catch (error) {
        res.status(400).send(error)
    }
})

router.post("/", AuthMiddleware,async (req, res) => {
    try {
        let {center_id} = req.body
        let center = await Center.findByPk(center_id);
        if (!center) return res.status(404).send({ message: "Center not found" });
        let like = await Like.create({user_id: req.user.id, center_id});
        res.send(like);
    } catch (error) {
        res.status(400).send(error)
    }
})

router.get("/:id", async (req, res) => {
    try {
        let like = await Like.findByPk(req.params.id);
        if (!like) return res.status(404).send({ message: "Like not found" });
        res.send(like);
    } catch (error) {
        res.status(400).send(error)
    }
})

router.delete("/:id", async (req, res) => {
    try {
        let like = await Like.findByPk(req.params.id);
        if (!like) return res.status(404).send({ message: "Like not found" });
        let deleted = await like.destroy();
        res.send({deleted_data:  deleted, message: "Like deleted successfully" });
    } catch (error) {
        res.status(400).send(error)
    }
})

module.exports = router