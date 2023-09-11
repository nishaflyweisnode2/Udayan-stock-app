const Feedback = require('../models/feedBackModel');

const { feedbackSchema, feedbackIdSchema } = require('../validation/feedbackValidation');



exports.createFeedback = async (req, res) => {
    try {
        const user = req.user
        const { email, feedbackText } = req.body;

        const { error, value } = feedbackSchema.validate({ email, feedbackText });

        if (error) {
            return res.status(400).json({ message: 'Invalid plan ID', error: error.details[0].message });
        }
        
        if (!email || !feedbackText) {
            return res.status(400).json({ error: 'Email and feedback text are required' });
        }

        const feedback = new Feedback({
            userId: user._id,
            email,
            feedbackText,
        });

        await feedback.save();

        return res.status(201).json(feedback);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Internal server error' });
    }
};


exports.getAllFeedback = async (req, res) => {
    try {
        const feedback = await Feedback.find();
        return res.status(200).json(feedback);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Internal server error' });
    }
};


exports.getFeedbackById = async (req, res) => {
    try {
        const feedbackId = req.params.id;
        const { error, value } = feedbackIdSchema.validate(req.params);

        if (error) {
            return res.status(400).json({ message: 'Invalid plan ID', error: error.details[0].message });
        }
        const feedback = await Feedback.findById(feedbackId);

        if (!feedback) {
            return res.status(404).json({ error: 'Feedback not found' });
        }

        return res.status(200).json(feedback);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Internal server error' });
    }
};

