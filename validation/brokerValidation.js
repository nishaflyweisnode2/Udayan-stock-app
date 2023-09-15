const Joi = require('joi');

const experienceYearsRegex = /^\d{4}-\d{4}$/;


exports.brokerValidationSchema = Joi.object({
    name: Joi.string().required(),
    title: Joi.string().required(),
    summary: Joi.string().required(),
    experience: Joi.object({
        title: Joi.string().required(),
        experienceYears: Joi.string().regex(experienceYearsRegex).required().messages({
            'string.pattern.base': 'Invalid experienceYears format. Please use the format "YYYY-YYYY".',
        }),
        description: Joi.string().required(),
    }).required(),
    education: Joi.object({
        collegeName: Joi.string().required(),
        year: Joi.string().required(),
        description: Joi.string().required(),
    }).required(),
});


exports.validateBroker = Joi.object({
    name: Joi.string().optional(),
    title: Joi.string().optional(),
    summary: Joi.string().optional(),
    experience: Joi.object({
        title: Joi.string().optional(),
        experienceYears: Joi.string().regex(experienceYearsRegex).required().messages({
            'string.pattern.base': 'Invalid experienceYears format. Please use the format "YYYY-YYYY".',
        }),
        description: Joi.string().optional(),
    }),
    education: Joi.object({
        collegeName: Joi.string().optional(),
        year: Joi.string().optional(),
        description: Joi.string().optional(),
    }),
});

