const express = require('express');
const router = express.Router();

const { createStory, getAllStories, getStoryById, updateStory, deleteStory } = require('../controllers/storyController');

const { storyValidationSchema } = require('../validation/storyValidation');

const { storyImage } = require('../middleware/imageUpload');

const authJwt = require("../middleware/auth");



router.post('/api/stories', [authJwt.verifyToken], storyImage.single('image'), createStory);
router.get('/api/stories', [authJwt.verifyToken], getAllStories);
router.get('/api/stories/:id', [authJwt.verifyToken], getStoryById);
router.put('/api/stories/:id', [authJwt.verifyToken], storyImage.single('image'), updateStory);
router.delete('/api/stories/:id', [authJwt.verifyToken], deleteStory);

module.exports = router;
