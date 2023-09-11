const express = require('express');
const router = express.Router();

const { createFeedback, getAllFeedback, getFeedbackById } = require('../controllers/feedbackController');

const authJwt = require("../middleware/auth");


router.post('/api/feedback', [authJwt.verifyToken], createFeedback);

router.get('/api/feedback', [authJwt.verifyToken], getAllFeedback);

router.get('/api/feedback/:id', [authJwt.verifyToken], getFeedbackById);


module.exports = router;
