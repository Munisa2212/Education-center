const joi = require("joi")

const CommentValidation = joi.object({
    comment: joi.string().required(),
    user_id: joi.number(),
    star: joi.number().max(5).min(0).required(),
    learningCenter_id: joi.number().required()
})

module.exports = CommentValidation