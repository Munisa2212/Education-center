const joi = require("joi")

const AddAdminValidation = joi.object({
    user_id: joi.number().required(),
    role: joi.string().valid("ADMIN", "SUPER-ADMIN", "USER")
})

module.exports = AddAdminValidation