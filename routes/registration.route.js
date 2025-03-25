const {Registration} = require("../models/index.module")
const RegistrationValidation = require("../validation/registration.validation")
const app = require("express").Router()

app.post("/", async(req, res)=>{
    try {
        let { error } = RegistrationValidation.validate(req.body)
        if (error) return res.status(400).send({ message: error.details?.[0]?.message || "Validation error" })
        
        const date = new Date()
        let currentYear = date.getFullYear()

        

        const newRegister = await Registration.create(req.body)
        res.send(newRegister)
    } catch (error) {
        console.log({message: error})
        res.status(400).send({message: error.details[0].message})
    }
})

app.delete("/:id", async(req, res)=>{
    const {id} = req.params
    try {
        if(!id){
            return res.status(400).send("Wrong id")
        }

        const data = await Registration.findByPk(id)
        if(!data){
            return res.status(404).send("")
        }
    } catch (error) {
        console.log({message: error})
        res.status(400).send({message: error.details[0].message})
    }
})





module.exports = app