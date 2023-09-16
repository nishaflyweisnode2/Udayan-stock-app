const Joi = require('joi');
const mongoose = require('mongoose');


const validStrategies = ['Long Term', 'Short Term']


exports.investorValidationSchema = Joi.object({
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
