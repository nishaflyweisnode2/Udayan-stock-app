const express = require('express');
const router = express.Router();

const { createTutorial, getAllTutorials, getTutorialById, updateTutorialById, deleteTutorialById, trackView, likeTutorial } = require('../controllers/investing&TradingTutorialController');

const { tutorialSchema } = require('../validation/investing&TradingTutorialValidation');

const authJwt = require("../middleware/auth");


router.post('/api/create', [authJwt.verifyToken], createTutorial);
router.get('/api/', [authJwt.verifyToken], getAllTutorials);
router.get('/api/:id', [authJwt.verifyToken], getTutorialById);
router.put('/api/:id', [authJwt.verifyToken], updateTutorialById);
router.delete('/api/:id', [authJwt.verifyToken], deleteTutorialById);
router.put('/api/tutorials/:id/view', [authJwt.verifyToken], trackView);
router.put('/api/tutorials/:id/like', [authJwt.verifyToken], likeTutorial);



module.exports = router;
