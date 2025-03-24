const joi = require("joi")

const RegionValidation = joi.object({
    name: joi.string().required()
})

module.exports = RegionValidation