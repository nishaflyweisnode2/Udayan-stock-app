const SupportRequest = require('../models/supportModel');

const { supportRequestSchema } = require('../validation/supportValidation');


exports.createSupportRequest = async (req, res) => {
    try {
        const { description, mobile, email } = req.body;

        const { error, value } = supportRequestSchema.validate(req.body);

        if (error) {
            return res.status(400).json({ message: 'Invalid plan ID', error: error.details[0].message });
        }

        if (!description || !mobile || !email) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        const supportRequest = new SupportRequest({
            description,
            mobile,
            email
        });

        await supportRequest.save();

        return res.status(201).json({ data: supportRequest });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Server error' });
    }
};



exports.getAllSupportRequests = async (req, res) => {
    try {
        const supportRequests = await SupportRequest.find();
        return res.status(200).json(supportRequests);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Internal server error' });
    }
};

