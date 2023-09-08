const Joi = require('joi');
const mongoose = require('mongoose');


exports.purchasePlanSchema = Joi.object({
    userId: Joi.string().custom((value, helpers) => {
        if (!mongoose.isValidObjectId(value)) {
            return helpers.error('any.invalid');
        }
        return value;
    }).required(),
    planId: Joi.string().custom((value, helpers) => {
        if (!mongoose.isValidObjectId(value)) {
            return helpers.error('any.invalid');
        }
        return value;
    }).required(),
    paymentMethod: Joi.string().required(),
});


