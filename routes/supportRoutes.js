const express = require('express');
const router = express.Router();

const { createSupportRequest, getAllSupportRequests } = require('../controllers/supportController');

const authJwt = require("../middleware/auth");



router.post('/api/support-requests', [authJwt.verifyToken], createSupportRequest);

router.get('/api/supportRequests', [authJwt.verifyToken], getAllSupportRequests);


module.exports = router;
