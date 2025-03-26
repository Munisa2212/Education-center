const joi = require("joi")

const Branch_valadation = joi.object({
    name: joi.string().required(),
    phone: joi.string().required().length(13),
    image: joi.string(),
    location: joi.string().required(),
    region_id: joi.number().required(),
    learningCenter_id: joi.number().required(),
    field_id: joi.array().items(joi.number().required()).required(),
    subject_id: joi.array().items(joi.number().required()).required(),
})

module.exports = Branch_valadation