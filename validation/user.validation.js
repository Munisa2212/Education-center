const joi = require("joi")

const UserValidation = joi.object({
    name: joi.string().required(),
    email: joi.string().email().required(),
    password: joi.string().required(),
    phone: joi.string().length(13).required(),
    image: joi.string().required(),
    role: joi.string().valid("USER", "ADMIN", "SUPER-ADMIN", "CEO").required()
})

const LoginValidation = joi.object({
    email: joi.string().email().required(),
    password: joi.string().required()
})

module.exports = UserValidation