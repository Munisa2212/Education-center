const { roleMiddleware } = require("../middleware/role.middleware")
const {Registration, User} = require("../models/index.module")
const RegistrationValidation = require("../validation/registration.validation")
const app = require("express").Router()

app.post("/", roleMiddleware(["ADMIN"]) , async(req, res)=>{
    const id = req.user.id
    try {
        let { error } = RegistrationValidation.validate(req.body)
        if (error) return res.status(400).send({ message: error.details?.[0]?.message || "Validation error" })
        
        let currentYear = new Date().getFullYear()

        let user = await User.findByPk(id)
        let age = currentYear - user.year
        
        if(age < 18){
            return res.send("You cannot register to course. Please register with your parent's account")
        }

        const {...data} = req.body
        const newRegister = await Registration.create({...data, user_id: id})
        res.send(newRegister)
    } catch (error) {
        console.log({message: error})
        res.status(400).send({message: error.details[0].message})
    }
})

app.delete("/:id", roleMiddleware(["ADMIN"]) , async(req, res)=>{
    const {id} = req.params
    try {
        if(!id){
            return res.status(400).send("Wrong id")
        }

        const data = await Registration.findByPk(id)
        if(!data){
            return res.status(404).send("Data not found")
        }

        await data.destroy()
        res.send(data)
    } catch (error) {
        console.log({message: error})
        res.status(400).send({message: error.details[0].message})
    }
})


module.exports = app