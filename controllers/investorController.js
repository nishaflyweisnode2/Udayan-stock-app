const InvestorType = require('../models/investorModel');
const Strategy = require('../models/strategyModel');

const { investorValidationSchema, updateInvestorSchema } = require('../validation/investorValidation');



exports.createInvestorType = async (req, res) => {
    try {
        const { strategy, name, title, description } = req.body;

        const { error, value } = investorValidationSchema.validate({ strategy, name, title, description });

        if (error) {
            return res.status(400).json({ message: 'Invalid plan ID', error: error.details[0].message });
        }

        const existingStrategyType = await Strategy.findOne({ _id: strategy });

        if (!existingStrategyType) {
            return res.status(404).json({ status: 404, message: 'StrategyId Not Found' });
        }

        const investorType = new InvestorType({ strategy, name, title, description });
        console.log("strategyId", strategy);
        await investorType.save();

        res.status(201).json({ status: 201, message: 'Investor type created successfully', data: investorType });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error', details: error.message });
    }
};


exports.getAllInvestorTypes = async (req, res) => {
    try {
        const investorTypes = await InvestorType.find();
        res.status(200).json({ status: 200, message: 'Sucessfully', data: investorTypes });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error', details: error.message });
    }
};


exports.getInvestorTypeByName = async (req, res) => {
    try {
        const name = req.params.name;
        const investorType = await InvestorType.find({ name });

        if (!investorType) {
            return res.status(404).json({ status: 404, message: 'Investor type not found' });
        }

        res.status(200).json({ status: 200, message: 'Successfully found investor type', data: investorType });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error', details: error.message });
    }
};



