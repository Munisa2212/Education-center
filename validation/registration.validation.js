const joi = require("joi")

const RegistrationValidation = joi.object({
    learningCenter_id: joi.number().required().min(0),
    branch_id: joi.number().required().min(0),
    user_id: joi.number().min(0),
    date: joi.date().required()
})

module.exports = RegistrationValidation