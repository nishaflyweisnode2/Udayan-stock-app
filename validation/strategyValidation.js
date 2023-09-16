const Joi = require('joi');

const validStrategies = ['Investor', 'Trader'];

exports.strategyValidationSchema = Joi.object({
    name: Joi.string().valid(...validStrategies).required(),
});


exports.updateStrategySchema = Joi.object({
    name: Joi.string().valid('Investor', 'Trader').optional(),
});