const joi = require("joi")

const CenterValidation = joi.object({
    image: joi.string(),
    name: joi.string().required().min(2),
    phone: joi.string().required(),
    location: joi.string().required(),
    region_id: joi.number().required(),
    branch_number: joi.number().required(),
    ceo_id: joi.number().required(),
    description: joi.string().required(),
    subject_id: joi.array().required(),
    field_id: joi.array().required()
})

module.exports = CenterValidation