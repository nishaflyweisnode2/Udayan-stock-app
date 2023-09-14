const Joi = require('joi');


exports.stockValidation = Joi.object({
    symbol: Joi.string().required(),
    name: Joi.string().required(),
    currentPrice: Joi.number().required(),
    volume: Joi.number(),
    marketCap: Joi.number(),
    company: Joi.string().required()
});


exports.stockUpdateValidation = Joi.object({
    symbol: Joi.string().optional(),
    name: Joi.string().optional(),
    currentPrice: Joi.number().optional(),
    volume: Joi.number().optional(),
    marketCap: Joi.number().optional(),
});

