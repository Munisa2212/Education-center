const Branch = require("../models/branch.module")
const joi = require("joi")

const Branch_valadation = joi.object({
    name: joi.string().required(),
    phone: joi.string().required(),
    image: joi.string(),
    location: joi.string().required(),
    region_id: joi.number().required(),
    learningCentre_id: joi.number().required(),
    field_id: joi.number().required(),
    subject_id: joi.number().required(), 
})

module.exports = Branch_valadation