const joi = require("joi")

const Branch_valadation = joi.object({
    name: joi.string().required(),
    phone: joi.string().required(),
    image: joi.string(),
    location: joi.string().required(),
    region_id: joi.number().required(),
    learningCentre_id: joi.number().required(),
    field_id: joi.array().required(),
    subject_id: joi.array().required(), 
})

module.exports = Branch_valadation