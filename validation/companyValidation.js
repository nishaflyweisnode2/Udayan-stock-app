const Joi = require('joi');



exports.validateCompany = Joi.object({
    symbol: Joi.string().required(),
    inst: Joi.string().required(),
    exchange: Joi.string().required(),
    description: Joi.string(),
    startDate: Joi.string(),
    endDate: Joi.string(),
    price: Joi.number(),
});


exports.updateValidateCompany = Joi.object({
    symbol: Joi.string(),
    description: Joi.string(),
    price: Joi.number(),
});


exports.performanceValidation = (req, res, next) => {
    const schema = Joi.object({
        date: Joi.date().required(),
        Volume: Joi.number().required(),
        PreviousClose: Joi.number().required(),
        Open: Joi.number().required(),
        TodayLow: Joi.number().required(),
        TodayHigh: Joi.number().required(),
    });

    const { error } = schema.validate(req.body);

    if (error) {
        return res.status(400).json({ error: error.details[0].message });
    }

    next();
};


exports.createFundamentalsSchema = (req, res, next) => {
    const schema = Joi.object({
        marketCap: Joi.number().required(),
        roe: Joi.number().required(),
        peRatio: Joi.number().required(),
        pbRatio: Joi.number().required(),
        divYeild: Joi.number().required(),
        industryPe: Joi.number().required(),
        bookValue: Joi.number().required(),
        debtToEquity: Joi.number().required(),
        faceValue: Joi.number().required(),
    });
    const { error } = schema.validate(req.body);
    if (error) {
        return res.status(400).json({ error: error.details[0].message });
    }

    next();
}


exports.validateDailyStats = (req, res, next) => {
    const schema = Joi.object({
        DailyOpen: Joi.number(),
        DailyHigh: Joi.number(),
        DailyLow: Joi.number(),
        DailyClose: Joi.number(),
        DailyVolume: Joi.number(),
        MarketCap: Joi.number(),
    });

    const { error } = schema.validate(req.body);

    if (error) {
        return res.status(400).json({ error: error.details[0].message });
    }

    next();
};
