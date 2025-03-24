const joi = require("joi")

const ResourceValidation = joi.object({
    name: joi.string().required().min(2),
    user_id: joi.number(),
    image: joi.string(),
    description: joi.string().required(),
    category_id: joi.number(),
    file: joi.string(),
    link: joi.string()
})

module.exports = ResourceValidation