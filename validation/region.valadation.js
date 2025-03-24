const joi = require("joi")

const Region_valadation = joi.object({
    name: joi.string().required()
})

module.exports = Region_valadation