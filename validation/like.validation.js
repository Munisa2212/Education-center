const joi = require("joi")

const LikeValidation = joi.object({
    user_id: joi.number(),
    learningCenter_id: joi.number()
})

module.exports = LikeValidation