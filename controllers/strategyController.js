const Strategy = require('../models/strategyModel');

const { strategyValidationSchema, updateStrategySchema } = require('../validation/strategyValidation');



exports.createStrategy = async (req, res) => {
    try {
        const { name } = req.body;

        const { error, value } = strategyValidationSchema.validate(req.body);

        if (error) {
            return res.status(400).json({ message: 'Invalid plan ID', error: error.details[0].message });
        }

        if (!req.file) {
            return res.status(400).json({ status: 400, message: "Image file is required" });
        }

        const existingStrategy = await Strategy.findOne({ name });

        if (existingStrategy) {
            return res.status(400).json({ status: 404, message: 'Strategy name already exists' });
        }

        const strategy = new Strategy({ name, image: req.file.path, });
        await strategy.save();

        res.status(201).json({ status: 201, message: 'Strategy created successfully', data: strategy });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error', details: error.message });
    }
};


exports.getAllStrategies = async (req, res) => {
    try {
        const strategies = await Strategy.find();
        res.status(200).json({ status: 200, message: 'Sucessfully', data: strategies });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error', details: error.message });
    }
};


exports.updateStrategy = async (req, res) => {
    try {
        const strategyId = req.params.strategyId;
        const updatedData = req.body;

        const { error } = updateStrategySchema.validate(updatedData);
        if (error) {
            return res.status(400).json({ error: error.details[0].message });
        }

        if (!req.file) {
            return res.status(400).json({ status: 400, message: "Image file is required" });
        }

        const strategy = await Strategy.findByIdAndUpdate(strategyId, { ...updatedData, image: req.file.path }, { new: true });

        if (!strategy) {
            return res.status(404).json({ status: 404, message: 'Strategy not found' });
        }

        return res.status(200).json({ status: 200, message: 'Strategy updated successfully', data: strategy });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Internal server error', details: error.message });
    }
};


exports.deleteStrategy = async (req, res) => {
    try {
        const strategyId = req.params.strategyId;

        const strategy = await Strategy.findById(strategyId);

        if (!strategy) {
            return res.status(404).json({ status: 404, message: 'Strategy not found' });
        }

        await Strategy.findByIdAndRemove(strategyId);

        return res.status(200).json({ status: 200, message: 'Strategy deleted successfully' });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Internal server error', details: error.message });
    }
};



