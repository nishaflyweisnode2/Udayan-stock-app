const Joi = require('joi');
const mongoose = require('mongoose');



exports.feedbackSchema = Joi.object({
    email: Joi.string().required(),
    feedbackText: Joi.string().min(10).max(500).required(),
});

exports.feedbackIdSchema = Joi.object({
    id: Joi.string().custom((value, helpers) => {
        if (!mongoose.isValidObjectId(value)) {
            return helpers.error('any.invalid');
        }
        return value;
    }).required(),
});