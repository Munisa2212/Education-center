const joi = require("joi")

const PromotionValidation = joi.object({
    user_id: joi.number().required(),
    role: joi.string().valid("ADMIN", "SUPER-ADMIN", "USER")
})

module.exports = PromotionValidation