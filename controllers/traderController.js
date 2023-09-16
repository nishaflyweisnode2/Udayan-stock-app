const TraderType = require('../models/traderModel');

const { traderValidationSchema, } = require('../validation/tradervalidation');


exports.createTraderType = async (req, res) => {
    try {
        const { strategy, name, title, description } = req.body;

        const { error, value } = traderValidationSchema.validate({ strategy, name, title, description });

        if (error) {
            return res.status(400).json({ message: 'Invalid plan ID', error: error.details[0].message });
        }
        const traderType = new TraderType({ strategy, name, title, description });
        await traderType.save();
        res.status(201).json({ status: 201, message: 'Trader Type created successfully', data: traderType });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error', details: error.message });
    }
};


exports.getAllTraderTypes = async (req, res) => {
    try {
        const trader = await TraderType.find();
        res.status(200).json({ status: 200, message: 'Sucessfully', data: trader });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error', details: error.message });
    }
};


exports.getTraderTypeByName = async (req, res) => {
    try {
        const name = req.params.name;
        const traderType = await TraderType.find({ name });

        if (!traderType) {
            return res.status(404).json({ status: 404, message: 'Trader type not found' });
        }

        res.status(200).json({ status: 200, message: 'Successfully found Trader type', data: traderType });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error', details: error.message });
    }
};