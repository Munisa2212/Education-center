const joi = require("joi")

const RegistrationValidation = joi.object({
    learningCenter_id: joi.number().required().min(1),
    branch_id: joi.number().required().min(1),
    user_id: joi.number().min(1),
    date: joi.date().required()
})

module.exports = RegistrationValidation