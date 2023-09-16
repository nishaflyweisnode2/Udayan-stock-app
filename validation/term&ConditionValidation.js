const Joi = require('joi');


exports.createTermAndConditionSchema = Joi.object({
    content: Joi.string().required(),
});
