const Joi = require('joi');
const mongoose = require('mongoose');


const validStrategies = ['Positional', 'Intraday']


exports.traderValidationSchema = Joi.object({
    strategy: Joi.string().custom((value, helpers) => {
        if (!mongoose.isValidObjectId(value)) {
            return helpers.error('any.invalid');
        }
        return value;
    }).required(),
    name: Joi.string().valid(...validStrategies).required(),
    title: Joi.string().required(),
    description: Joi.string().required(),

});
