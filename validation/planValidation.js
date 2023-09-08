const Joi = require('joi');
const mongoose = require('mongoose');



exports.planSchema = Joi.object({
    title: Joi.string().required(),
    description: Joi.string().required(),
    price: Joi.number().required(),
});


exports.planUpdateSchema = Joi.object({
    planId: Joi.string().custom((value, helpers) => {
        if (!mongoose.isValidObjectId(value)) {
            return helpers.error('any.invalid');
        }
        return value;
    }).required(),
    title: Joi.string().optional().min(3).max(50),
    description: Joi.string().optional().min(10).max(200),
    price: Joi.number().optional().min(0),
});


exports.planIdSchema = Joi.object({
    id: Joi.string().custom((value, helpers) => {
        if (!mongoose.isValidObjectId(value)) {
            return helpers.error('any.invalid');
        }
        return value;
    }).required(),
});