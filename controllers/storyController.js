const Story = require('../models/storyModel');
const User = require('../models/userModel');

const { storyValidationSchema } = require('../validation/storyValidation');



exports.createStory = async (req, res) => {
    try {
        const { error } = storyValidationSchema.validate(req.body);
        if (error) {
            return res.status(400).json({ error: error.details[0].message });
        }

        const { title, content } = req.body;
        const userId = req.user.id;

        if (!req.file) {
            return res.status(400).json({ status: 400, message: "Image file is required" });
        }

        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({ status: 404, message: 'User not found' });
        }

        const story = new Story({
            title,
            content,
            image: req.file.path,
        });

        await story.save();

        res.status(201).json({ message: 'Story created successfully', data: story });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error', details: error.message });
    }
};


exports.getAllStories = async (req, res) => {
    try {
        const stories = await Story.find();

        res.status(200).json({ status: 200, message: 'Sucessfully', data: stories });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error', details: error.message });
    }
};


exports.getStoryById = async (req, res) => {
    try {
        const story = await Story.findById(req.params.id);

        if (!story) {
            return res.status(404).json({ status: 404, message: 'Story not found' });
        }

        res.status(200).json({ status: 200, message: 'Sucessfully', data: story });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error', details: error.message });
    }
};


exports.updateStory = async (req, res) => {
    try {
        const { title, content } = req.body;
        const userId = req.user.id;

        if (!req.file) {
            return res.status(400).json({ status: 400, message: "Image file is required" });
        }

        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({ status: 404, message: 'User not found' });
        }
        const story = await Story.findByIdAndUpdate(
            req.params.id,
            {
                title,
                content,
                image: req.file.path,
            },
            { new: true }
        );

        if (!story) {
            return res.status(404).json({ status: 404, message: 'Story not found' });
        }

        res.status(200).json({ status: 200, message: 'Story updated successfully', data: story });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error', details: error.message });
    }
};


exports.deleteStory = async (req, res) => {
    try {
        const story = await Story.findByIdAndRemove(req.params.id);

        if (!story) {
            return res.status(404).json({ status: 404, message: 'Story not found' });
        }

        res.status(200).json({ status: 200, message: 'Story deleted successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error', details: error.message });
    }
};
