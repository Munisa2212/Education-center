const joi = require("joi")

const SubjectValidation = joi.object({
    name: joi.string().required().min(2),
    image: joi.string()
})

module.exports = SubjectValidation