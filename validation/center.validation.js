const joi = require("joi")

const CenterValidation = joi.object({
    image: joi.string(),
    name: joi.string().required(),
    phone: joi.string().required().length(13),
    location: joi.string().required(),
    region_id: joi.number().required(),
    branch_number: joi.number(),
    ceo_id: joi.number(),
    description: joi.string().required(),
    field_id: joi.array().items(joi.number().required()).required(),
    subject_id: joi.array().items(joi.number().required()).required(),
})

module.exports = CenterValidation