const Joi = require('joi');

exports.tutorialSchema = Joi.object({
    title: Joi.string().required(),
    content: Joi.string().required(),
    videoLink: Joi.string().required(),
});


exports.tutorialUpdateSchema = Joi.object({
    title: Joi.string().optional(),
    content: Joi.string().optional(),
    videoLink: Joi.string().optional(),
});


