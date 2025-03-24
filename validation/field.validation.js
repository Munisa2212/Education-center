const joi = require("joi")

const FieldValidation = joi.object({
    name: joi.string().required().min(2),
    image: joi.string()
})

module.exports = FieldValidation