const Broker = require('../models/brokerModel');

const { brokerValidationSchema, validateBroker } = require('../validation/brokerValidation');



exports.addBroker = async (req, res) => {
    try {
        const brokerData = req.body;

        const { error } = brokerValidationSchema.validate(req.body);
        if (error) {
            return res.status(400).json({ error: error.details[0].message });
        }

        if (!req.file) {
            return res.status(400).json({ error: "Image file is required" });
        }

        const experienceYears = brokerData.experience.experienceYears;

        const [startYear, endYear] = experienceYears.split('-').map(Number);
        const yearsOfExperience = endYear - startYear;

        brokerData.experience.yearsOfExperience = yearsOfExperience;

        const broker = new Broker({
            ...brokerData,
            image: req.file.path,
        });
        await broker.save();

        res.status(201).json({ status: 201, message: 'Broker added successfully', data: broker });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error', details: error.message });
    }
};


exports.updateBroker = async (req, res) => {
    try {
        const brokerId = req.params.brokerId;

        const brokerData = req.body;

        const { error } = validateBroker.validate(req.body);
        if (error) {
            return res.status(400).json({ error: error.details[0].message });
        }

        if (!req.file) {
            return res.status(400).json({ error: "Image file is required" });
        }

        const experienceYears = brokerData.experience.experienceYears;

        const [startYear, endYear] = experienceYears.split('-').map(Number);
        const yearsOfExperience = endYear - startYear;

        brokerData.experience.yearsOfExperience = yearsOfExperience;

        const updatedBroker = await Broker.findByIdAndUpdate(
            brokerId,
            {
                ...brokerData,
                image: req.file.path,
            },
            { new: true }
        );

        if (!updatedBroker) {
            return res.status(404).json({ status: 404, message: 'Broker not found' });
        }

        return res.status(200).json({ status: 200, message: 'Broker updated successfully', data: updatedBroker });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Internal server error', details: error.message });
    }
};



exports.getAllBrokers = async (req, res) => {
    try {
        const brokers = await Broker.find();
        res.status(200).json({ status: 200, message: 'All brokers retrieved successfully', data: brokers });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error', details: error.message });
    }
};


exports.getBroker = async (req, res) => {
    try {
        const brokerId = req.params.brokerId;

        const broker = await Broker.findById(brokerId);

        if (!broker) {
            return res.status(404).json({ status: 404, message: 'Broker not found' });
        }

        return res.status(200).json({ status: 200, data: broker });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Internal server error', details: error.message });
    }
};


exports.deleteBroker = async (req, res) => {
    try {
        const brokerId = req.params.brokerId;

        const deletedBroker = await Broker.findByIdAndDelete(brokerId);

        if (!deletedBroker) {
            return res.status(404).json({ status: 404, message: 'Broker not found' });
        }

        return res.status(200).json({ status: 200, message: 'Broker deleted successfully' });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Internal server error', details: error.message });
    }
};


exports.getPopularBroker = async (req, res) => {
    try {
        const topBrokers = await Broker.find()
            .sort({ "experience.experienceYears": -1 })
            .limit(10);

        res.status(200).json({ brokers: topBrokers });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error', details: error.message });
    }
};

