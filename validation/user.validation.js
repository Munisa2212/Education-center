const joi = require("joi")

const UserValidation = joi.object({
    year: joi.number().min(1950).max(new Date().getFullYear()).required(),
    name: joi.string().required(),
    email: joi.string().email().required(),
    password: joi.string().required(),
    phone: joi.string().length(13).required(),
    image: joi.string().required(),
    region_id: joi.number().required(),
    role: joi.string().valid("USER", "ADMIN", "SUPER-ADMIN", "CEO").required()
})

const AdminValidation = joi.object({
    year: joi.number().min(1950).max(new Date().getFullYear()).required(),
    name: joi.string().required(),
    email: joi.string().email().required(),
    password: joi.string().required(),
    phone: joi.string().length(13).required(),
    image: joi.string().required(),
    region_id: joi.number().required(),
    role: joi.string().valid("USER", "ADMIN", "SUPER-ADMIN", "CEO").required()
})

const LoginValidation = joi.object({
    email: joi.string().email().required(),
    password: joi.string().required()
})

module.exports = {UserValidation, LoginValidation, AdminValidation}