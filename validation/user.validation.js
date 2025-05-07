const joi = require("joi")

const UserValidation = joi.object({
    name: joi.string().required(),
    year: joi.number().min(1950).max(new Date().getFullYear()).required(),
    email: joi.string().email().required(),
    password: joi.string().required(),
    phone: joi.string().length(13).required(),
    image: joi.string().required(),
    role: joi.string().valid("USER", "CEO").required(),
    region_id: joi.number().required(),
})

const CeoValidation = joi.object({
    name: joi.string().required(),
    year: joi.number().min(1950).max(new Date().getFullYear()).required(),
    email: joi.string().email().required(),
    password: joi.string().required(),
    phone: joi.string().length(13).required(),
    image: joi.string().required(),
    role: joi.string().valid("CEO").required(),
    region_id: joi.number().default(1)
})

const AdminValidation = joi.object({
    name: joi.string().required(),
    year: joi.number().min(1950).max(new Date().getFullYear()).required(),
    email: joi.string().email().required(),
    password: joi.string().required(),
    phone: joi.string().length(13).required(),
    role: joi.string().valid("ADMIN", "SUPER-ADMIN").required(),
    image: joi.string().required(),
    region_id: joi.number()
})

const LoginValidation = joi.object({
    email: joi.string().email().required(),
    password: joi.string().required()
})

const DeleteValidation = joi.object({
    email: joi.string().email().required(),
    password: joi.string().required()
})
module.exports = {UserValidation, LoginValidation, AdminValidation, CeoValidation}