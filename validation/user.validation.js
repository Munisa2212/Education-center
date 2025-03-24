const joi = require("joi")

const UserValidation = {
    name: joi.string().required(),
    email: joi.string().email().required(),
    password: joi.string().required(),
    phone: joi.string().length(13).required(),
    image: joi.string().required(),
    role: joi.string().valid("USER", "ADMI", "SUPER-ADMIN", "CEO").required()
}

module.exports = {UserValidation}