const Tutorial = require('../models/investing&TradingTutorialModel');

const { tutorialSchema, tutorialUpdateSchema } = require('../validation/investing&TradingTutorialValidation');


exports.createTutorial = async (req, res) => {
  try {
    const { error } = tutorialSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const { title, content, videoLink } = req.body;

    const tutorial = new Tutorial({
      title,
      content,
      videoLink,
    });

    await tutorial.save();

    res.status(201).json({ status: 201, message: 'Tutorial created successfully', data: tutorial });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error', details: error.message });
  }
};


exports.getAllTutorials = async (req, res) => {
  try {
    const tutorials = await Tutorial.find();
    res.status(200).json({ status: 200, message: 'Successfully', tutorials });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error', details: error.message });
  }
};


exports.getTutorialById = async (req, res) => {
  try {
    const tutorialId = req.params.id;
    const tutorial = await Tutorial.findById(tutorialId);

    if (!tutorial) {
      return res.status(404).json({ status: 404, message: 'Tutorial not found' });
    }

    res.status(200).json({ status: 200, message: 'Successfully', tutorial });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error', details: error.message });
  }
};


exports.updateTutorialById = async (req, res) => {
  try {
    const tutorialId = req.params.id;
    const { title, content, videoLink } = req.body;

    const { error } = tutorialUpdateSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const updatedTutorial = await Tutorial.findByIdAndUpdate(
      tutorialId,
      { title, content, videoLink },
      { new: true }
    );

    if (!updatedTutorial) {
      return res.status(404).json({ status: 404, message: 'Tutorial not found' });
    }

    res.status(200).json({ status: 200, message: 'Tutorial updated successfully', data: updatedTutorial });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error', details: error.message });
  }
};


exports.deleteTutorialById = async (req, res) => {
  try {
    const tutorialId = req.params.id;
    const deletedTutorial = await Tutorial.findByIdAndDelete(tutorialId);

    if (!deletedTutorial) {
      return res.status(404).json({ status: 404, message: 'Tutorial not found' });
    }

    res.status(200).json({ status: 200, message: 'Tutorial deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error', details: error.message });
  }
};


exports.trackView = async (req, res) => {
  try {
    const tutorialId = req.params.id;
    const tutorial = await Tutorial.findByIdAndUpdate(
      tutorialId,
      { $inc: { views: 1 } },
      { new: true }
    );

    if (!tutorial) {
      return res.status(404).json({ status: 404, message: 'Tutorial not found' });
    }

    res.status(200).json({ status: 200, message: 'View tracked successfully', data: tutorial });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error', details: error.message });
  }
};


exports.likeTutorial = async (req, res) => {
  try {
    const tutorialId = req.params.id;
    const tutorial = await Tutorial.findByIdAndUpdate(
      tutorialId,
      { $inc: { likes: 1 } },
      { new: true }
    );

    if (!tutorial) {
      return res.status(404).json({ status: 404, message: 'Tutorial not found' });
    }

    res.status(200).json({ status: 200, message: 'Like counted successfully', data: tutorial });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error', details: error.message });
  }
};
