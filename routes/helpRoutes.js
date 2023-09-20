const express = require('express');
const router = express.Router();

const helpController = require('../controllers/helpController');

const authJwt = require("../middleware/auth");



router.post('/api/help', [authJwt.verifyToken], helpController.createHelpRequest);
router.get('/api/help', [authJwt.verifyToken], helpController.getAllHelpRequests);
router.get('/api/help/:id', [authJwt.verifyToken], helpController.getHelpRequestById);


module.exports = router;
