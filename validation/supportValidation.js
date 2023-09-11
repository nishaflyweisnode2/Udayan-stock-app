const Joi = require('joi');



exports.supportRequestSchema = Joi.object({
    description: Joi.string().required(),
    mobile: Joi.string(),
    email: Joi.string().email(),
});
