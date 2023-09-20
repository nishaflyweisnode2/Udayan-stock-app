const HelpRequest = require('../models/helpModel');



exports.createHelpRequest = async (req, res) => {
    try {
        const { email, description } = req.body;

        const helpRequest = new HelpRequest({
            email,
            description,
        });

        await helpRequest.save();

        return res.status(201).json({
            status: 201,
            message: 'Help request created successfully',
            data: helpRequest,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error', details: error.message });
    }
};


exports.getAllHelpRequests = async (req, res) => {
    try {
        const helpRequests = await HelpRequest.find();
        res.status(200).json({ status: 200, data: helpRequests });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ status: 500, message: 'Internal server error' });
    }
};


exports.getHelpRequestById = async (req, res) => {
    try {
        const helpRequestId = req.params.id;
        const helpRequest = await HelpRequest.findById(helpRequestId);

        if (!helpRequest) {
            return res.status(404).json({ status: 404, message: 'Help request not found' });
        }

        return res.status(200).json({ status: 200, data: helpRequest });
    } catch (error) {
        console.error(error);
        res.status(500).json({ status: 500, message: 'Internal server error' });
    }
};
