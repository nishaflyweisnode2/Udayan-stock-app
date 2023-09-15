const Joi = require('joi');


exports.storyValidationSchema = Joi.object({
    title: Joi.string().required(),
    content: Joi.string().required(),
});
