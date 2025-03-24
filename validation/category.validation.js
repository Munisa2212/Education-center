const joi = require("joi")

const CategoryValidation = joi.object({
    name: joi.string().required().min(2),
    image: joi.string()
})

module.exports = CategoryValidation